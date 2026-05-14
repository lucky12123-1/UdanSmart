"""FastAPI application entrypoint for SkyPredict India."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import airports, health, predict
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.app_name, version=settings.model_version)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(airports.router, prefix=settings.api_prefix)
app.include_router(predict.router, prefix=settings.api_prefix)

scheduler = BackgroundScheduler(timezone="UTC")


def scheduled_price_fetch() -> None:
    """Placeholder scheduler hook for the daily Skyscanner fetch script."""

    logger.info("Daily price fetch trigger fired at %s", datetime.utcnow().isoformat())


@app.on_event("startup")
def start_scheduler() -> None:
    """Start APScheduler for daily price fetches at 00:30 IST."""

    if not scheduler.running:
        scheduler.add_job(scheduled_price_fetch, "cron", hour=19, minute=0, id="daily_price_fetch", replace_existing=True)
        scheduler.start()
        logger.info("Scheduled daily price fetch for 19:00 UTC / 00:30 IST")


@app.on_event("shutdown")
def stop_scheduler() -> None:
    """Stop the scheduler cleanly."""

    if scheduler.running:
        scheduler.shutdown(wait=False)


@app.get("/")
def root() -> dict[str, str]:
    """Root API message."""

    return {"message": "SkyPredict India API", "docs": "/docs"}
