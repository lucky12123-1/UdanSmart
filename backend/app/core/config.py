"""Application configuration for SkyPredict India."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(*_args: object, **_kwargs: object) -> bool:
        return False

ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    """Runtime settings loaded from environment variables."""

    app_name: str = os.getenv("APP_NAME", "SkyPredict India")
    debug: bool = os.getenv("DEBUG", "True").lower() == "true"
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    model_path: str = os.getenv("MODEL_PATH", "models/lgbm_model.pkl")
    skyscanner_rapidapi_key: str = os.getenv("SKYSCANNER_RAPIDAPI_KEY", "")
    price_store_ttl_days: int = int(os.getenv("PRICE_STORE_TTL_DAYS", "90"))
    festive_archive_path: str = os.getenv(
        "FESTIVE_ARCHIVE_PATH", "data/festive_prices_archive.json"
    )
    cache_ttl_seconds: int = int(os.getenv("CACHE_TTL_SECONDS", "21600"))
    daily_fetch_cron: str = os.getenv("DAILY_FETCH_CRON", "30 19 * * *")
    api_prefix: str = "/api"
    model_version: str = "india-domestic-v1.0"

    @property
    def allowed_origins(self) -> list[str]:
        """Return CORS allowed origins from environment."""
        raw = os.getenv(
            "ALLOWED_ORIGINS",
            '["http://localhost:5173","http://127.0.0.1:5173"]'
        )
        try:
            return json.loads(raw)
        except (json.JSONDecodeError, ValueError):
            return ["http://localhost:5173", "http://127.0.0.1:5173"]

    @property
    def backend_dir(self) -> Path:
        """Return the backend root directory."""
        return ROOT_DIR

    @property
    def data_dir(self) -> Path:
        """Return the data directory path."""
        return ROOT_DIR / "data"

    @property
    def resolved_model_path(self) -> Path:
        """Return the absolute model path."""
        return ROOT_DIR / self.model_path

    @property
    def resolved_festive_archive_path(self) -> Path:
        """Return the absolute festive archive path."""
        return ROOT_DIR / self.festive_archive_path


settings = Settings()