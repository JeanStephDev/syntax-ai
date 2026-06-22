"""
Dépendances FastAPI v2 — Auth, Rate Limit, Access Control
"""

from fastapi import Depends, HTTPException, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime
from typing import Optional

from app.core.database import get_db
from app.core.config import settings
from app.core.redis import check_rate_limit, check_token_quota, validate_reseller_domain
from app.models.models import User, APIKey, PlanType
from app.services.auth.auth_service import decode_token, get_user_by_id, get_api_key


# ─── Current User (JWT) ───────────────────────────────────────────────────────

async def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Token manquant. Format: 'Bearer <token>'")

    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_token(token)

    if not payload or payload.get("type") != "access":
        raise HTTPException(401, "Token invalide ou expiré")

    user = await get_user_by_id(db, payload["sub"])
    if not user:
        raise HTTPException(401, "Utilisateur introuvable")
    if not user.is_active:
        raise HTTPException(403, "Compte désactivé")
    return user


# ─── Rate Limit ───────────────────────────────────────────────────────────────

async def rate_limit(
    request: Request,
    current_user: User = Depends(get_current_user),
):
    """Applique le rate limit selon le plan de l'utilisateur"""
    identifier = f"user:{current_user.id}"
    allowed, remaining, retry = await check_rate_limit(identifier, current_user.plan.value)

    if not allowed:
        raise HTTPException(
            status_code=429,
            detail={
                "error":        "rate_limit_exceeded",
                "message":      f"Limite dépassée. Réessayez dans {retry}s.",
                "retry_after":  retry,
                "plan_limit":   settings.RATE_LIMITS.get(current_user.plan.value, 10),
            },
            headers={"Retry-After": str(retry), "X-RateLimit-Remaining": "0"},
        )
    return current_user


# ─── Token Quota ──────────────────────────────────────────────────────────────

async def check_daily_quota(
    current_user: User = Depends(get_current_user),
):
    """Vérifie que l'utilisateur n'a pas dépassé son quota journalier"""
    allowed, used, limit = await check_token_quota(current_user.id, current_user.plan.value)

    if not allowed:
        raise HTTPException(
            status_code=429,
            detail={
                "error":        "daily_quota_exceeded",
                "message":      f"Quota journalier atteint ({limit:,} tokens).",
                "tokens_used":  used,
                "tokens_limit": limit,
                "resets_at":    "minuit UTC",
                "upgrade_url":  "https://ai.syntax-lab.site/pricing",
            },
        )
    return current_user


# ─── Access Control : Mode ────────────────────────────────────────────────────

def require_mode(mode: str):
    """Factory: vérifie que l'utilisateur peut utiliser un mode (hybrid/solo)"""
    async def _check(current_user: User = Depends(check_daily_quota)):
        if not current_user.can_use_mode(mode):
            plan_needed = "starter"
            raise HTTPException(
                status_code=403,
                detail={
                    "error":         "mode_not_allowed",
                    "message":       f"Le mode '{mode}' nécessite le plan Starter ou supérieur.",
                    "current_plan":  current_user.plan.value,
                    "required_plan": plan_needed,
                    "upgrade_url":   "https://ai.syntax-lab.site/pricing",
                },
            )
        return current_user
    return _check


def require_model(model_id: str, mode: str):
    """Factory: vérifie que l'utilisateur peut utiliser un modèle spécifique"""
    async def _check(current_user: User = Depends(check_daily_quota)):
        if not current_user.can_use_model(model_id, mode):
            # Trouver le tier requis
            if mode == "hybrid":
                cfg = settings.HYBRID_MODELS.get(model_id, {})
            else:
                cfg = settings.SOLO_MODELS.get(model_id, {})
            required = cfg.get("tier", "pro")

            raise HTTPException(
                status_code=403,
                detail={
                    "error":         "model_not_allowed",
                    "message":       f"Le modèle '{model_id}' nécessite le plan {required}.",
                    "current_plan":  current_user.plan.value,
                    "required_plan": required,
                    "upgrade_url":   "https://ai.syntax-lab.site/pricing",
                },
            )
        return current_user
    return _check


# ─── API Key Auth (pour endpoints /api/*) ─────────────────────────────────────

async def get_current_api_key(
    request: Request,
    authorization: Optional[str] = Header(default=None),
    origin: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> tuple[APIKey, User]:
    """Authentifie via clé API sk-syntax-xxx"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Clé API manquante. Format: 'Bearer sk-syntax-xxx'")

    raw_key = authorization.removeprefix("Bearer ").strip()
    api_key = await get_api_key(db, raw_key)

    if not api_key:
        raise HTTPException(401, "Clé API invalide ou désactivée")

    # Validation domaine pour les clés Reseller
    if api_key.is_reseller and api_key.allowed_domains:
        domain_ok = await validate_reseller_domain(
            api_key.id, origin or "", api_key.allowed_domains
        )
        if not domain_ok:
            raise HTTPException(
                403,
                detail={
                    "error":            "domain_not_allowed",
                    "message":          f"L'origine '{origin}' n'est pas autorisée pour cette clé reseller.",
                    "allowed_domains":  api_key.allowed_domains,
                },
            )

    # Rate limit par clé API
    allowed, remaining, retry = await check_rate_limit(
        f"apikey:{api_key.id}",
        "reseller" if api_key.is_reseller else "pro",
    )
    if not allowed:
        raise HTTPException(
            429,
            detail={"error": "rate_limit_exceeded", "retry_after": retry},
            headers={"Retry-After": str(retry)},
        )

    # Vérifier quota mensuel
    if api_key.monthly_token_limit is not None:
        if api_key.tokens_used_month >= api_key.monthly_token_limit:
            raise HTTPException(
                429,
                detail={
                    "error":   "monthly_quota_exceeded",
                    "used":    api_key.tokens_used_month,
                    "limit":   api_key.monthly_token_limit,
                    "message": "Quota mensuel épuisé.",
                },
            )

    # Récupérer l'utilisateur propriétaire
    user = await get_user_by_id(db, api_key.user_id)
    if not user or not user.is_active:
        raise HTTPException(403, "Compte associé à cette clé désactivé")

    return api_key, user
