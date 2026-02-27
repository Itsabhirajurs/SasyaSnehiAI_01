"""Supabase client helpers for auth verification and lightweight queries."""

from __future__ import annotations

import logging
from functools import lru_cache
from typing import Any, Dict, Optional

from supabase import Client, create_client


@lru_cache(maxsize=1)
def _client(url: str, key: str) -> Client:
    return create_client(url, key)


def get_client(url: str, key: str) -> Client:
    return _client(url, key)


def verify_token(token: str | None, url: str, key: str) -> Optional[Dict[str, Any]]:
    """Validate Supabase access token and return user payload or None.

    Uses supabase.auth.get_user which verifies signature server-side.
    """
    if not token:
        return None
    try:
        supabase = _client(url, key)
        res = supabase.auth.get_user(token)
        user = res.user if res else None
        if not user:
            return None
        metadata = getattr(user, "user_metadata", {}) or {}
        return {
            "id": getattr(user, "id", None),
            "email": getattr(user, "email", None),
            "phone": getattr(user, "phone", None),
            "metadata": metadata,
            "raw": user.model_dump() if hasattr(user, "model_dump") else user,
        }
    except Exception as exc:  # noqa: BLE001
        logging.warning("Supabase token verification failed: %s", exc)
        return None
