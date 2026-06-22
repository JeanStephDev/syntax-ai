"""
Syntax AI - Backend Principal
Domain: ai.syntax-lab.site
Stack: FastAPI + PostgreSQL + Redis
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import init_db
from app.core.redis import init_redis
from app.api.v1.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("syntax-ai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & Shutdown"""
    logger.info("🚀 Syntax AI démarre...")
    await init_db()
    await init_redis()
    logger.info("✅ Syntax AI prêt sur ai.syntax-lab.site")
    yield
    logger.info("🛑 Syntax AI s'arrête...")


app = FastAPI(
    title="Syntax AI API",
    description="API de Syntax AI - L'IA collaborative pour développeurs",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    lifespan=lifespan,
)

# ─── Middlewares ───────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["ai.syntax-lab.site", "*.syntax-lab.site", "localhost", "127.0.0.1"],
)

# ─── Routes ───────────────────────────────────────────────────────────────────

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Syntax AI",
        "version": "1.0.0",
        "domain": "ai.syntax-lab.site",
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erreur non gérée: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Erreur interne du serveur", "type": "internal_error"},
    )
