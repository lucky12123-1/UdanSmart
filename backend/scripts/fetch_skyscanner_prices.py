"""CLI: daily top-30 route fetch (alternating 45-day batches over a 90-day window)."""

from __future__ import annotations

from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.services.daily_price_fetch import run_daily_price_fetch_sync


if __name__ == "__main__":
    summary = run_daily_price_fetch_sync()
    print(
        f"Batch={summary.batch} routes={summary.routes} "
        f"stored={summary.stored} missing={summary.missing} "
        f"dates={summary.dates_requested}"
    )
