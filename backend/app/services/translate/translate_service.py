"""
Service Google Translate v2 — Syntax AI
Traduit les réponses IA en préservant les blocs de code
"""

import re
import httpx
import logging
import asyncio
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("syntax-ai.translate")

GOOGLE_TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2"
SUPPORTED_LANGS = {"fr","en","es","de","it","pt","ja","zh","ar","ko","ru","nl","pl","sv","tr","hi"}
_CODE_PLACEHOLDER = "CODEBLOCK{i}END"
_CODE_RE = re.compile(r'(```[\s\S]*?```|`[^`\n]+`)', re.MULTILINE)


def _extract_code(text: str) -> tuple[str, list]:
    blocks = []
    def replace(m):
        idx = len(blocks)
        blocks.append(m.group(0))
        return _CODE_PLACEHOLDER.format(i=idx)
    return _CODE_RE.sub(replace, text), blocks


def _restore_code(text: str, blocks: list) -> str:
    for i, b in enumerate(blocks):
        text = text.replace(_CODE_PLACEHOLDER.format(i=i), b)
    return text


async def translate_text(text: str, target_lang: str, preserve_code: bool = True) -> str:
    if not text.strip() or not settings.GOOGLE_TRANSLATE_API_KEY:
        return text
    if target_lang not in SUPPORTED_LANGS:
        return text

    blocks = []
    to_translate = text
    if preserve_code:
        to_translate, blocks = _extract_code(text)
    if not to_translate.strip():
        return text

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(GOOGLE_TRANSLATE_URL, json={
                "q": to_translate, "target": target_lang,
                "format": "text", "key": settings.GOOGLE_TRANSLATE_API_KEY,
            })
            resp.raise_for_status()
            translated = resp.json()["data"]["translations"][0]["translatedText"]
        if preserve_code and blocks:
            translated = _restore_code(translated, blocks)
        return translated
    except Exception as e:
        logger.error(f"Translate error: {e}")
        return text


async def translate_hybrid(backend: str, frontend: str, docs: str,
                            target_lang: str, preserve_code: bool = True):
    if target_lang == "fr":
        return backend, frontend, docs
    results = await asyncio.gather(
        translate_text(backend,   target_lang, preserve_code),
        translate_text(frontend,  target_lang, preserve_code),
        translate_text(docs,      target_lang, preserve_code),
        return_exceptions=True,
    )
    safe = lambda r, fb: r if isinstance(r, str) else fb
    return safe(results[0], backend), safe(results[1], frontend), safe(results[2], docs)


async def translate_solo(content: str, target_lang: str, preserve_code: bool = True) -> str:
    if target_lang == "fr":
        return content
    return await translate_text(content, target_lang, preserve_code)
