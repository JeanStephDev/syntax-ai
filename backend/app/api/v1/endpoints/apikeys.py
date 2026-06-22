"""
Endpoints gestion des clés API - Syntax AI
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.models.models import User, APIKey, APIKeyType, PlanType
from app.services.auth.auth_service import create_api_key
from app.api.v1.deps import get_current_user

router = APIRouter()

# Limites de clés API par plan
MAX_KEYS_PER_PLAN = {
    PlanType.FREE:    1,
    PlanType.STARTER: 3,
    PlanType.PRO:     10,
    PlanType.TEAM:    -1,  # illimité
}


class CreateKeyRequest(BaseModel):
    name: str = "Ma clé API"
    key_type: str = "user_free"   # user_free | user_pay
    allowed_domains: Optional[List[str]] = []


class KeyResponse(BaseModel):
    id: str
    name: str
    key: str           # Masqué après création : sk-syntax-***...xxx
    key_type: str
    tokens_used_month: int
    monthly_token_limit: Optional[int]
    total_requests: int
    is_active: bool
    created_at: str


@router.get("/")
async def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Liste les clés API de l'utilisateur"""
    result = await db.execute(
        select(APIKey).where(APIKey.user_id == current_user.id)
    )
    keys = result.scalars().all()

    return {
        "keys": [
            {
                "id": k.id,
                "name": k.name,
                "key_preview": f"{k.key[:18]}...{k.key[-4:]}",  # Masquer
                "key_type": k.key_type.value,
                "tokens_used_month": k.tokens_used_month,
                "monthly_token_limit": k.monthly_token_limit,
                "total_requests": k.total_requests,
                "is_active": k.is_active,
                "is_reseller": k.is_reseller,
                "allowed_domains": k.allowed_domains,
                "last_used_at": str(k.last_used_at) if k.last_used_at else None,
                "created_at": str(k.created_at),
            }
            for k in keys
        ],
        "plan": current_user.plan.value,
        "max_keys": MAX_KEYS_PER_PLAN.get(current_user.plan, 1),
    }


@router.post("/", status_code=201)
async def create_key(
    data: CreateKeyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Crée une nouvelle clé API.
    La clé complète n'est affichée QU'UNE SEULE FOIS à la création.
    """
    # Vérifier la limite de clés
    result = await db.execute(
        select(APIKey).where(APIKey.user_id == current_user.id, APIKey.is_active == True)
    )
    existing_keys = result.scalars().all()
    max_keys = MAX_KEYS_PER_PLAN.get(current_user.plan, 1)

    if max_keys != -1 and len(existing_keys) >= max_keys:
        raise HTTPException(
            403,
            f"Limite atteinte ({max_keys} clés). Passez à un plan supérieur."
        )

    # Valider le type
    try:
        key_type = APIKeyType(data.key_type)
    except ValueError:
        raise HTTPException(400, f"Type invalide: {data.key_type}")

    # Les clés USER_PAY nécessitent au moins le plan Starter
    if key_type == APIKeyType.USER_PAY and current_user.plan == PlanType.FREE:
        raise HTTPException(403, "Les clés API payantes nécessitent le plan Starter ou supérieur")

    # Les clés RESELLER nécessitent un abonnement reseller actif
    if key_type == APIKeyType.RESELLER:
        reseller_key = next((k for k in existing_keys if k.is_reseller), None)
        if not reseller_key:
            raise HTTPException(403, "Abonnement Reseller requis. Voir /billing/checkout/reseller")

    api_key, raw_key = await create_api_key(
        db,
        current_user.id,
        key_type,
        name=data.name,
    )

    # Mettre à jour les domaines autorisés
    if data.allowed_domains:
        api_key.allowed_domains = data.allowed_domains
        await db.commit()

    return {
        "message": "Clé créée. Sauvegardez-la maintenant, elle ne sera plus visible.",
        "key": raw_key,   # Affiché UNE SEULE FOIS
        "id": api_key.id,
        "name": api_key.name,
        "key_type": api_key.key_type.value,
        "monthly_token_limit": api_key.monthly_token_limit,
    }


@router.delete("/{key_id}")
async def revoke_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Révoquer une clé API"""
    result = await db.execute(
        select(APIKey).where(
            APIKey.id == key_id,
            APIKey.user_id == current_user.id,
        )
    )
    key = result.scalar_one_or_none()
    if not key:
        raise HTTPException(404, "Clé introuvable")

    key.is_active = False
    await db.commit()

    return {"message": "Clé révoquée avec succès"}


@router.patch("/{key_id}")
async def update_key(
    key_id: str,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Modifier le nom ou les domaines d'une clé"""
    result = await db.execute(
        select(APIKey).where(APIKey.id == key_id, APIKey.user_id == current_user.id)
    )
    key = result.scalar_one_or_none()
    if not key:
        raise HTTPException(404, "Clé introuvable")

    if "name" in data:
        key.name = data["name"]
    if "allowed_domains" in data:
        key.allowed_domains = data["allowed_domains"]

    await db.commit()
    return {"message": "Clé mise à jour"}
