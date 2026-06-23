"""
Configuration centrale de Syntax AI - v2
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
from functools import lru_cache


class Settings(BaseSettings):
    # ─── App ──────────────────────────────────────────────────────────────────
    APP_NAME: str = "Syntax AI"
    ENVIRONMENT: str = "production"
    SECRET_KEY: str = "syntax@304-JSB"
    DEBUG: bool = False

    # ─── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://api_syntax_ai_sql_user:c8aZ3xSvygj1wEFhbpThyBzrPbmaZRmu@dpg-d8ss96smmk8c73dn87a0-a/api_syntax_ai_sql"

    # ─── Redis ────────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://red-d8ss3su7r5hc73e7563g:6379"

    # ─── CORS ─────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = [
        "https://ai.syntax-lab.site",
        "https:/api.ai.syntax-lab.site",
        "https://syntax-lab.site",
        "http://localhost:3000",
        "http://localhost:5173",
    ]

    # ─── JWT ──────────────────────────────────────────────────────────────────
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ─── OAuth2 Providers ─────────────────────────────────────────────────────
    GOOGLE_CLIENT_ID: str = "759859306909-3bsorr59v87crivt5fjkuu98g1q3m09c.apps.googleusercontent.com"
    GOOGLE_CLIENT_SECRET: str = "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"
    GITHUB_CLIENT_ID: str = "Ov23li4Crhm57SGFiXWy"
    GITHUB_CLIENT_SECRET: str = "51cc346d5040c60855f6e21d7ea1b6dddb941e26"
    OAUTH_REDIRECT_BASE: str = "https://ai.syntax-lab.site"

    # ─── APIs IA ──────────────────────────────────────────────────────────────
    ANTHROPIC_API_KEY: str = "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"
    OPENAI_API_KEY: str = "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"
    GOOGLE_API_KEY: str = "AQ.Ab8RN6JDcBSTw7wDYnMBgiYHLC07WhLc3qGIevs3svdDssoNGQ"          # Gemini

    # ─── Google Translate ─────────────────────────────────────────────────────
    GOOGLE_TRANSLATE_API_KEY: str = ""
    TRANSLATE_DEFAULT_ENABLED: bool = True
    TRANSLATE_PRESERVE_CODE: bool = True

    # ─── Stripe ───────────────────────────────────────────────────────────────
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_CURRENCY: str = "eur"

    # ─── Plans & Token Limits (tokens/jour) ───────────────────────────────────
    TOKEN_LIMITS: dict = {
        "free":     100_000,
        "starter":  500_000,
        "pro":    2_000_000,
        "team":  10_000_000,
        "reseller": -1,        # illimité
    }

    # ─── Rate Limits (req/minute) ─────────────────────────────────────────────
    RATE_LIMITS: dict = {
        "free":     10,
        "starter":  30,
        "pro":     100,
        "team":    500,
        "reseller": 2000,
    }

    # ─── Plan Access Control ──────────────────────────────────────────────────
    # Quels modes sont accessibles par plan
    PLAN_MODES: dict = {
        "free":     ["hybrid"],
        "starter":  ["hybrid", "solo"],
        "pro":      ["hybrid", "solo"],
        "team":     ["hybrid", "solo"],
        "reseller": ["hybrid", "solo"],
    }

    # Ordre des tiers pour comparaison
    TIER_ORDER: List[str] = ["free", "starter", "pro", "team"]

    # ─── Modèles Hybrides ─────────────────────────────────────────────────────
    HYBRID_MODELS: dict = {
        "syntax-free-1": {
            "display_name": "Syntax Free",
            "tier": "free",
            "description": "Modèle collaboratif gratuit",
            "providers": {
                "claude": "claude-haiku-4-5",
                "openai": "gpt-4o-mini",
                "gemini": "gemini-1.5-flash",
            },
        },
        "syntax-starter-1": {
            "display_name": "Syntax Starter",
            "tier": "starter",
            "description": "Modèle collaboratif intermédiaire",
            "providers": {
                "claude": "claude-sonnet-4-6",
                "openai": "gpt-4o",
                "gemini": "gemini-1.5-pro",
            },
        },
        "syntax-pro-1": {
            "display_name": "Syntax Pro",
            "tier": "pro",
            "description": "Modèle haute performance",
            "providers": {
                "claude": "claude-opus-4-6",
                "openai": "gpt-4o",
                "gemini": "gemini-1.5-pro",
            },
        },
        "syntax-team-1": {
            "display_name": "Syntax Team",
            "tier": "team",
            "description": "Modèle maximal pour équipes",
            "providers": {
                "claude": "claude-opus-4-8",
                "openai": "gpt-4o",
                "gemini": "gemini-2.0-flash-exp",
            },
        },
    }

    # ─── Modèles Solo ─────────────────────────────────────────────────────────
    SOLO_MODELS: dict = {
        # Claude
        "claude-haiku":   {"provider": "claude", "model": "claude-haiku-4-5",   "tier": "starter", "display": "Claude Haiku"},
        "claude-sonnet":  {"provider": "claude", "model": "claude-sonnet-4-6",  "tier": "starter", "display": "Claude Sonnet"},
        "claude-opus":    {"provider": "claude", "model": "claude-opus-4-6",    "tier": "pro",     "display": "Claude Opus"},
        "claude-opus-max":{"provider": "claude", "model": "claude-opus-4-8",    "tier": "team",    "display": "Claude Opus Max"},
        # OpenAI
        "gpt-4o-mini":    {"provider": "openai", "model": "gpt-4o-mini",        "tier": "starter", "display": "GPT-4o Mini"},
        "gpt-4o":         {"provider": "openai", "model": "gpt-4o",             "tier": "starter", "display": "GPT-4o"},
        # Gemini
        "gemini-flash":   {"provider": "gemini", "model": "gemini-1.5-flash",   "tier": "starter", "display": "Gemini Flash"},
        "gemini-pro":     {"provider": "gemini", "model": "gemini-1.5-pro",     "tier": "pro",     "display": "Gemini Pro"},
        "gemini-ultra":   {"provider": "gemini", "model": "gemini-2.0-flash-exp","tier": "team",   "display": "Gemini Ultra"},
    }

    # ─── Stripe Price IDs ─────────────────────────────────────────────────────
    STRIPE_PRICES: dict = {
        "starter":  "price_syntax_starter",
        "pro":      "price_syntax_pro",
        "team":     "price_syntax_team",
        "reseller": "price_syntax_reseller",
    }

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
