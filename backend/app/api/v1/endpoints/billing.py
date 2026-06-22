"""
Endpoints Facturation - Syntax AI
Stripe : plans, abonnements, webhooks, clés API payantes
"""

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
import logging

from app.core.config import settings
from app.core.database import get_db
from app.models.models import User, Subscription, PlanType, APIKey, APIKeyType
from app.services.auth.auth_service import create_api_key
from app.api.v1.deps import get_current_user

stripe.api_key = settings.STRIPE_SECRET_KEY
logger = logging.getLogger("syntax-ai.billing")

router = APIRouter()

# ─── Plans disponibles ────────────────────────────────────────────────────────

PLANS = {
    "free": {
        "name": "Syntax Free",
        "price_eur": 0,
        "tokens_day": 100_000,
        "rate_limit": 10,
        "models": ["syntax-free-1"],
        "features": [
            "100K tokens / jour",
            "Modèle Syntax Free",
            "1 clé API gratuite",
            "Historique 7 jours",
        ],
    },
    "starter": {
        "name": "Syntax Starter",
        "price_eur": 4.99,
        "stripe_price_id": "price_syntax_starter",
        "tokens_day": 500_000,
        "rate_limit": 30,
        "models": ["syntax-free-1", "syntax-starter-1"],
        "features": [
            "500K tokens / jour",
            "Modèles Free + Starter",
            "3 clés API",
            "Historique 30 jours",
            "Support email",
        ],
    },
    "pro": {
        "name": "Syntax Pro",
        "price_eur": 14.99,
        "stripe_price_id": "price_syntax_pro",
        "tokens_day": 2_000_000,
        "rate_limit": 100,
        "models": ["syntax-free-1", "syntax-starter-1", "syntax-pro-1"],
        "features": [
            "2M tokens / jour",
            "Tous les modèles sauf Team",
            "10 clés API",
            "Historique illimité",
            "Support prioritaire",
            "Export de code",
        ],
    },
    "team": {
        "name": "Syntax Team",
        "price_eur": 49.99,
        "stripe_price_id": "price_syntax_team",
        "tokens_day": 10_000_000,
        "rate_limit": 500,
        "models": ["syntax-free-1", "syntax-starter-1", "syntax-pro-1", "syntax-team-1"],
        "features": [
            "10M tokens / jour",
            "Tous les modèles",
            "Clés API illimitées",
            "Workspace équipe",
            "Support dédié 24/7",
            "SLA garanti",
        ],
    },
    "reseller": {
        "name": "API Reseller",
        "price_usd": 5.00,
        "stripe_price_id": "price_syntax_reseller",
        "tokens_month": None,   # Illimité (facturation à l'usage)
        "features": [
            "Tokens illimités",
            "Facturation à l'usage",
            "Domaines personnalisés",
            "White-label ready",
            "Dashboard analytics",
            "SLA 99.9%",
        ],
    },
}


# ─── Schemas ──────────────────────────────────────────────────────────────────

class CreateCheckoutRequest(BaseModel):
    plan: str
    success_url: str = "https://ai.syntax-lab.site/dashboard?success=1"
    cancel_url: str = "https://ai.syntax-lab.site/pricing"


class CreateResellerRequest(BaseModel):
    success_url: str = "https://ai.syntax-lab.site/dashboard/api?reseller=1"
    cancel_url: str = "https://ai.syntax-lab.site/pricing"


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get("/plans")
async def get_plans():
    """Liste tous les plans disponibles"""
    return {"plans": PLANS}


@router.post("/checkout/session")
async def create_checkout_session(
    data: CreateCheckoutRequest,
    current_user: User = Depends(get_current_user),
):
    """Crée une session de paiement Stripe pour un plan"""
    if data.plan not in PLANS or data.plan == "free":
        raise HTTPException(400, "Plan invalide")

    plan = PLANS[data.plan]
    if "stripe_price_id" not in plan:
        raise HTTPException(400, "Ce plan n'a pas de prix Stripe configuré")

    try:
        session = stripe.checkout.Session.create(
            customer_email=current_user.email,
            metadata={"user_id": current_user.id, "plan": data.plan},
            line_items=[{
                "price": plan["stripe_price_id"],
                "quantity": 1,
            }],
            mode="subscription",
            success_url=data.success_url,
            cancel_url=data.cancel_url,
            subscription_data={
                "metadata": {"user_id": current_user.id, "plan": data.plan}
            },
        )
        return {"checkout_url": session.url, "session_id": session.id}
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(500, "Erreur lors de la création du paiement")


@router.post("/checkout/reseller")
async def create_reseller_checkout(
    data: CreateResellerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Checkout pour l'abonnement Reseller API"""
    try:
        session = stripe.checkout.Session.create(
            customer_email=current_user.email,
            metadata={"user_id": current_user.id, "plan": "reseller"},
            line_items=[{
                "price": PLANS["reseller"]["stripe_price_id"],
                "quantity": 1,
            }],
            mode="subscription",
            success_url=data.success_url,
            cancel_url=data.cancel_url,
        )
        return {"checkout_url": session.url, "session_id": session.id}
    except stripe.error.StripeError as e:
        raise HTTPException(500, "Erreur paiement Reseller")


@router.post("/portal")
async def customer_portal(current_user: User = Depends(get_current_user)):
    """Portail client Stripe (gérer abonnement, factures, annulation)"""
    if not current_user.stripe_customer_id:
        raise HTTPException(400, "Aucun abonnement actif")

    try:
        session = stripe.billing_portal.Session.create(
            customer=current_user.stripe_customer_id,
            return_url="https://ai.syntax-lab.site/dashboard",
        )
        return {"portal_url": session.url}
    except stripe.error.StripeError as e:
        raise HTTPException(500, "Erreur portail Stripe")


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(alias="stripe-signature"),
    db: AsyncSession = Depends(get_db),
):
    """Webhook Stripe - gère les événements d'abonnement"""
    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(400, "Webhook invalide")

    event_type = event["type"]
    logger.info(f"Stripe webhook: {event_type}")

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["metadata"].get("user_id")
        plan = session["metadata"].get("plan")
        customer_id = session.get("customer")

        if user_id and plan:
            from sqlalchemy import update
            from app.models.models import User as UserModel
            await db.execute(
                update(UserModel)
                .where(UserModel.id == user_id)
                .values(plan=PlanType(plan), stripe_customer_id=customer_id)
            )
            await db.commit()

            # Si c'est un reseller → créer clé API reseller
            if plan == "reseller":
                await create_api_key(
                    db, user_id, APIKeyType.RESELLER,
                    name="Clé Reseller",
                    monthly_limit=None,
                )

    elif event_type in ("customer.subscription.deleted", "customer.subscription.updated"):
        sub = event["data"]["object"]
        user_id = sub["metadata"].get("user_id")
        status = sub.get("status")

        if user_id and status in ("canceled", "unpaid"):
            from sqlalchemy import update
            from app.models.models import User as UserModel
            await db.execute(
                update(UserModel)
                .where(UserModel.id == user_id)
                .values(plan=PlanType.FREE)
            )
            await db.commit()

    return {"received": True}


@router.get("/subscription")
async def get_subscription(current_user: User = Depends(get_current_user)):
    """Détails de l'abonnement actuel"""
    return {
        "plan": current_user.plan.value,
        "plan_details": PLANS.get(current_user.plan.value, PLANS["free"]),
        "stripe_customer_id": current_user.stripe_customer_id,
    }
