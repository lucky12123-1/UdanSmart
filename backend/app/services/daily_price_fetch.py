"""Monthly week snapshot for top routes (25 × 7 = 175 SerpAPI calls per month)."""

from __future__ import annotations

import asyncio
import json
import logging
from dataclasses import dataclass
from datetime import date, datetime, timedelta

from app.core.config import settings
from app.ml.features import TOP_25_ROUTES, TOP_30_ROUTES
from app.services.flight_data import flight_price_service
from app.services.price_store import price_store

logger = logging.getLogger(__name__)


@dataclass
class FetchSummary:
    """Result of one scheduled or manual fetch run."""

    schedule: str
    routes: int
    week_days: int
    dates_requested: int
    serpapi_calls: int
    stored: int
    missing: int
    date_from: str
    date_to: str
    anchor_date: str
    started_at: str
    finished_at: str

    def to_dict(self) -> dict:
        return {
            "schedule": self.schedule,
            "routes": self.routes,
            "week_days": self.week_days,
            "dates_requested": self.dates_requested,
            "serpapi_calls": self.serpapi_calls,
            "stored": self.stored,
            "missing": self.missing,
            "date_from": self.date_from,
            "date_to": self.date_to,
            "anchor_date": self.anchor_date,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
        }


def resolve_monthly_week_anchor(today: date | None = None) -> date:
    """
    First day of the live-price week.

    - MONTHLY_FETCH_ANCHOR_DATE set → use that (e.g. 2026-06-01 for first week of June)
    - Run on MONTHLY_FETCH_DAY (1st) → 1st of current month
    - Otherwise (mid-month manual run) → 1st of next month (avoids wasting calls on dying days)
    """

    if settings.monthly_fetch_anchor_date:
        return date.fromisoformat(settings.monthly_fetch_anchor_date)

    today = today or date.today()
    if today.day == settings.monthly_fetch_day:
        return today.replace(day=1)

    if today.month == 12:
        return date(today.year + 1, 1, 1)
    return date(today.year, today.month + 1, 1)


def active_fetch_routes() -> tuple[str, ...]:
    """Return the configured top-N India domestic routes for monthly fetch."""

    pool = TOP_30_ROUTES
    count = min(settings.monthly_fetch_route_count, len(pool))
    return tuple(pool[:count])


def week_travel_dates(
    week_days: int | None = None,
    *,
    anchor: date | None = None,
) -> list[str]:
    """Return ISO dates for the live snapshot (anchor .. anchor+N-1)."""

    start = anchor or resolve_monthly_week_anchor()
    days = week_days if week_days is not None else settings.monthly_fetch_week_days
    return [(start + timedelta(days=offset)).isoformat() for offset in range(days)]


async def _fetch_one(route: str, day: str, semaphore: asyncio.Semaphore) -> bool:
    """Fetch and store a single route-date fare."""

    origin, destination = route.split("-", 1)
    async with semaphore:
        quote = await flight_price_service.fetch_route_price(origin, destination, day)
        await asyncio.sleep(settings.flight_fetch_delay_seconds)
    if not quote:
        return False
    price_store.store_price(route, day, float(quote["price"]), quote.get("source", "google_flights"))
    return True


async def run_monthly_week_price_fetch(
    routes: tuple[str, ...] | None = None,
    *,
    week_days: int | None = None,
    anchor: date | None = None,
) -> FetchSummary:
    """
    Fetch live Google Flights fares for top routes over the first week of the target month.

    Default ~175 SerpAPI calls (25 routes × 7 days). Other travel dates use ML prediction.
    """

    active_routes = tuple(r for r in (routes or active_fetch_routes()) if r)
    anchor_day = anchor or resolve_monthly_week_anchor()
    days = week_travel_dates(week_days, anchor=anchor_day)
    started = datetime.utcnow().isoformat()
    stored = 0
    missing = 0
    semaphore = asyncio.Semaphore(4)
    serpapi_calls = len(active_routes) * len(days)

    logger.info(
        "Starting monthly week fetch: %s routes × %s days = %s SerpAPI calls (anchor %s, %s .. %s)",
        len(active_routes),
        len(days),
        serpapi_calls,
        anchor_day.isoformat(),
        days[0] if days else "-",
        days[-1] if days else "-",
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
        schedule="monthly_week",
        routes=len(active_routes),
        week_days=len(days),
        dates_requested=len(days),
        serpapi_calls=serpapi_calls,
        stored=stored,
        missing=missing,
        date_from=days[0] if days else "",
        date_to=days[-1] if days else "",
        anchor_date=anchor_day.isoformat(),
        started_at=started,
        finished_at=finished,
    )
    price_store.save_fetch_metadata(summary.to_dict())
    _write_status_file(summary)
    logger.info(
        "Monthly week fetch complete: stored=%s missing=%s serpapi_calls=%s",
        stored,
        missing,
        serpapi_calls,
    )
    return summary


def _write_status_file(summary: FetchSummary) -> None:
    """Persist last run summary under backend/data for quick inspection."""

    path = settings.data_dir / "fetch_status.json"
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(summary.to_dict(), indent=2), encoding="utf-8")


def run_monthly_week_price_fetch_sync() -> FetchSummary:
    """Synchronous entrypoint for APScheduler and CLI scripts."""

    return asyncio.run(run_monthly_week_price_fetch())


run_daily_price_fetch = run_monthly_week_price_fetch
run_daily_price_fetch_sync = run_monthly_week_price_fetch_sync
