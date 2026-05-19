"""FastAPI application entrypoint for SkyPredict India."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from zoneinfo import ZoneInfo

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import airports, health, predict
from app.core.config import settings
from app.services.daily_price_fetch import run_monthly_week_price_fetch_sync

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

IST = ZoneInfo("Asia/Kolkata")
scheduler = BackgroundScheduler(timezone=IST)


def scheduled_price_fetch() -> None:
    """Monthly job: 7 days × 25 routes = 175 SerpAPI calls (under 250/mo budget)."""

    try:
        summary = run_monthly_week_price_fetch_sync()
        logger.info(
            "Scheduled monthly fetch: stored=%s missing=%s calls=%s window=%s..%s",
            summary.stored,
            summary.missing,
            summary.serpapi_calls,
            summary.date_from,
            summary.date_to,
        )
    except Exception:
        logger.exception("Scheduled price fetch failed")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start and stop APScheduler around the app lifetime."""
    if not scheduler.running:
        scheduler.add_job(
            scheduled_price_fetch,
            "cron",
            day=settings.monthly_fetch_day,
            hour=0,
            minute=30,
            id="monthly_week_price_fetch",
            replace_existing=True,
        )
        scheduler.start()
        logger.info(
            "Scheduled monthly Google Flights fetch: day %s of month at 00:30 IST "
            "(%s routes × %s days = %s SerpAPI calls, first week of target month)",
            settings.monthly_fetch_day,
            settings.monthly_fetch_route_count,
            settings.monthly_fetch_week_days,
            settings.monthly_fetch_route_count * settings.monthly_fetch_week_days,
        )
    yield
    if scheduler.running:
        scheduler.shutdown(wait=False)


app = FastAPI(
    title=settings.app_name,
    version=settings.model_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(airports.router, prefix=settings.api_prefix)
app.include_router(predict.router, prefix=settings.api_prefix)


@app.get("/")
def root() -> dict[str, str]:
    """Root API message."""
    return {"message": "SkyPredict India API", "docs": "/docs"}
