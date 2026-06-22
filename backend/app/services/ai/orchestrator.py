"""
Orchestrateur IA v2 — Syntax AI
Supporte : mode Hybrid (3 IAs) + mode Solo (1 IA ciblée)
"""

import asyncio
import json
from typing import AsyncGenerator, Dict, Any, Optional
from dataclasses import dataclass, field
import logging

import anthropic
from openai import AsyncOpenAI
import google.generativeai as genai

from app.core.config import settings

logger = logging.getLogger("syntax-ai.orchestrator")

# ─── Clients ──────────────────────────────────────────────────────────────────
claude_client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
genai.configure(api_key=settings.GOOGLE_API_KEY)

# ─── System prompts ───────────────────────────────────────────────────────────
SYSTEM_PROMPTS = {
    "backend": """Tu es l'expert Backend de Syntax AI. Tu génères UNIQUEMENT :
- Code serveur (Python/FastAPI, Node/Express, Go, Rust, etc.)
- APIs REST/GraphQL, logique métier, algorithmes
- Base de données, migrations, ORM
- Authentification, sécurité, middleware
- Tests unitaires et d'intégration backend

Identifie toujours les fichiers : ex. `backend/app/routes/user.py`
Code propre, typé, documenté. JAMAIS de HTML/CSS/JS frontend.""",

    "frontend": """Tu es l'expert Frontend de Syntax AI. Tu génères UNIQUEMENT :
- Composants React/Next.js, Vue, Svelte, Angular
- HTML, CSS, Tailwind, animations, responsive design
- JavaScript/TypeScript côté client
- Appels API, state management, hooks
- Tests composants (Jest, Testing Library)

Identifie toujours les fichiers : ex. `frontend/components/UserCard.tsx`
Code élégant, accessible, performant. JAMAIS de code serveur.""",

    "assets_docs": """Tu es l'expert Assets & Documentation de Syntax AI. Tu génères :
- Design system (tokens couleurs, typographie, espacement)
- README, documentation technique, ADR
- Configuration : Docker, docker-compose, CI/CD, .env.example
- Schémas d'architecture (Mermaid), diagrammes de séquence
- Scripts utilitaires, Makefile, shell scripts

Identifie toujours les fichiers : ex. `docs/architecture.md`
Sois précis, structuré, complet.""",

    "orchestrator": """Tu es le Chef d'Orchestre de Syntax AI. Analyse les demandes et :
1. Décompose en 3 parties : Backend / Frontend / Assets-Docs
2. Assure la COHÉRENCE (noms de variables, types, API contracts)
3. Produis un contrat de synchronisation

Réponds UNIQUEMENT en JSON valide sans markdown :
{
  "analysis": "Analyse concise de la demande",
  "tasks": {
    "backend": "Instructions précises pour Claude",
    "frontend": "Instructions précises pour GPT",
    "assets_docs": "Instructions précises pour Gemini"
  },
  "sync_contract": {
    "api_endpoints": [{"method": "POST", "path": "/api/v1/...", "body": {}, "response": {}}],
    "shared_types": [{"name": "UserType", "fields": {}}],
    "env_variables": ["DATABASE_URL", "SECRET_KEY"]
  }
}""",

    "solo_claude": """Tu es Claude, l'IA backend de Syntax AI. Tu es un expert en :
- Architecture logicielle et design patterns
- Python, FastAPI, Django, Node.js, Go
- Bases de données SQL/NoSQL, optimisation de requêtes
- Sécurité applicative, cryptographie, OAuth
- Algorithmes, structures de données, complexité

Fournis du code propre, typé, avec des tests. Explique tes choix d'architecture.""",

    "solo_gpt": """Tu es GPT, l'IA frontend de Syntax AI. Tu es un expert en :
- React, Next.js, Vue, Svelte, Angular
- CSS avancé, Tailwind, animations, design system
- TypeScript, JavaScript ES2024+
- Performance web, Core Web Vitals, accessibilité
- State management (Redux, Zustand, Jotai, React Query)

Fournis du code élégant et accessible. Pense UX en premier.""",

    "solo_gemini": """Tu es Gemini, l'IA assets & docs de Syntax AI. Tu es un expert en :
- Documentation technique claire et complète
- DevOps, Docker, Kubernetes, CI/CD (GitHub Actions, GitLab CI)
- Infrastructure as Code (Terraform, Pulumi)
- Design system, tokens, guidelines
- Monitoring, observabilité, SRE

Fournis des configurations prêtes à l'emploi et une documentation actionnable.""",
}


# ─── Dataclasses ──────────────────────────────────────────────────────────────

@dataclass
class HybridResponse:
    model_id: str
    backend_response: str
    frontend_response: str
    assets_docs_response: str
    sync_contract: Dict[str, Any]
    total_tokens: int
    mode: str = "hybrid"


@dataclass
class SoloResponse:
    provider: str          # claude | openai | gemini
    model_id: str
    model_used: str
    content: str
    total_tokens: int
    mode: str = "solo"


@dataclass
class StreamChunk:
    provider: str
    role: str
    content: str
    is_final: bool = False
    tokens: int = 0


