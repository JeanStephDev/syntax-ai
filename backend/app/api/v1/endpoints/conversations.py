"""
Conversations CRUD + Export ZIP — Syntax AI
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update, func
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.models.models import User, Conversation, Message, MessageRole, ChatMode
from app.api.v1.deps import get_current_user
from app.services.export.export_service import export_conversation_zip

router = APIRouter()


class RenameRequest(BaseModel):
    title: str


# ─── List ─────────────────────────────────────────────────────────────────────

@router.get("/")
async def list_conversations(
    page:     int = 1,
    per_page: int = 20,
    mode:     Optional[str] = None,
    search:   Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Liste les conversations avec pagination, filtres et recherche"""
    query = (
        select(Conversation)
        .where(Conversation.user_id == current_user.id, Conversation.is_archived == False)
        .order_by(Conversation.updated_at.desc())
    )

    if mode and mode in ("hybrid", "solo"):
        query = query.where(Conversation.mode == ChatMode(mode))

    if search:
        query = query.where(Conversation.title.ilike(f"%{search}%"))

    # Total
    count_q  = select(func.count()).select_from(query.subquery())
    total_r  = await db.execute(count_q)
    total    = total_r.scalar() or 0

    # Paginer
    query  = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    convs  = result.scalars().all()

    # Récupérer le dernier message pour preview
    conv_list = []
    for conv in convs:
        last_msg_r = await db.execute(
            select(Message)
            .where(Message.conversation_id == conv.id, Message.role == MessageRole.USER)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        last_msg = last_msg_r.scalar_one_or_none()
        msg_count_r = await db.execute(
            select(func.count()).where(Message.conversation_id == conv.id)
        )
        msg_count = msg_count_r.scalar() or 0

        conv_list.append({
            "id":         conv.id,
            "title":      conv.title,
            "mode":       conv.mode.value,
            "model_id":   conv.model_id,
            "preview":    (last_msg.content[:120] + "...") if last_msg and len(last_msg.content) > 120 else (last_msg.content if last_msg else ""),
            "msg_count":  msg_count,
            "created_at": conv.created_at.isoformat() if conv.created_at else None,
            "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
        })

    return {
        "conversations": conv_list,
        "total":         total,
        "page":          page,
        "per_page":      per_page,
        "pages":         (total + per_page - 1) // per_page,
    }


# ─── Get one + messages ───────────────────────────────────────────────────────

@router.get("/{conv_id}")
async def get_conversation(
    conv_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv = await _get_owned(conv_id, current_user.id, db)

    msgs_r = await db.execute(
        select(Message)
        .where(Message.conversation_id == conv_id)
        .order_by(Message.created_at)
    )
    messages = msgs_r.scalars().all()

    return {
        "id":        conv.id,
        "title":     conv.title,
        "mode":      conv.mode.value,
        "model_id":  conv.model_id,
        "messages": [
            {
                "id":         m.id,
                "role":       m.role.value,
                "content":    m.content,
                "provider":   m.provider,
                "code_role":  m.code_role,
                "tokens_in":  m.tokens_input,
                "tokens_out": m.tokens_output,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in messages
        ],
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
    }


# ─── Rename ───────────────────────────────────────────────────────────────────

@router.patch("/{conv_id}")
async def rename_conversation(
    conv_id: str,
    data: RenameRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv = await _get_owned(conv_id, current_user.id, db)
    conv.title = data.title[:255]
    await db.commit()
    return {"id": conv.id, "title": conv.title}


# ─── Archive ──────────────────────────────────────────────────────────────────

@router.post("/{conv_id}/archive")
async def archive_conversation(
    conv_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv = await _get_owned(conv_id, current_user.id, db)
    conv.is_archived = not conv.is_archived
    await db.commit()
    return {"id": conv.id, "is_archived": conv.is_archived}


# ─── Delete ───────────────────────────────────────────────────────────────────

@router.delete("/{conv_id}", status_code=204)
async def delete_conversation(
    conv_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv = await _get_owned(conv_id, current_user.id, db)
    await db.execute(delete(Message).where(Message.conversation_id == conv_id))
    await db.delete(conv)
    await db.commit()
    return Response(status_code=204)


# ─── Delete All ───────────────────────────────────────────────────────────────

@router.delete("/", status_code=204)
async def delete_all_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv_ids_r = await db.execute(
        select(Conversation.id).where(Conversation.user_id == current_user.id)
    )
    conv_ids = [row[0] for row in conv_ids_r.all()]
    if conv_ids:
        await db.execute(delete(Message).where(Message.conversation_id.in_(conv_ids)))
        await db.execute(delete(Conversation).where(Conversation.user_id == current_user.id))
    await db.commit()
    return Response(status_code=204)


# ─── Export ZIP ───────────────────────────────────────────────────────────────

@router.get("/{conv_id}/export")
async def export_conversation(
    conv_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Exporte la conversation en ZIP organisé :
    /backend/, /frontend/, /docs/, chat.md, README.md
    Disponible à partir du plan Pro.
    """
    # Vérifier le plan
    if current_user.plan.value in ("free", "starter"):
        raise HTTPException(403, {
            "error":         "plan_required",
            "message":       "L'export ZIP nécessite le plan Pro ou supérieur.",
            "required_plan": "pro",
            "upgrade_url":   "https://ai.syntax-lab.site/pricing",
        })

    conv = await _get_owned(conv_id, current_user.id, db)

    zip_bytes = await export_conversation_zip(db, conv_id, current_user.id)
    if not zip_bytes:
        raise HTTPException(404, "Impossible de générer l'export")

    filename = conv.title.replace(" ", "_").lower()[:40]
    return StreamingResponse(
        iter([zip_bytes]),
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="syntax-ai-{filename}.zip"'},
    )


# ─── Helper ───────────────────────────────────────────────────────────────────

async def _get_owned(conv_id: str, user_id: str, db: AsyncSession) -> Conversation:
    r = await db.execute(select(Conversation).where(Conversation.id == conv_id))
    conv = r.scalar_one_or_none()
    if not conv:
        raise HTTPException(404, "Conversation introuvable")
    if conv.user_id != user_id:
        raise HTTPException(403, "Accès refusé")
    return conv
