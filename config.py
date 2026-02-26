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

    MAX_CONTENT_LENGTH = 8 * 1024 * 1024
    UPLOAD_FOLDER = str(BASE_DIR / "static" / "uploads")

    DEFAULT_LANGUAGE = "English"
    SUPPORTED_LANGUAGES = ["English", "Hindi", "Kannada"]
