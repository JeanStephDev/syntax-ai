"""
Router principal API v1 - Syntax AI v2
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, chat, models, apikeys, billing, usage, conversations

api_router = APIRouter()

api_router.include_router(auth.router,          prefix="/auth",          tags=["Auth"])
api_router.include_router(chat.router,          prefix="/chat",          tags=["Chat"])
api_router.include_router(conversations.router, prefix="/conversations",  tags=["Conversations"])
api_router.include_router(models.router,        prefix="/models",        tags=["Modèles"])
api_router.include_router(apikeys.router,       prefix="/apikeys",       tags=["Clés API"])
api_router.include_router(billing.router,       prefix="/billing",       tags=["Facturation"])
api_router.include_router(usage.router,         prefix="/usage",         tags=["Usage"])
