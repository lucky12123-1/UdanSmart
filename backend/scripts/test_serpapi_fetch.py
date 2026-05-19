"""One-shot SerpAPI / Google Flights connectivity test (DEL → BOM)."""

from __future__ import annotations

import asyncio
import json
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.config import settings
from app.services.flight_data import extract_google_flights_lowest_price, google_flights_service


async def main() -> None:
    key = settings.serpapi_api_key
    print(f"SERPAPI_API_KEY configured: {bool(key)} (length={len(key)})")
    print(f"FLIGHT_PRICE_PROVIDER: {settings.flight_price_provider}")

    if not key:
        print("\nFix: set SERPAPI_API_KEY in backend/.env and restart Docker:")
        print("  docker compose up -d --force-recreate backend")
        sys.exit(1)

    travel_day = (date.today() + timedelta(days=14)).isoformat()
    print(f"\nTesting DEL → BOM on {travel_day}...")

    import httpx

    params = {
        "engine": "google_flights",
        "api_key": key,
        "departure_id": "DEL",
        "arrival_id": "BOM",
        "outbound_date": travel_day,
        "type": "2",
        "travel_class": "1",
        "adults": "1",
        "currency": settings.google_flights_currency,
        "gl": settings.google_flights_gl,
        "hl": settings.google_flights_hl,
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get("https://serpapi.com/search", params=params)
        print(f"HTTP status: {response.status_code}")
        payload = response.json()

    if payload.get("error"):
        print(f"SerpAPI error: {payload['error']}")
        sys.exit(1)

    meta = payload.get("search_metadata") or {}
    print(f"SerpAPI status: {meta.get('status', 'unknown')}")

    price = extract_google_flights_lowest_price(payload)
    quote = await google_flights_service.fetch_route_price("DEL", "BOM", travel_day)
    print(f"Extracted lowest price: {price}")
    print(f"Service quote: {quote}")

    if not quote:
        print("\nRaw response snippet:")
        snippet = {
            k: payload.get(k)
            for k in ("search_metadata", "error", "price_insights", "best_flights", "other_flights")
            if k in payload
        }
        print(json.dumps(snippet, indent=2, default=str)[:2000])
        sys.exit(1)

    print("\nOK — SerpAPI is working. Re-run the daily fetch.")


if __name__ == "__main__":
    asyncio.run(main())
