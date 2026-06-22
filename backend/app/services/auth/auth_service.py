"""
Service Auth v2 — JWT + OAuth2 Google + GitHub
"""

from datetime import datetime, timedelta
from typing import Optional
import secrets
import httpx

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.models.models import User, APIKey, APIKeyType, PlanType, AuthProvider

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ─── Passwords ────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ─── JWT ──────────────────────────────────────────────────────────────────────

def create_access_token(user_id: str, email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": user_id, "email": email, "exp": expire, "type": "access"},
        settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM,
    )

def create_refresh_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": user_id, "exp": expire, "type": "refresh"},
        settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM,
    )

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None


# ─── OAuth2 Google ────────────────────────────────────────────────────────────

GOOGLE_TOKEN_URL    = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

async def exchange_google_code(code: str, redirect_uri: str) -> dict:
    """Échange le code OAuth2 contre un access token Google"""
    async with httpx.AsyncClient() as client:
        resp = await client.post(GOOGLE_TOKEN_URL, data={
            "client_id":     settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "code":          code,
            "grant_type":    "authorization_code",
            "redirect_uri":  redirect_uri,
        })
        resp.raise_for_status()
        return resp.json()

async def get_google_user(access_token: str) -> dict:
    """Récupère les infos utilisateur Google"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        resp.raise_for_status()
        return resp.json()
    # Returns: {id, email, name, picture, verified_email}


# ─── OAuth2 GitHub ────────────────────────────────────────────────────────────

GITHUB_TOKEN_URL    = "https://github.com/login/oauth/access_token"
GITHUB_USERINFO_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL   = "https://api.github.com/user/emails"

async def exchange_github_code(code: str) -> dict:
    """Échange le code OAuth2 contre un access token GitHub"""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            GITHUB_TOKEN_URL,
            data={
                "client_id":     settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code":          code,
            },
            headers={"Accept": "application/json"},
        )
        resp.raise_for_status()
        return resp.json()

async def get_github_user(access_token: str) -> dict:
    """Récupère les infos + email principal GitHub"""
    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github+json",
        }
        user_resp  = await client.get(GITHUB_USERINFO_URL,  headers=headers)
        email_resp = await client.get(GITHUB_EMAILS_URL,    headers=headers)
        user_resp.raise_for_status()

        user = user_resp.json()
        # Email peut être null sur GitHub — on cherche l'email principal
        if not user.get("email") and email_resp.ok:
            emails = email_resp.json()
            primary = next((e["email"] for e in emails if e.get("primary") and e.get("verified")), None)
            user["email"] = primary

        return user
    # Returns: {id, login, name, email, avatar_url}


# ─── CRUD Users ───────────────────────────────────────────────────────────────

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    r = await db.execute(select(User).where(User.email == email.lower()))
    return r.scalar_one_or_none()

async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    r = await db.execute(select(User).where(User.id == user_id))
    return r.scalar_one_or_none()

async def get_user_by_provider(db: AsyncSession, provider: AuthProvider, provider_id: str) -> Optional[User]:
    r = await db.execute(
        select(User).where(
            User.auth_provider == provider,
            User.provider_id == str(provider_id),
        )
    )
    return r.scalar_one_or_none()


async def create_email_user(
    db: AsyncSession, email: str, username: str,
    password: str, full_name: Optional[str] = None,
) -> User:
    user = User(
        email=email.lower(),
        username=username,
        hashed_password=hash_password(password),
        full_name=full_name,
        auth_provider=AuthProvider.EMAIL,
        is_verified=False,
        plan=PlanType.FREE,
    )
    db.add(user)
    await db.flush()
    await _create_default_api_key(db, user.id)
    await db.commit()
    await db.refresh(user)
    return user


async def get_or_create_oauth_user(
    db: AsyncSession,
    provider: AuthProvider,
    provider_id: str,
    email: str,
    full_name: Optional[str],
    avatar_url: Optional[str],
    provider_token: Optional[str],
) -> tuple["User", bool]:
    """
    Retourne (user, is_new).
    1. Cherche par provider_id
    2. Si pas trouvé, cherche par email (liaison de compte)
    3. Sinon crée un nouveau compte
    """
    # 1. Par provider
    user = await get_user_by_provider(db, provider, provider_id)
    if user:
        # Mettre à jour le token et l'avatar
        user.provider_token = provider_token
        if avatar_url:
            user.avatar_url = avatar_url
        await db.commit()
        return user, False

    # 2. Liaison par email
    user = await get_user_by_email(db, email)
    if user:
        user.auth_provider  = provider
        user.provider_id    = str(provider_id)
        user.provider_token = provider_token
        user.is_verified    = True
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url
        await db.commit()
        return user, False

    # 3. Nouveau compte
    base_username = email.split("@")[0].replace(".", "_").lower()
    username = base_username
    # S'assurer que le username est unique
    i = 1
    while True:
        existing = await db.execute(select(User).where(User.username == username))
        if not existing.scalar_one_or_none():
            break
        username = f"{base_username}_{i}"
        i += 1

    user = User(
        email=email.lower(),
        username=username,
        hashed_password=None,
        full_name=full_name,
        avatar_url=avatar_url,
        auth_provider=provider,
        provider_id=str(provider_id),
        provider_token=provider_token,
        is_verified=True,
        plan=PlanType.FREE,
    )
    db.add(user)
    await db.flush()
    await _create_default_api_key(db, user.id)
    await db.commit()
    await db.refresh(user)
    return user, True


async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    user = await get_user_by_email(db, email)
    if not user or not user.hashed_password:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


# ─── API Keys ─────────────────────────────────────────────────────────────────

def generate_api_key(key_type: APIKeyType) -> str:
    prefix = {"user_free": "free", "user_pay": "pay", "reseller": "res"}.get(key_type.value, "key")
    return f"sk-syntax-{prefix}-{secrets.token_urlsafe(24)}"


async def _create_default_api_key(db: AsyncSession, user_id: str) -> APIKey:
    key = APIKey(
        user_id=user_id,
        key=generate_api_key(APIKeyType.USER_FREE),
        name="Clé API gratuite",
        key_type=APIKeyType.USER_FREE,
        monthly_token_limit=50_000,
    )
    db.add(key)
    return key


async def create_api_key(
    db: AsyncSession, user_id: str, key_type: APIKeyType,
    name: str = "Ma clé API", monthly_limit: Optional[int] = None,
) -> tuple[APIKey, str]:
    raw = generate_api_key(key_type)
    if monthly_limit is None:
        monthly_limit = {
            APIKeyType.USER_FREE: 50_000,
            APIKeyType.USER_PAY:  2_000_000,
            APIKeyType.RESELLER:  None,
        }.get(key_type, 50_000)

    key = APIKey(
        user_id=user_id, key=raw, name=name,
        key_type=key_type, monthly_token_limit=monthly_limit,
        is_reseller=(key_type == APIKeyType.RESELLER),
    )
    db.add(key)
    await db.commit()
    await db.refresh(key)
    return key, raw


async def get_api_key(db: AsyncSession, raw_key: str) -> Optional[APIKey]:
    r = await db.execute(
        select(APIKey).where(APIKey.key == raw_key, APIKey.is_active == True)
    )
    return r.scalar_one_or_none()


def user_to_dict(user: User) -> dict:
    return {
        "id":            user.id,
        "email":         user.email,
        "username":      user.username,
        "full_name":     user.full_name,
        "avatar_url":    user.avatar_url,
        "plan":          user.plan.value,
        "auth_provider": user.auth_provider.value,
        "ui_language":   user.ui_language,
        "ai_language":   user.ai_language,
        "translate_enabled": user.translate_enabled,
    }