# ─── Hybrid Orchestrator ──────────────────────────────────────────────────────

class HybridOrchestrator:
    """Mode Hybrid : Claude + GPT + Gemini en parallèle"""

    def __init__(self, model_config: Dict[str, Any]):
        self.model_config = model_config
        self.providers = model_config["providers"]

    async def _analyze(self, user_message: str, history: list) -> Dict[str, Any]:
        """Étape 1 : décomposition de la demande"""
        try:
            response = await claude_client.messages.create(
                model=self.providers["claude"],
                max_tokens=1024,
                system=SYSTEM_PROMPTS["orchestrator"],
                messages=[{"role": "user", "content": f"Analyse et décompose :\n\n{user_message}"}],
            )
            raw = response.content[0].text.strip()
            if "```" in raw:
                raw = raw.split("```")[1].replace("json", "", 1).strip()
            return json.loads(raw)
        except Exception as e:
            logger.error(f"Orchestrator analysis failed: {e}")
            return {
                "analysis": user_message,
                "tasks": {"backend": user_message, "frontend": user_message, "assets_docs": user_message},
                "sync_contract": {"api_endpoints": [], "shared_types": [], "env_variables": []},
            }

    async def _call_claude(self, task: str, contract: Dict) -> tuple[str, int]:
        ctx = f"CONTRAT:\n{json.dumps(contract, ensure_ascii=False, indent=2)}\n\nTÂCHE BACKEND:\n{task}"
        response = await claude_client.messages.create(
            model=self.providers["claude"],
            max_tokens=4096,
            system=SYSTEM_PROMPTS["backend"],
            messages=[{"role": "user", "content": ctx}],
        )
        return response.content[0].text, response.usage.input_tokens + response.usage.output_tokens

    async def _call_openai(self, task: str, contract: Dict) -> tuple[str, int]:
        ctx = f"CONTRAT:\n{json.dumps(contract, ensure_ascii=False, indent=2)}\n\nTÂCHE FRONTEND:\n{task}"
        response = await openai_client.chat.completions.create(
            model=self.providers["openai"],
            messages=[
                {"role": "system", "content": SYSTEM_PROMPTS["frontend"]},
                {"role": "user", "content": ctx},
            ],
            max_tokens=4096,
        )
        return response.choices[0].message.content, response.usage.total_tokens

    async def _call_gemini(self, task: str, contract: Dict) -> tuple[str, int]:
        ctx = f"CONTRAT:\n{json.dumps(contract, ensure_ascii=False, indent=2)}\n\nTÂCHE ASSETS/DOCS:\n{task}"
        model = genai.GenerativeModel(
            model_name=self.providers["gemini"],
            system_instruction=SYSTEM_PROMPTS["assets_docs"],
        )
        response = await asyncio.to_thread(model.generate_content, ctx)
        tokens = getattr(response.usage_metadata, "total_token_count", 0)
        return response.text, tokens

    async def run(self, user_message: str, history: list) -> HybridResponse:
        analysis = await self._analyze(user_message, history)
        tasks = analysis.get("tasks", {})
        contract = analysis.get("sync_contract", {})

        results = await asyncio.gather(
            self._call_claude(tasks.get("backend", user_message), contract),
            self._call_openai(tasks.get("frontend", user_message), contract),
            self._call_gemini(tasks.get("assets_docs", user_message), contract),
            return_exceptions=True,
        )

        def safe(r, fallback):
            return r if not isinstance(r, Exception) else (fallback, 0)

        backend_text,  bt = safe(results[0], "Erreur Claude")
        frontend_text, ft = safe(results[1], "Erreur GPT")
        assets_text,   at = safe(results[2], "Erreur Gemini")

        return HybridResponse(
            model_id=self.model_config.get("display_name", "Syntax"),
            backend_response=backend_text,
            frontend_response=frontend_text,
            assets_docs_response=assets_text,
            sync_contract=contract,
            total_tokens=bt + ft + at,
        )

    async def stream(self, user_message: str, history: list) -> AsyncGenerator[StreamChunk, None]:
        analysis = await self._analyze(user_message, history)
        tasks = analysis.get("tasks", {})

        yield StreamChunk(provider="orchestrator", role="plan",
                          content=json.dumps(analysis, ensure_ascii=False), is_final=False)

        # Stream Claude
        async with claude_client.messages.stream(
            model=self.providers["claude"], max_tokens=4096,
            system=SYSTEM_PROMPTS["backend"],
            messages=[{"role": "user", "content": tasks.get("backend", user_message)}],
        ) as s:
            async for text in s.text_stream:
                yield StreamChunk(provider="claude", role="backend", content=text)
        yield StreamChunk(provider="claude", role="backend", content="", is_final=True)

        # Stream GPT
        stream_gpt = await openai_client.chat.completions.create(
            model=self.providers["openai"],
            messages=[
                {"role": "system", "content": SYSTEM_PROMPTS["frontend"]},
                {"role": "user", "content": tasks.get("frontend", user_message)},
            ],
            max_tokens=4096, stream=True,
        )
        async for chunk in stream_gpt:
            delta = chunk.choices[0].delta.content
            if delta:
                yield StreamChunk(provider="openai", role="frontend", content=delta)
        yield StreamChunk(provider="openai", role="frontend", content="", is_final=True)

        # Gemini (simulé)
        assets_text, _ = await self._call_gemini(tasks.get("assets_docs", user_message), {})
        words = assets_text.split()
        for i in range(0, len(words), 6):
            yield StreamChunk(provider="gemini", role="assets_docs", content=" ".join(words[i:i+6]) + " ")
            await asyncio.sleep(0.02)
        yield StreamChunk(provider="gemini", role="assets_docs", content="", is_final=True)


