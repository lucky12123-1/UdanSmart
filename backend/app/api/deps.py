"""API dependency helpers."""

from __future__ import annotations

from app.services.festive_archive import festive_archive, FestiveArchive
from app.services.price_store import price_store, PriceStore


def get_price_store() -> PriceStore:
    """Return the shared price store."""

    return price_store


def get_festive_archive() -> FestiveArchive:
    """Return the shared festive archive."""

    return festive_archive
