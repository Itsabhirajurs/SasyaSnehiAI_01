"""Application configuration for Sashyasnehi AI."""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")

    MODEL_PATH = os.getenv("MODEL_PATH", str(BASE_DIR / "model" / "disease_model.keras"))
    CLASS_MAP_PATH = os.getenv("CLASS_MAP_PATH", str(BASE_DIR / "model" / "class_names.json"))

    OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
    OPENWEATHER_BASE_URL = os.getenv("OPENWEATHER_BASE_URL", "https://api.openweathermap.org/data/2.5")

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "models/gemini-2.0-flash")

    # Google Maps API (Geocoding + Places)
    GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

    # data.gov.in API key (free farmer data + market prices + govt schemes)
    DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY", "")

    # LibreTranslate endpoint (free, no key needed for public instance)
    LIBRETRANSLATE_URL = os.getenv("LIBRETRANSLATE_URL", "https://libretranslate.com")
    LIBRETRANSLATE_API_KEY = os.getenv("LIBRETRANSLATE_API_KEY", "")

    # Community DB path
    COMMUNITY_DB = str(BASE_DIR / "community.db")

    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    UPLOAD_FOLDER = str(BASE_DIR / "static" / "uploads")

    DEFAULT_LANGUAGE = "English"
    SUPPORTED_LANGUAGES = ["English", "Hindi", "Kannada"]

    # Language codes for LibreTranslate
    LANG_CODES = {"English": "en", "Hindi": "hi", "Kannada": "kn"}
