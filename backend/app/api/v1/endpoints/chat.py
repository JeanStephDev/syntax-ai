"""
Chat endpoints v2 — Hybrid + Solo, translate, streaming, access control
"""

import json
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel

from app.core.database import get_db
from app.core.config import settings
from app.core.redis import increment_daily_tokens
from app.models.models import (
    User, APIKey, Conversation, Message,
    MessageRole, ChatMode, SoloProvider, TokenUsage,
)
from app.services.ai.orchestrator import (
    get_hybrid_orchestrator, get_solo_orchestrator,
    HybridResponse, SoloResponse,
)
from app.services.translate.translate_service import translate_hybrid, translate_solo
from app.api.v1.deps import (
    get_current_user, check_daily_quota, rate_limit,
    require_mode, get_current_api_key,
)

router = APIRouter()


# ─── Schemas ──────────────────────────────────────────────────────────────────

class MessageInput(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    # Mode
    mode:    str = "hybrid"          # "hybrid" | "solo"
    # Modèle
    model:   str = "syntax-free-1"   # hybrid: syntax-pro-1 | solo: claude-sonnet
    # Messages
    messages: List[MessageInput]
    # Options
    conversation_id: Optional[str] = None
    stream: bool = True
    # Langue (override les préférences user)
    target_language: Optional[str] = None


# ─── Endpoint principal (JWT) ─────────────────────────────────────────────────

@router.post("/completions")
async def chat_completions(
    req: ChatRequest,
    current_user: User = Depends(rate_limit),
    db: AsyncSession = Depends(get_db),
):
    """Chat avec JWT. Vérifie plan, mode, modèle, quota."""

    # 1. Vérifier le mode
    if not current_user.can_use_mode(req.mode):
        raise HTTPException(403, {
            "error":   "mode_not_allowed",
            "message": "Le mode Solo nécessite le plan Starter ou supérieur.",
            "upgrade_url": "https://ai.syntax-lab.site/pricing",
        })

    # 2. Vérifier le modèle
    if not current_user.can_use_model(req.model, req.mode):
        tier_map = {**{k: v["tier"] for k, v in settings.HYBRID_MODELS.items()},
                    **{k: v["tier"] for k, v in settings.SOLO_MODELS.items()}}
        required = tier_map.get(req.model, "pro")
        raise HTTPException(403, {
            "error":         "model_not_allowed",
            "message":       f"Ce modèle nécessite le plan {required}.",
            "required_plan": required,
            "upgrade_url":   "https://ai.syntax-lab.site/pricing",
        })

    # 3. Langue cible
    target_lang   = req.target_language or current_user.ai_language or "fr"
    translate_on  = current_user.translate_enabled
    preserve_code = current_user.preserve_code

    # 4. Conversation
    conv_id = req.conversation_id
    if not conv_id:
        conv = Conversation(
            user_id=current_user.id,
            mode=ChatMode.HYBRID if req.mode == "hybrid" else ChatMode.SOLO,
            model_id=req.model,
        )
        db.add(conv)
        await db.flush()
        conv_id = conv.id

    last_msg = req.messages[-1].content
    history  = [{"role": m.role, "content": m.content} for m in req.messages[:-1]]

    # 5. Dispatch
    if req.mode == "hybrid":
        if req.stream:
            return StreamingResponse(
                _stream_hybrid(get_hybrid_orchestrator(req.model), last_msg, history,
                               conv_id, current_user, target_lang, translate_on, preserve_code, db),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
            )
        result = await get_hybrid_orchestrator(req.model).run(last_msg, history)
        if translate_on and target_lang != "fr":
            result.backend_response, result.frontend_response, result.assets_docs_response = \
                await translate_hybrid(result.backend_response, result.frontend_response,
                                       result.assets_docs_response, target_lang, preserve_code)
        await _save_hybrid(db, conv_id, last_msg, result)
        await _track(db, current_user.id, req.model, "hybrid", result.total_tokens)
        await increment_daily_tokens(current_user.id, result.total_tokens)
        return _hybrid_response(result, conv_id)

    else:  # solo
        orch = get_solo_orchestrator(req.model)
        if req.stream:
            return StreamingResponse(
                _stream_solo(orch, last_msg, history, conv_id,
                             current_user, target_lang, translate_on, preserve_code, db),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
            )
        result = await orch.run(last_msg, history)
        if translate_on and target_lang != "fr":
            result.content = await translate_solo(result.content, target_lang, preserve_code)
        await _save_solo(db, conv_id, last_msg, result)
        await _track(db, current_user.id, req.model, "solo", result.total_tokens)
        await increment_daily_tokens(current_user.id, result.total_tokens)
        return _solo_response(result, conv_id)


# ─── Endpoint API Key (externe / reseller) ────────────────────────────────────

@router.post("/api/completions")
async def api_completions(
    req: ChatRequest,
    authorization: str = Header(...),
    origin: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    """Chat via clé API. Pas besoin de JWT."""
    api_key, user = await get_current_api_key.__wrapped__(
        None, authorization, origin, db  # type: ignore
    )
    # Appel simplifié sans stream pour l'API externe
    req.stream = False
    target_lang   = req.target_language or user.ai_language or "fr"
    preserve_code = user.preserve_code

    if req.mode == "hybrid":
        result = await get_hybrid_orchestrator(req.model).run(
            req.messages[-1].content,
            [{"role": m.role, "content": m.content} for m in req.messages[:-1]],
        )
        if target_lang != "fr":
            result.backend_response, result.frontend_response, result.assets_docs_response = \
                await translate_hybrid(result.backend_response, result.frontend_response,
                                       result.assets_docs_response, target_lang, preserve_code)
        tokens = result.total_tokens
        response_data = _hybrid_response(result, None)
    else:
        result = await get_solo_orchestrator(req.model).run(
            req.messages[-1].content,
            [{"role": m.role, "content": m.content} for m in req.messages[:-1]],
        )
        if target_lang != "fr":
            result.content = await translate_solo(result.content, target_lang, preserve_code)
        tokens = result.total_tokens
        response_data = _solo_response(result, None)

    # Mettre à jour les stats de la clé API
    from datetime import datetime
    api_key.tokens_used_month += tokens
    api_key.total_tokens      += tokens
    api_key.total_requests    += 1
    api_key.last_used_at       = datetime.utcnow()
    await db.commit()

    # Appel webhook si configuré
    if api_key.webhook_url:
        import httpx, asyncio
        asyncio.create_task(_call_webhook(api_key.webhook_url, {
            "api_key_id": api_key.id, "tokens": tokens, "model": req.model,
        }))

    response_data["usage"] = {
        "tokens_used": tokens,
        "tokens_remaining": (
            api_key.monthly_token_limit - api_key.tokens_used_month
            if api_key.monthly_token_limit else "unlimited"
        ),
    }
    return response_data


# ─── Streaming generators ─────────────────────────────────────────────────────

async def _stream_hybrid(orch, message, history, conv_id, user, target_lang, translate_on, preserve_code, db):
    backend_parts, frontend_parts, docs_parts = [], [], []
    total_tokens = 0

    try:
        async for chunk in orch.stream(message, history):
            data = {"provider": chunk.provider, "role": chunk.role,
                    "content": chunk.content, "is_final": chunk.is_final}
            yield f"data: {json.dumps(data, ensure_ascii=False)}\n\n"

            if not chunk.is_final:
                if chunk.role == "backend":    backend_parts.append(chunk.content)
                elif chunk.role == "frontend": frontend_parts.append(chunk.content)
                elif chunk.role == "assets_docs": docs_parts.append(chunk.content)

        # Post-traduction si nécessaire
        backend  = "".join(backend_parts)
        frontend = "".join(frontend_parts)
        docs     = "".join(docs_parts)

        if translate_on and target_lang != "fr":
            backend, frontend, docs = await translate_hybrid(
                backend, frontend, docs, target_lang, preserve_code
            )
            # Envoyer la traduction
            yield f"data: {json.dumps({'translated': True, 'backend': backend, 'frontend': frontend, 'docs': docs}, ensure_ascii=False)}\n\n"

        await _track(db, user.id, orch.model_config.get("display_name","syntax"), "hybrid", total_tokens)
        await increment_daily_tokens(user.id, total_tokens)
        yield f"data: {json.dumps({'done': True, 'conversation_id': conv_id})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


async def _stream_solo(orch, message, history, conv_id, user, target_lang, translate_on, preserve_code, db):
    parts = []
    try:
        async for chunk in orch.stream(message, history):
            data = {"provider": chunk.provider, "role": chunk.role,
                    "content": chunk.content, "is_final": chunk.is_final}
            yield f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
            if not chunk.is_final:
                parts.append(chunk.content)

        content = "".join(parts)
        if translate_on and target_lang != "fr":
            content = await translate_solo(content, target_lang, preserve_code)
            yield f"data: {json.dumps({'translated': True, 'content': content}, ensure_ascii=False)}\n\n"

        yield f"data: {json.dumps({'done': True, 'conversation_id': conv_id})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _hybrid_response(result: HybridResponse, conv_id):
    return {
        "mode":          "hybrid",
        "model":         result.model_id,
        "backend":       result.backend_response,
        "frontend":      result.frontend_response,
        "assets_docs":   result.assets_docs_response,
        "sync_contract": result.sync_contract,
        "total_tokens":  result.total_tokens,
        "conversation_id": conv_id,
    }

def _solo_response(result: SoloResponse, conv_id):
    return {
        "mode":          "solo",
        "provider":      result.provider,
        "model":         result.model_id,
        "model_used":    result.model_used,
        "content":       result.content,
        "total_tokens":  result.total_tokens,
        "conversation_id": conv_id,
    }

async def _save_hybrid(db, conv_id, user_msg, result: HybridResponse):
    db.add(Message(conversation_id=conv_id, role=MessageRole.USER, content=user_msg))
    for content, provider, role in [
        (result.backend_response,      "claude",  "backend"),
        (result.frontend_response,     "openai",  "frontend"),
        (result.assets_docs_response,  "gemini",  "assets_docs"),
    ]:
        db.add(Message(conversation_id=conv_id, role=MessageRole.ASSISTANT,
                       content=content, provider=provider, code_role=role))
    await db.commit()

async def _save_solo(db, conv_id, user_msg, result: SoloResponse):
    db.add(Message(conversation_id=conv_id, role=MessageRole.USER, content=user_msg))
    db.add(Message(conversation_id=conv_id, role=MessageRole.ASSISTANT,
                   content=result.content, provider=result.provider))
    await db.commit()

async def _track(db, user_id, model_id, mode, tokens):
    db.add(TokenUsage(
        user_id=user_id, model_id=model_id, mode=mode,
        provider=mode, date=datetime.utcnow().strftime("%Y-%m-%d"),
        total_tokens=tokens, request_count=1,
    ))
    await db.commit()

async def _call_webhook(url: str, payload: dict):
    import httpx
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(url, json=payload)
    except Exception:
        pass
