"""
Modèles SQLAlchemy - Syntax AI v2
"""

from sqlalchemy import (
    Column, String, Integer, BigInteger, Boolean,
    DateTime, Enum, ForeignKey, Text, Float, JSON
)
from sqlalchemy.orm import relationship, DeclarativeBase
from sqlalchemy.sql import func
import uuid
import enum


class Base(DeclarativeBase):
    pass


# ─── Enums ────────────────────────────────────────────────────────────────────

class PlanType(str, enum.Enum):
    FREE     = "free"
    STARTER  = "starter"
    PRO      = "pro"
    TEAM     = "team"


class AuthProvider(str, enum.Enum):
    EMAIL  = "email"
    GOOGLE = "google"
    GITHUB = "github"


class APIKeyType(str, enum.Enum):
    USER_FREE = "user_free"
    USER_PAY  = "user_pay"
    RESELLER  = "reseller"


class ChatMode(str, enum.Enum):
    HYBRID = "hybrid"
    SOLO   = "solo"


class SoloProvider(str, enum.Enum):
    CLAUDE = "claude"
    OPENAI = "openai"
    GEMINI = "gemini"


class MessageRole(str, enum.Enum):
    USER      = "user"
    ASSISTANT = "assistant"
    SYSTEM    = "system"


# ─── User ─────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id                  = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email               = Column(String(255), unique=True, nullable=False, index=True)
    username            = Column(String(100), unique=True, nullable=False)
    hashed_password     = Column(String(255), nullable=True)   # nullable pour OAuth
    full_name           = Column(String(255), nullable=True)
    avatar_url          = Column(String(500), nullable=True)

    # Auth provider
    auth_provider       = Column(Enum(AuthProvider), default=AuthProvider.EMAIL)
    provider_id         = Column(String(255), nullable=True)   # Google/GitHub user ID
    provider_token      = Column(String(1000), nullable=True)  # OAuth access token

    # Account state
    is_active           = Column(Boolean, default=True)
    is_verified         = Column(Boolean, default=False)
    plan                = Column(Enum(PlanType), default=PlanType.FREE)
    stripe_customer_id  = Column(String(255), nullable=True)

    # Language preferences
    ui_language         = Column(String(10), default="fr")
    ai_language         = Column(String(10), default="fr")
    translate_enabled   = Column(Boolean, default=True)
    preserve_code       = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relations
    api_keys      = relationship("APIKey",       back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    token_usage   = relationship("TokenUsage",   back_populates="user", cascade="all, delete-orphan")
    subscription  = relationship("Subscription", back_populates="user", uselist=False)

    def can_use_mode(self, mode: str) -> bool:
        """Vérifie si l'utilisateur peut utiliser un mode (hybrid/solo)"""
        from app.core.config import settings
        allowed = settings.PLAN_MODES.get(self.plan.value, ["hybrid"])
        return mode in allowed

    def can_use_model(self, model_id: str, mode: str) -> bool:
        """Vérifie si l'utilisateur peut utiliser un modèle spécifique"""
        from app.core.config import settings
        tier_order = settings.TIER_ORDER
        user_tier_idx = tier_order.index(self.plan.value)

        if mode == "hybrid":
            cfg = settings.HYBRID_MODELS.get(model_id)
            if not cfg:
                return False
            model_tier_idx = tier_order.index(cfg["tier"])
            return user_tier_idx >= model_tier_idx
        elif mode == "solo":
            if not self.can_use_mode("solo"):
                return False
            cfg = settings.SOLO_MODELS.get(model_id)
            if not cfg:
                return False
            model_tier_idx = tier_order.index(cfg["tier"])
            return user_tier_idx >= model_tier_idx
        return False


# ─── Subscription ─────────────────────────────────────────────────────────────

class Subscription(Base):
    __tablename__ = "subscriptions"

    id                   = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id              = Column(String, ForeignKey("users.id"), unique=True)
    stripe_sub_id        = Column(String(255), unique=True, nullable=True)
    plan                 = Column(Enum(PlanType), nullable=False)
    status               = Column(String(50), default="active")
    current_period_start = Column(DateTime(timezone=True), nullable=True)
    current_period_end   = Column(DateTime(timezone=True), nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    created_at           = Column(DateTime(timezone=True), server_default=func.now())
    updated_at           = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="subscription")


# ─── API Keys ─────────────────────────────────────────────────────────────────

class APIKey(Base):
    __tablename__ = "api_keys"

    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id     = Column(String, ForeignKey("users.id"), nullable=False)
    key         = Column(String(64), unique=True, nullable=False, index=True)
    name        = Column(String(100), nullable=False, default="Ma clé API")
    key_type    = Column(Enum(APIKeyType), default=APIKeyType.USER_FREE)
    is_active   = Column(Boolean, default=True)

    # Token limits
    monthly_token_limit = Column(BigInteger, nullable=True)
    tokens_used_month   = Column(BigInteger, default=0)

    # Reseller config
    is_reseller      = Column(Boolean, default=False)
    allowed_domains  = Column(JSON, default=list)   # ["domain.com", "other.io"]
    webhook_url      = Column(String(500), nullable=True)

    # Stats
    total_requests = Column(BigInteger, default=0)
    total_tokens   = Column(BigInteger, default=0)
    last_used_at   = Column(DateTime(timezone=True), nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="api_keys")


# ─── Conversation ─────────────────────────────────────────────────────────────

class Conversation(Base):
    __tablename__ = "conversations"

    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id     = Column(String, ForeignKey("users.id"), nullable=False)
    title       = Column(String(255), default="Nouvelle conversation")

    # Mode & model
    mode        = Column(Enum(ChatMode), default=ChatMode.HYBRID)
    model_id    = Column(String(100), nullable=False)          # hybrid: syntax-pro-1 | solo: claude-sonnet
    provider    = Column(Enum(SoloProvider), nullable=True)    # solo seulement

    is_archived = Column(Boolean, default=False)
    meta_data   = Column(JSON, default=dict)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    user     = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation",
                            cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id              = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    role            = Column(Enum(MessageRole), nullable=False)
    content         = Column(Text, nullable=False)

    # Original content avant traduction
    content_original = Column(Text, nullable=True)
    translated_to    = Column(String(10), nullable=True)

    # Métadonnées IA
    provider     = Column(String(50), nullable=True)
    model_used   = Column(String(100), nullable=True)
    tokens_input  = Column(Integer, default=0)
    tokens_output = Column(Integer, default=0)
    code_role    = Column(String(50), nullable=True)   # backend | frontend | assets_docs

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")


# ─── Token Usage ──────────────────────────────────────────────────────────────

class TokenUsage(Base):
    __tablename__ = "token_usage"

    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id    = Column(String, ForeignKey("users.id"), nullable=False)
    api_key_id = Column(String, ForeignKey("api_keys.id"), nullable=True)
    date       = Column(String(10), nullable=False)    # YYYY-MM-DD
    model_id   = Column(String(100), nullable=False)
    mode       = Column(String(20), default="hybrid")  # hybrid | solo
    provider   = Column(String(50), nullable=False)

    input_tokens  = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    total_tokens  = Column(Integer, default=0)
    request_count = Column(Integer, default=0)

    estimated_cost_cents = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="token_usage")
