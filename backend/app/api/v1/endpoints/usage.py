"""
Endpoint Usage & Tokens - Syntax AI
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.models import User, TokenUsage
from app.api.v1.deps import get_current_user
from app.core.config import settings

router = APIRouter()


@router.get("/")
async def get_usage(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Usage de tokens de l'utilisateur"""
    today = datetime.utcnow().strftime("%Y-%m-%d")
    month_start = datetime.utcnow().replace(day=1).strftime("%Y-%m-%d")

    # Usage aujourd'hui
    today_result = await db.execute(
        select(func.sum(TokenUsage.total_tokens))
        .where(TokenUsage.user_id == current_user.id, TokenUsage.date == today)
    )
    today_tokens = today_result.scalar() or 0

    # Usage ce mois
    month_result = await db.execute(
        select(func.sum(TokenUsage.total_tokens))
        .where(TokenUsage.user_id == current_user.id, TokenUsage.date >= month_start)
    )
    month_tokens = month_result.scalar() or 0

    # Limite journalière
    daily_limit = settings.TOKEN_LIMITS.get(current_user.plan.value, 100_000)

    return {
        "plan": current_user.plan.value,
        "today": {
            "used": today_tokens,
            "limit": daily_limit,
            "remaining": max(0, daily_limit - today_tokens),
            "percentage": round((today_tokens / daily_limit * 100), 1) if daily_limit > 0 else 0,
        },
        "month": {
            "used": month_tokens,
        },
        "reset_at": (datetime.utcnow() + timedelta(days=1)).replace(
            hour=0, minute=0, second=0
        ).isoformat() + "Z",
    }


@router.get("/history")
async def get_usage_history(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Historique d'usage sur N jours"""
    since = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")

    result = await db.execute(
        select(TokenUsage)
        .where(TokenUsage.user_id == current_user.id, TokenUsage.date >= since)
        .order_by(TokenUsage.date.desc())
    )
    usages = result.scalars().all()

    return {
        "history": [
            {
                "date": u.date,
                "model": u.model_id,
                "tokens": u.total_tokens,
                "requests": u.request_count,
            }
            for u in usages
        ]
    }
