"""Translation service using LibreTranslate (free, no key required for basic use)."""

from __future__ import annotations

import requests

# Language codes supported
LANG_CODES = {
    "English": "en",
    "Hindi": "hi",
    "Kannada": "kn",
}

# LibreTranslate public endpoints (try in order)
LT_ENDPOINTS = [
    "https://libretranslate.de",
    "https://translate.argosopentech.com",
    "https://libretranslate.com",
]


def translate(text: str, target_lang: str, source_lang: str = "en",
              api_key: str = "", base_url: str = "") -> str:
    """
    Translate text using LibreTranslate.
    Falls back to original text if translation unavailable.
    """
    if not text or target_lang == "en" or target_lang == "English":
        return text

    lang_code = LANG_CODES.get(target_lang, target_lang)
    if lang_code == "en":
        return text

    endpoints = [base_url] + LT_ENDPOINTS if base_url else LT_ENDPOINTS

    for endpoint in endpoints:
        try:
            url = f"{endpoint.rstrip('/')}/translate"
            payload = {
                "q": text,
                "source": source_lang,
                "target": lang_code,
                "format": "text",
            }
            if api_key:
                payload["api_key"] = api_key

            resp = requests.post(url, json=payload, timeout=10)
            data = resp.json()

            if "translatedText" in data:
                return data["translatedText"]
        except Exception:
            continue

    return text  # Return original if all endpoints fail


def translate_dict(data: dict, keys: list[str], target_lang: str,
                   api_key: str = "", base_url: str = "") -> dict:
    """Translate specific keys in a dictionary."""
    if target_lang in ("en", "English"):
        return data
    result = dict(data)
    for key in keys:
        if key in result and result[key]:
            result[key] = translate(str(result[key]), target_lang, api_key=api_key, base_url=base_url)
    return result


def batch_translate(texts: list[str], target_lang: str,
                    api_key: str = "", base_url: str = "") -> list[str]:
    """Translate a list of strings."""
    return [translate(t, target_lang, api_key=api_key, base_url=base_url) for t in texts]
