# 🧠 Syntax AI

> L'IA collaborative pour développeurs — Claude × GPT × Gemini en synergie
> **Domain :** ai.syntax-lab.site

---

## 🏗️ Architecture

```
syntax-ai/
├── backend/              # FastAPI (Python)
│   └── app/
│       ├── main.py
│       ├── core/
│       │   ├── config.py      # Config centrale + modèles hybrides
│       │   ├── database.py    # PostgreSQL async
│       │   └── redis.py       # Rate limiting + cache
│       ├── models/
│       │   └── models.py      # SQLAlchemy : User, APIKey, Conversation...
│       ├── services/
│       │   ├── ai/
│       │   │   └── orchestrator.py   # ⭐ Cœur : Claude+GPT+Gemini
│       │   ├── auth/
│       │   │   └── auth_service.py
│       │   └── billing/
│       └── api/v1/
│           ├── router.py
│           ├── deps.py
│           └── endpoints/
│               ├── auth.py       # Register, Login, Refresh
│               ├── chat.py       # Chat + streaming SSE
│               ├── models.py     # Modèles disponibles
│               ├── apikeys.py    # Gestion clés API
│               ├── billing.py    # Stripe + plans
│               └── usage.py     # Tokens & stats
├── frontend/             # Next.js (à venir)
├── mobile/               # Flutter (à venir)
├── docker-compose.yml
└── README.md
```

---

## 🤖 Modèles Hybrides

Chaque modèle **Syntax** = 3 IA travaillant ensemble :

| Modèle        | Plan     | Prix     | Claude          | GPT          | Gemini              |
|---------------|----------|----------|-----------------|--------------|---------------------|
| Syntax Free   | Gratuit  | 0€       | claude-haiku    | gpt-4o-mini  | gemini-1.5-flash    |
| Syntax Starter| Starter  | 4,99€/m  | claude-sonnet   | gpt-4o       | gemini-1.5-pro      |
| Syntax Pro    | Pro      | 14,99€/m | claude-opus     | gpt-4o       | gemini-1.5-pro      |
| Syntax Team   | Team     | 49,99€/m | claude-opus-4-8 | gpt-4o       | gemini-2.0-flash    |

### Division des rôles
- 🔵 **Claude** → Backend (API, logique, sécurité, BDD)
- 🟢 **GPT** → Frontend (React, UI/UX, CSS, composants)
- 🔴 **Gemini** → Assets & Docs (design system, README, config)

---

## 🔑 Types de clés API

| Type         | Prix       | Tokens         | Usage                          |
|--------------|------------|----------------|--------------------------------|
| `user_free`  | Gratuit    | 50K/mois       | Tests, projets perso           |
| `user_pay`   | Plan requis| Selon plan     | Apps personnelles              |
| `reseller`   | 5$/mois    | Illimité*      | Revente, SaaS, multi-clients   |

> *Reseller : facturation à l'usage, tokens "pass-through" pour tes clients

---

## 🚀 Installation

### Prérequis
- Python 3.12+
- PostgreSQL 16+
- Redis 7+
- Comptes : Anthropic, OpenAI, Google AI Studio, Stripe

### 1. Clone & Config
```bash
git clone https://github.com/syntax-lab/syntax-ai
cd syntax-ai/backend
cp .env.example .env
# Remplir les clés API dans .env
```

### 2. Docker (recommandé)
```bash
docker compose up -d
```

### 3. Manuel
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API disponible sur : http://localhost:8000
Docs Swagger : http://localhost:8000/docs

---

## 📡 API Reference

### Authentification
```
POST /api/v1/auth/register    — Créer un compte
POST /api/v1/auth/login       — Connexion
POST /api/v1/auth/refresh     — Rafraîchir le token
```

### Chat
```
POST /api/v1/chat/completions       — Chat (JWT)
POST /api/v1/chat/api/completions   — Chat (clé API)
```

### Exemple d'appel
```bash
curl -X POST https://ai.syntax-lab.site/api/v1/chat/api/completions \
  -H "Authorization: Bearer sk-syntax-free-xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "syntax-free-1",
    "messages": [{"role": "user", "content": "Crée une API REST en FastAPI avec auth JWT"}],
    "stream": false
  }'
```

### Réponse
```json
{
  "model": "syntax-free-1",
  "backend": "# Code FastAPI généré par Claude...",
  "frontend": "// Composants React générés par GPT...",
  "assets_docs": "# Documentation générée par Gemini...",
  "usage": {
    "total_tokens": 3240,
    "remaining_tokens": 46760
  }
}
```

---

## 💳 Plans

| Plan     | Prix    | Tokens/jour | Rate limit  |
|----------|---------|-------------|-------------|
| Free     | 0€      | 100K        | 10 req/min  |
| Starter  | 4,99€   | 500K        | 30 req/min  |
| Pro      | 14,99€  | 2M          | 100 req/min |
| Team     | 49,99€  | 10M         | 500 req/min |
| Reseller | 5$/mois | Illimité    | 2000 req/min|

---

## 🛣️ Roadmap

- [x] Backend FastAPI complet
- [x] Orchestrateur IA hybride (Claude+GPT+Gemini)
- [x] Authentification JWT
- [x] Gestion des clés API (free, pay, reseller)
- [x] Facturation Stripe
- [x] Tracking des tokens
- [ ] Frontend Next.js (landing + dashboard)
- [ ] App Flutter (mobile + desktop)
- [ ] Workspace équipe
- [ ] Export de projet (ZIP)
- [ ] GitHub integration

---

*Syntax AI — Codez mieux, plus vite, ensemble.*
