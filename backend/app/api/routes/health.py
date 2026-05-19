"""Health-check route."""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter

from app.core.config import settings
from app.services.flight_data import resolve_flight_price_provider
from app.ml.features import load_airports
from app.services.price_store import price_store

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
def health() -> dict:
    """Return API health metadata."""

    fetch_meta = price_store.get_fetch_metadata()
    return {
        "status": "ok",
        "model_version": settings.model_version,
        "timestamp": datetime.utcnow().isoformat(),
        "airports_loaded": len(load_airports()),
        "price_store_entries": price_store.count_entries(),
        "last_price_fetch": fetch_meta,
        "fetch_schedule": (
            f"00:30 IST on day {settings.monthly_fetch_day} each month — "
            f"{settings.monthly_fetch_route_count} routes × {settings.monthly_fetch_week_days} days = "
            f"{settings.monthly_fetch_route_count * settings.monthly_fetch_week_days} SerpAPI calls; "
            "first week of target month; ML for other dates"
        ),
        "live_price_window": price_store.get_live_window(),
        "flight_price_provider": type(resolve_flight_price_provider()).__name__,
        "google_flights_configured": bool(settings.serpapi_api_key),
    }
