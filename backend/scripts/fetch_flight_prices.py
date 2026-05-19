"""CLI: monthly week snapshot — 25 routes × 7 days = 175 SerpAPI calls."""

from __future__ import annotations

from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.services.daily_price_fetch import run_monthly_week_price_fetch_sync


if __name__ == "__main__":
    summary = run_monthly_week_price_fetch_sync()
    print(
        f"schedule={summary.schedule} routes={summary.routes} week_days={summary.week_days} "
        f"serpapi_calls={summary.serpapi_calls} stored={summary.stored} missing={summary.missing} "
        f"window={summary.date_from}..{summary.date_to}"
    )
