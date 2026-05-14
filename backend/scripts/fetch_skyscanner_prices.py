"""Daily Skyscanner price fetch for India domestic routes."""

from __future__ import annotations

import asyncio
from datetime import date, timedelta
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.ml.features import ROUTE_BASE_PRICES
from app.services.flight_data import skyscanner_service
from app.services.price_store import price_store


async def run() -> None:
    """Fetch today plus next 90 days for every active India route."""

    days = [(date.today() + timedelta(days=offset)).isoformat() for offset in range(91)]
    success = 0
    missing = 0
    for route in ROUTE_BASE_PRICES:
        origin, destination = route.split("-")
        route_success = 0
        for day in days:
            quote = await skyscanner_service.fetch_route_price(origin, destination, day)
            if quote:
                price_store.store_price(route, day, float(quote["price"]), quote.get("source", "skyscanner"))
                success += 1
                route_success += 1
            else:
                missing += 1
        if route_success == 0:
            price_store.mark_no_flights(route)
    print(f"Skyscanner fetch complete: stored={success}, missing={missing}, routes={len(ROUTE_BASE_PRICES)}")


if __name__ == "__main__":
    asyncio.run(run())
