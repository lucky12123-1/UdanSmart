"""Health-check route."""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter

from app.core.config import settings
from app.ml.features import load_airports
from app.services.price_store import price_store

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
def health() -> dict:
    """Return API health metadata."""

    return {
        "status": "ok",
        "model_version": settings.model_version,
        "timestamp": datetime.utcnow().isoformat(),
        "airports_loaded": len(load_airports()),
        "price_store_entries": price_store.count_entries(),
        "last_price_fetch": None,
    }
