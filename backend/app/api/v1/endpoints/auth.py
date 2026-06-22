"""
Auth endpoints v2 — Email + Google OAuth2 + GitHub OAuth2
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr, field_validator
import re

from app.core.database import get_db
from app.core.config import settings
from app.api.v1.deps import get_current_user
from app.models.models import User, AuthProvider
from app.services.auth.auth_service import (
    create_email_user, authenticate_user, get_user_by_email,
    create_access_token, create_refresh_token, decode_token,
    get_user_by_id, get_or_create_oauth_user, user_to_dict,
    exchange_google_code, get_google_user,
    exchange_github_code, get_github_user,
)

router = APIRouter()


# ─── Schemas ──────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str | None = None

    @field_validator("username")
    def validate_username(cls, v):
        if not re.match(r"^[a-zA-Z0-9_-]{3,30}$", v):
            raise ValueError("3-30 caractères, lettres/chiffres/_-")
        return v

    @field_validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Minimum 8 caractères")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    ui_language: str | None = None
    ai_language: str | None = None
    translate_enabled: bool | None = None
    preserve_code: bool | None = None


# ─── Email / Password ─────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    if await get_user_by_email(db, data.email):
        raise HTTPException(400, "Un compte existe déjà avec cet email")

    user = await create_email_user(
        db, email=data.email, username=data.username,
        password=data.password, full_name=data.full_name,
    )
    return TokenResponse(
        access_token=create_access_token(user.id, user.email),
        refresh_token=create_refresh_token(user.id),
        user=user_to_dict(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(401, "Email ou mot de passe incorrect")
    if not user.is_active:
        raise HTTPException(403, "Compte désactivé")

    return TokenResponse(
        access_token=create_access_token(user.id, user.email),
        refresh_token=create_refresh_token(user.id),
        user=user_to_dict(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(401, "Token de rafraîchissement invalide")

    user = await get_user_by_id(db, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(401, "Utilisateur introuvable")

    return TokenResponse(
        access_token=create_access_token(user.id, user.email),
        refresh_token=create_refresh_token(user.id),
        user=user_to_dict(user),
    )


# ─── Google OAuth2 ────────────────────────────────────────────────────────────

@router.get("/google")
async def google_login():
    """Redirige vers Google OAuth2"""
    redirect_uri = f"{settings.OAUTH_REDIRECT_BASE}/api/v1/auth/google/callback"
    url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={redirect_uri}"
        "&response_type=code"
        "&scope=openid%20email%20profile"
        "&access_type=offline"
        "&prompt=consent"
    )
    return RedirectResponse(url)


@router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    """Callback Google — échange le code contre un token"""
    redirect_uri = f"{settings.OAUTH_REDIRECT_BASE}/api/v1/auth/google/callback"

    try:
        token_data  = await exchange_google_code(code, redirect_uri)
        google_user = await get_google_user(token_data["access_token"])
    except Exception as e:
        raise HTTPException(400, f"Erreur OAuth Google: {e}")

    if not google_user.get("email"):
        raise HTTPException(400, "Email Google non disponible")

    user, is_new = await get_or_create_oauth_user(
        db,
        provider=AuthProvider.GOOGLE,
        provider_id=google_user["id"],
        email=google_user["email"],
        full_name=google_user.get("name"),
        avatar_url=google_user.get("picture"),
        provider_token=token_data.get("access_token"),
    )

    access_token  = create_access_token(user.id, user.email)
    refresh_token = create_refresh_token(user.id)

    # Redirect vers le frontend avec les tokens dans l'URL (hash)
    frontend_url = (
        f"{settings.OAUTH_REDIRECT_BASE}/auth/callback"
        f"#access_token={access_token}"
        f"&refresh_token={refresh_token}"
        f"&new_user={'1' if is_new else '0'}"
    )
    return RedirectResponse(frontend_url)


# ─── GitHub OAuth2 ────────────────────────────────────────────────────────────

@router.get("/github")
async def github_login():
    """Redirige vers GitHub OAuth2"""
    redirect_uri = f"{settings.OAUTH_REDIRECT_BASE}/api/v1/auth/github/callback"
    url = (
        "https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri={redirect_uri}"
        "&scope=read:user%20user:email"
    )
    return RedirectResponse(url)


@router.get("/github/callback")
async def github_callback(code: str, db: AsyncSession = Depends(get_db)):
    """Callback GitHub"""
    try:
        token_data  = await exchange_github_code(code)
        github_user = await get_github_user(token_data["access_token"])
    except Exception as e:
        raise HTTPException(400, f"Erreur OAuth GitHub: {e}")

    if not github_user.get("email"):
        raise HTTPException(400, "Email GitHub non disponible. Rendez votre email public sur GitHub.")

    user, is_new = await get_or_create_oauth_user(
        db,
        provider=AuthProvider.GITHUB,
        provider_id=str(github_user["id"]),
        email=github_user["email"],
        full_name=github_user.get("name") or github_user.get("login"),
        avatar_url=github_user.get("avatar_url"),
        provider_token=token_data.get("access_token"),
    )

    access_token  = create_access_token(user.id, user.email)
    refresh_token = create_refresh_token(user.id)

    frontend_url = (
        f"{settings.OAUTH_REDIRECT_BASE}/auth/callback"
        f"#access_token={access_token}"
        f"&refresh_token={refresh_token}"
        f"&new_user={'1' if is_new else '0'}"
    )
    return RedirectResponse(frontend_url)


# ─── Profile ──────────────────────────────────────────────────────────────────

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return user_to_dict(current_user)


@router.patch("/me")
async def update_me(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.full_name          is not None: current_user.full_name        = data.full_name
    if data.ui_language        is not None: current_user.ui_language      = data.ui_language
    if data.ai_language        is not None: current_user.ai_language      = data.ai_language
    if data.translate_enabled  is not None: current_user.translate_enabled= data.translate_enabled
    if data.preserve_code      is not None: current_user.preserve_code    = data.preserve_code
    await db.commit()
    await db.refresh(current_user)
    return user_to_dict(current_user)
