"""
Export Service — Syntax AI
Génère un ZIP structuré depuis les messages d'une conversation
"""

import io
import re
import zipfile
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.models import Conversation, Message, MessageRole, ChatMode


async def export_conversation_zip(
    db: AsyncSession,
    conversation_id: str,
    user_id: str,
) -> Optional[bytes]:
    """
    Exporte une conversation en ZIP avec structure :
    /backend/   — code Claude
    /frontend/  — code GPT
    /docs/      — docs Gemini
    /chat.md    — historique de la conversation
    README.md   — instructions
    """
    # Vérifier la conversation
    r = await db.execute(
        select(Conversation).where(
            Conversation.id == user_id,
            Conversation.user_id == user_id,
        )
    )
    # On récupère par id (pas user_id)
    r2 = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conv = r2.scalar_one_or_none()
    if not conv or conv.user_id != user_id:
        return None

    # Récupérer les messages
    msgs_r = await db.execute(
        select(Message).where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    messages = msgs_r.scalars().all()

    # Construire le ZIP en mémoire
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:

        # README
        readme = f"""# {conv.title}
Exporté depuis Syntax AI — ai.syntax-lab.site

## Mode : {"Hybride" if conv.mode == ChatMode.HYBRID else "Solo"}
## Modèle : {conv.model_id}

## Structure
- /backend/   → Code backend (Claude)
- /frontend/  → Code frontend (GPT)
- /docs/      → Documentation (Gemini)
- chat.md     → Historique complet

## Comment utiliser
1. Installez les dépendances : `cd backend && pip install -r requirements.txt`
2. Lancez le projet : `docker compose up -d`
3. Consultez /docs/README.md pour les instructions complètes
"""
        zf.writestr("README.md", readme)

        # Chat history
        chat_md = f"# Historique — {conv.title}\n\n"
        backend_code  = []
        frontend_code = []
        docs_code     = []

        for msg in messages:
            if msg.role == MessageRole.USER:
                chat_md += f"## 🧑 Vous\n{msg.content}\n\n"
            elif msg.role == MessageRole.ASSISTANT:
                provider_label = {
                    "claude":      "🔵 Claude (Backend)",
                    "openai":      "🟢 GPT (Frontend)",
                    "gemini":      "🔴 Gemini (Docs)",
                    "orchestrator":"⬡ Syntax AI",
                }.get(msg.provider or "", "⬡ Syntax AI")

                chat_md += f"## {provider_label}\n{msg.content}\n\n"

                # Extraire les blocs de code
                if msg.code_role == "backend" or msg.provider == "claude":
                    backend_code.append(msg.content)
                elif msg.code_role == "frontend" or msg.provider == "openai":
                    frontend_code.append(msg.content)
                elif msg.code_role == "assets_docs" or msg.provider == "gemini":
                    docs_code.append(msg.content)

        zf.writestr("chat.md", chat_md)

        # Extraire et organiser les fichiers de code
        _add_code_files(zf, "backend",  backend_code,  "python")
        _add_code_files(zf, "frontend", frontend_code, "typescript")
        _add_code_files(zf, "docs",     docs_code,     "markdown")

        # docker-compose.yml minimal
        docker_compose = """version: "3.9"
services:
  api:
    build: ./backend
    ports: ["8000:8000"]
    env_file: ./backend/.env
    depends_on: [db, redis]
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: syntaxai
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes: [postgres_data:/var/lib/postgresql/data]
  redis:
    image: redis:7-alpine
  web:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
volumes:
  postgres_data:
"""
        zf.writestr("docker-compose.yml", docker_compose)

    buf.seek(0)
    return buf.read()


def _add_code_files(zf: zipfile.ZipFile, folder: str, contents: list, default_lang: str):
    """Extrait les blocs de code et les ajoute au ZIP"""
    code_block_re = re.compile(r'```(\w*)\n([\s\S]*?)```', re.MULTILINE)
    file_path_re  = re.compile(r'(?:^|\n)(?:#+ )?`?([a-zA-Z0-9_\-/]+\.[a-zA-Z]{1,6})`?', re.MULTILINE)

    all_text = "\n\n".join(contents)
    if not all_text.strip():
        zf.writestr(f"{folder}/.gitkeep", "")
        return

    file_counter = {}
    found_files = False

    for match in code_block_re.finditer(all_text):
        lang    = match.group(1) or default_lang
        code    = match.group(2)
        start   = match.start()

        # Chercher un nom de fichier juste avant ce bloc
        preceding = all_text[max(0, start-200):start]
        path_match = list(file_path_re.finditer(preceding))
        if path_match:
            filename = path_match[-1].group(1)
            # Éviter les doublons
            if filename in file_counter:
                file_counter[filename] += 1
                base, ext = filename.rsplit(".", 1) if "." in filename else (filename, "")
                filename = f"{base}_{file_counter[filename]}.{ext}"
            else:
                file_counter[filename] = 0
            filepath = f"{folder}/{filename}"
        else:
            # Générer un nom automatique selon le langage
            ext_map = {
                "python": "py", "typescript": "ts", "javascript": "js",
                "tsx": "tsx", "jsx": "jsx", "markdown": "md",
                "yaml": "yml", "bash": "sh", "sql": "sql",
            }
            ext = ext_map.get(lang, lang or "txt")
            n   = file_counter.get(f"auto_{ext}", 0)
            file_counter[f"auto_{ext}"] = n + 1
            filepath = f"{folder}/file_{n+1}.{ext}"

        zf.writestr(filepath, code)
        found_files = True

    # Si aucun bloc de code trouvé, écrire le texte brut
    if not found_files:
        ext = {"python": "md", "typescript": "md", "markdown": "md"}.get(default_lang, "md")
        zf.writestr(f"{folder}/content.{ext}", all_text)