# ─── Solo Orchestrator ────────────────────────────────────────────────────────

class SoloOrchestrator:
    """Mode Solo : une seule IA ciblée"""

    def __init__(self, solo_model_id: str):
        cfg = settings.SOLO_MODELS.get(solo_model_id)
        if not cfg:
            raise ValueError(f"Modèle solo inconnu: {solo_model_id}")
        self.provider = cfg["provider"]
        self.model    = cfg["model"]
        self.model_id = solo_model_id
        self.display  = cfg["display"]

        # Choisir le prompt système selon le provider
        prompt_map = {
            "claude": "solo_claude",
            "openai": "solo_gpt",
            "gemini": "solo_gemini",
        }
        self.system_prompt = SYSTEM_PROMPTS[prompt_map[self.provider]]

    async def run(self, user_message: str, history: list) -> SoloResponse:
        messages = [{"role": m["role"], "content": m["content"]} for m in history]
        messages.append({"role": "user", "content": user_message})

        if self.provider == "claude":
            text, tokens = await self._claude(messages)
        elif self.provider == "openai":
            text, tokens = await self._openai(messages)
        elif self.provider == "gemini":
            text, tokens = await self._gemini(user_message, history)
        else:
            raise ValueError(f"Provider inconnu: {self.provider}")

        return SoloResponse(
            provider=self.provider,
            model_id=self.model_id,
            model_used=self.model,
            content=text,
            total_tokens=tokens,
        )

    async def _claude(self, messages: list) -> tuple[str, int]:
        response = await claude_client.messages.create(
            model=self.model,
            max_tokens=8192,
            system=self.system_prompt,
            messages=messages,
        )
        return response.content[0].text, response.usage.input_tokens + response.usage.output_tokens

    async def _openai(self, messages: list) -> tuple[str, int]:
        all_messages = [{"role": "system", "content": self.system_prompt}] + messages
        response = await openai_client.chat.completions.create(
            model=self.model,
            messages=all_messages,
            max_tokens=8192,
        )
        return response.choices[0].message.content, response.usage.total_tokens

    async def _gemini(self, user_message: str, history: list) -> tuple[str, int]:
        model = genai.GenerativeModel(
            model_name=self.model,
            system_instruction=self.system_prompt,
        )
        # Construire l'historique pour Gemini
        gemini_history = []
        for m in history:
            role = "user" if m["role"] == "user" else "model"
            gemini_history.append({"role": role, "parts": [m["content"]]})

        chat = model.start_chat(history=gemini_history)
        response = await asyncio.to_thread(chat.send_message, user_message)
        tokens = getattr(response.usage_metadata, "total_token_count", 0)
        return response.text, tokens

    async def stream(self, user_message: str, history: list) -> AsyncGenerator[StreamChunk, None]:
        messages = [{"role": m["role"], "content": m["content"]} for m in history]
        messages.append({"role": "user", "content": user_message})

        if self.provider == "claude":
            async with claude_client.messages.stream(
                model=self.model, max_tokens=8192,
                system=self.system_prompt, messages=messages,
            ) as s:
                async for text in s.text_stream:
                    yield StreamChunk(provider="claude", role="solo", content=text)

        elif self.provider == "openai":
            all_messages = [{"role": "system", "content": self.system_prompt}] + messages
            stream = await openai_client.chat.completions.create(
                model=self.model, messages=all_messages,
                max_tokens=8192, stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield StreamChunk(provider="openai", role="solo", content=delta)

        elif self.provider == "gemini":
            # Gemini: pas de streaming natif, on simule
            text, _ = await self._gemini(user_message, history)
            words = text.split()
            for i in range(0, len(words), 8):
                yield StreamChunk(provider="gemini", role="solo", content=" ".join(words[i:i+8]) + " ")
                await asyncio.sleep(0.015)

        yield StreamChunk(provider=self.provider, role="solo", content="", is_final=True)


# ─── Factory ──────────────────────────────────────────────────────────────────

def get_hybrid_orchestrator(model_id: str) -> HybridOrchestrator:
    cfg = settings.HYBRID_MODELS.get(model_id)
    if not cfg:
        raise ValueError(f"Modèle hybride inconnu: {model_id}")
    return HybridOrchestrator(cfg)


def get_solo_orchestrator(model_id: str) -> SoloOrchestrator:
    return SoloOrchestrator(model_id)
