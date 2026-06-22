"""
Endpoints Modèles - Syntax AI
"""

from fastapi import APIRouter, Depends
from app.core.config import settings
from app.models.models import User, PlanType
from app.api.v1.deps import get_current_user

router = APIRouter()

TIER_ORDER = ["free", "starter", "pro", "team"]


@router.get("/")
async def list_models(current_user: User = Depends(get_current_user)):
    """Liste les modèles disponibles pour l'utilisateur"""
    user_tier_index = TIER_ORDER.index(current_user.plan.value)
    accessible = []
    locked = []

    for model_id, config in settings.HYBRID_MODELS.items():
        model_tier_index = TIER_ORDER.index(config["tier"])
        info = {
            "id": model_id,
            "display_name": config["display_name"],
            "description": config["description"],
            "tier": config["tier"],
            "providers": {
                "backend": f"Claude ({config['providers']['claude']})",
                "frontend": f"GPT ({config['providers']['openai']})",
                "assets_docs": f"Gemini ({config['providers']['gemini']})",
            },
        }
        if model_tier_index <= user_tier_index:
            accessible.append(info)
        else:
            locked.append({**info, "locked": True, "requires_plan": config["tier"]})

    return {
        "accessible": accessible,
        "locked": locked,
        "current_plan": current_user.plan.value,
    }


@router.get("/public")
async def list_public_models():
    """Liste tous les modèles (sans authentification, pour la landing page)"""
    return {
        "models": [
            {
                "id": mid,
                "display_name": cfg["display_name"],
                "description": cfg["description"],
                "tier": cfg["tier"],
            }
            for mid, cfg in settings.HYBRID_MODELS.items()
        ]
    }
