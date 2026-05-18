"""Daily top-route price fetch with alternating 90-day window batches."""

from __future__ import annotations

import asyncio
import json
import logging
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Literal

from app.core.config import settings
from app.ml.features import TOP_30_ROUTES
from app.services.flight_data import skyscanner_service
from app.services.price_store import price_store

logger = logging.getLogger(__name__)

FetchBatch = Literal["first_half", "second_half"]
FORWARD_WINDOW_DAYS = 90


@dataclass
class FetchSummary:
    """Result of one scheduled or manual fetch run."""

    batch: FetchBatch
    routes: int
    dates_requested: int
    stored: int
    missing: int
    started_at: str
    finished_at: str

    def to_dict(self) -> dict:
        return {
            "batch": self.batch,
            "routes": self.routes,
            "dates_requested": self.dates_requested,
            "stored": self.stored,
            "missing": self.missing,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
        }


def day_offsets_for_today(window_days: int = FORWARD_WINDOW_DAYS) -> tuple[FetchBatch, list[int]]:
    """
    Alternate which half of the forward 90-day window is fetched each calendar day.

    Even ordinal days: today .. today+44 (45 days).
    Odd ordinal days: today+45 .. today+89 (45 days).
    Over two days the full 90-day horizon is refreshed with half the API load per run.
    """

    half = window_days // 2
    if date.today().toordinal() % 2 == 0:
        return "first_half", list(range(half))
    return "second_half", list(range(half, window_days))


def travel_dates_for_offsets(offsets: list[int]) -> list[str]:
    """Map day offsets from today into ISO date strings."""

    today = date.today()
    return [(today + timedelta(days=offset)).isoformat() for offset in offsets]


async def _fetch_one(route: str, day: str, semaphore: asyncio.Semaphore) -> bool:
    """Fetch and store a single route-date fare."""

    origin, destination = route.split("-", 1)
    async with semaphore:
        quote = await skyscanner_service.fetch_route_price(origin, destination, day)
        await asyncio.sleep(0.25)
    if not quote:
        return False
    price_store.store_price(route, day, float(quote["price"]), quote.get("source", "skyscanner"))
    return True


async def run_daily_price_fetch(
    routes: tuple[str, ...] | None = None,
    *,
    window_days: int = FORWARD_WINDOW_DAYS,
) -> FetchSummary:
    """
    Fetch live fares for top routes and store them in Redis (90-day TTL per key).

    Uses an alternating half-window strategy so each run requests ~30 routes × 45 days.
    """

    active_routes = tuple(r for r in (routes or TOP_30_ROUTES) if r)
    batch, offsets = day_offsets_for_today(window_days)
    days = travel_dates_for_offsets(offsets)
    started = datetime.utcnow().isoformat()
    stored = 0
    missing = 0
    semaphore = asyncio.Semaphore(4)

    logger.info(
        "Starting %s fetch: %s routes × %s days (offsets %s..%s)",
        batch,
        len(active_routes),
        len(days),
        offsets[0] if offsets else "-",
        offsets[-1] if offsets else "-",
    )

    for route in active_routes:
        route_stored = 0
        tasks = [_fetch_one(route, day, semaphore) for day in days]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for result in results:
            if isinstance(result, Exception):
                missing += 1
                logger.warning("Fetch error on %s: %s", route, result)
            elif result:
                stored += 1
                route_stored += 1
            else:
                missing += 1
        if route_stored == 0:
            price_store.mark_no_flights(route)

    finished = datetime.utcnow().isoformat()
    summary = FetchSummary(
        batch=batch,
        routes=len(active_routes),
        dates_requested=len(days),
        stored=stored,
        missing=missing,
        started_at=started,
        finished_at=finished,
    )
    price_store.save_fetch_metadata(summary.to_dict())
    _write_status_file(summary)
    logger.info(
        "Fetch complete (%s): stored=%s missing=%s routes=%s",
        batch,
        stored,
        missing,
        len(active_routes),
    )
    return summary


def _write_status_file(summary: FetchSummary) -> None:
    """Persist last run summary under backend/data for quick inspection."""

    path = settings.data_dir / "fetch_status.json"
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(summary.to_dict(), indent=2), encoding="utf-8")


def run_daily_price_fetch_sync() -> FetchSummary:
    """Synchronous entrypoint for APScheduler and CLI scripts."""

    return asyncio.run(run_daily_price_fetch())
