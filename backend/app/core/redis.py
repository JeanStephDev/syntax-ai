"""
Redis v2 — Rate limiting par plan + par clé API, cache, sessions
"""

import time
import json
import redis.asyncio as redis
from typing import Optional
from app.core.config import settings

_redis: Optional[redis.Redis] = None


async def init_redis():
    global _redis
    _redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
    await _redis.ping()


def get_redis() -> Optional[redis.Redis]:
    return _redis


# ─── Rate Limiting ────────────────────────────────────────────────────────────

async def check_rate_limit(
    identifier: str,
    plan: str,
    window_seconds: int = 60,
) -> tuple[bool, int, int]:
    """
    Sliding window rate limit.
    Returns (allowed, remaining, retry_after_seconds)
    """
    if not _redis:
        return True, 999, 0

    limit = settings.RATE_LIMITS.get(plan, 10)
    key   = f"rl:{identifier}:{int(time.time() // window_seconds)}"

    pipe = _redis.pipeline()
    pipe.incr(key)
    pipe.expire(key, window_seconds + 5)
    results = await pipe.execute()

    count     = results[0]
    remaining = max(0, limit - count)
    allowed   = count <= limit
    retry     = 0 if allowed else window_seconds

    return allowed, remaining, retry


async def check_api_key_rate_limit(
    api_key_id: str,
    plan: str = "reseller",
) -> tuple[bool, int, int]:
    """Rate limit spécifique pour les clés API"""
    return await check_rate_limit(f"apikey:{api_key_id}", plan)


# ─── Token Quota (journalier) ─────────────────────────────────────────────────

async def get_daily_tokens_used(user_id: str) -> int:
    """Tokens utilisés aujourd'hui par un user (cache Redis pour rapidité)"""
    if not _redis:
        return 0
    today = time.strftime("%Y-%m-%d")
    key   = f"tokens:{user_id}:{today}"
    val   = await _redis.get(key)
    return int(val) if val else 0


async def increment_daily_tokens(user_id: str, tokens: int) -> int:
    """Incrémente et retourne le total journalier"""
    if not _redis:
        return tokens
    today  = time.strftime("%Y-%m-%d")
    key    = f"tokens:{user_id}:{today}"
    total  = await _redis.incrby(key, tokens)
    # Expire à minuit UTC + 1h de marge
    import datetime
    now     = datetime.datetime.utcnow()
    midnight = (now + datetime.timedelta(days=1)).replace(hour=0, minute=0, second=0)
    ttl     = int((midnight - now).total_seconds()) + 3600
    await _redis.expire(key, ttl)
    return total


async def check_token_quota(user_id: str, plan: str) -> tuple[bool, int, int]:
    """
    Vérifie le quota journalier.
    Returns (allowed, used, limit)
    """
    limit = settings.TOKEN_LIMITS.get(plan, 100_000)
    if limit == -1:
        return True, 0, -1  # Illimité

    used = await get_daily_tokens_used(user_id)
    return used < limit, used, limit


# ─── Reseller Domain Validation ───────────────────────────────────────────────

async def validate_reseller_domain(api_key_id: str, origin: str, allowed_domains: list) -> bool:
    """
    Vérifie que l'origine de la requête est dans les domaines autorisés.
    Cache le résultat 5 minutes.
    """
    if not allowed_domains:
        return True   # Pas de restriction

    if not _redis:
        return _check_domain(origin, allowed_domains)

    cache_key = f"domain:{api_key_id}:{origin}"
    cached = await _redis.get(cache_key)
    if cached is not None:
        return cached == "1"

    result = _check_domain(origin, allowed_domains)
    await _redis.setex(cache_key, 300, "1" if result else "0")
    return result


def _check_domain(origin: str, allowed: list) -> bool:
    """Vérifie si l'origine correspond à un domaine autorisé"""
    if not origin:
        return False
    origin_clean = origin.replace("https://", "").replace("http://", "").rstrip("/")
    for domain in allowed:
        domain_clean = domain.strip().replace("https://", "").replace("http://", "").rstrip("/")
        if origin_clean == domain_clean or origin_clean.endswith("." + domain_clean):
            return True
    return False


# ─── Cache générique ──────────────────────────────────────────────────────────

async def cache_set(key: str, value: dict, ttl: int = 300):
    if _redis:
        await _redis.setex(f"cache:{key}", ttl, json.dumps(value))

async def cache_get(key: str) -> Optional[dict]:
    if not _redis:
        return None
    val = await _redis.get(f"cache:{key}")
    return json.loads(val) if val else None

async def cache_del(key: str):
    if _redis:
        await _redis.delete(f"cache:{key}")
