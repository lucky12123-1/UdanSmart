"""Flight price providers — Google Flights (SerpAPI) with optional Skyscanner fallback."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from typing import Any, Protocol

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

SERPAPI_URL = "https://serpapi.com/search"


class FlightPriceProvider(Protocol):
    """Fetch a single route-date economy fare in INR."""

    async def fetch_route_price(self, origin: str, dest: str, date: str) -> dict[str, Any] | None: ...


def extract_google_flights_lowest_price(payload: dict[str, Any]) -> float | None:
    """Return the lowest INR/USD price from a SerpAPI Google Flights response."""

    if payload.get("error"):
        return None

    candidates: list[float] = []
    insights = payload.get("price_insights") or {}
    lowest = insights.get("lowest_price")
    if isinstance(lowest, (int, float)):
        candidates.append(float(lowest))

    for bucket in ("best_flights", "other_flights"):
        for offer in payload.get(bucket) or []:
            price = offer.get("price")
            if isinstance(price, (int, float)):
                candidates.append(float(price))

    return min(candidates) if candidates else None


def extract_skyscanner_price(payload: dict[str, Any]) -> float | None:
    """Extract the lowest quoted price from flexible Skyscanner payload shapes."""

    candidates: list[float] = []
    stack: list[Any] = [payload]
    while stack:
        current = stack.pop()
        if isinstance(current, dict):
            for key, value in current.items():
                if key.lower() in {"price", "rawprice", "amount"} and isinstance(value, (int, float)):
                    candidates.append(float(value))
                elif isinstance(value, (dict, list)):
                    stack.append(value)
        elif isinstance(current, list):
            stack.extend(current)
    return min(candidates) if candidates else None


class GoogleFlightsService:
    """Fetch India domestic one-way economy fares via SerpAPI's Google Flights engine."""

    def __init__(self) -> None:
        self.timeout = httpx.Timeout(settings.serpapi_timeout_seconds)

    async def fetch_route_price(self, origin: str, dest: str, date: str) -> dict[str, Any] | None:
        if not settings.serpapi_api_key:
            logger.warning("SERPAPI_API_KEY not set — skipping Google Flights fetch for %s-%s %s", origin, dest, date)
            return None

        params = {
            "engine": "google_flights",
            "api_key": settings.serpapi_api_key,
            "departure_id": origin.upper(),
            "arrival_id": dest.upper(),
            "outbound_date": date,
            "type": "2",
            "travel_class": "1",
            "adults": "1",
            "currency": settings.google_flights_currency,
            "gl": settings.google_flights_gl,
            "hl": settings.google_flights_hl,
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(SERPAPI_URL, params=params)
                response.raise_for_status()
                payload = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            logger.warning("Google Flights fetch failed for %s-%s %s: %s", origin, dest, date, exc)
            return None

        if payload.get("error"):
            logger.warning(
                "SerpAPI error for %s-%s %s: %s",
                origin,
                dest,
                date,
                payload.get("error"),
            )
            return None

        metadata = payload.get("search_metadata") or {}
        if metadata.get("status") and metadata.get("status") != "Success":
            logger.warning(
                "SerpAPI status %s for %s-%s %s",
                metadata.get("status"),
                origin,
                dest,
                date,
            )
            return None

        price = extract_google_flights_lowest_price(payload)
        if price is None:
            logger.warning(
                "No Google Flights quote for %s-%s %s (keys: %s)",
                origin,
                dest,
                date,
                [key for key in ("best_flights", "other_flights", "price_insights") if payload.get(key)],
            )
            return None

        return {
            "price": float(price),
            "currency": settings.google_flights_currency,
            "fetched_at": datetime.utcnow(),
            "source": "google_flights",
        }


class SkyscannerService:
    """Legacy Skyscanner browse endpoint (optional fallback)."""

    def __init__(self) -> None:
        self.timeout = httpx.Timeout(12.0)

    async def fetch_route_price(self, origin: str, dest: str, date: str) -> dict[str, Any] | None:
        year_month = date[:7]
        url = (
            "https://www.skyscanner.net/g/browse-view-bff/dataservices/browse/v3/bvweb/"
            f"IN/INR/en-IN/flights/from/{origin}/{dest}/{date}/"
        )
        params = {"apikey": "", "iym": year_month, "ticketclassid": "Economy"}
        headers = {"user-agent": "SkyPredictIndia/1.0"}
        if settings.skyscanner_rapidapi_key:
            headers["x-rapidapi-key"] = settings.skyscanner_rapidapi_key
        try:
            async with httpx.AsyncClient(timeout=self.timeout, headers=headers) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                payload = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            logger.warning("Skyscanner fetch failed for %s-%s %s: %s", origin, dest, date, exc)
            return None

        price = extract_skyscanner_price(payload)
        if price is None:
            logger.warning("No Skyscanner quote for %s-%s %s", origin, dest, date)
            return None

        return {
            "price": float(price),
            "currency": "INR",
            "fetched_at": datetime.utcnow(),
            "source": "skyscanner",
        }


google_flights_service = GoogleFlightsService()
skyscanner_service = SkyscannerService()


def resolve_flight_price_provider() -> FlightPriceProvider:
    """Pick provider from FLIGHT_PRICE_PROVIDER or auto-detect from API keys."""

    choice = settings.flight_price_provider.lower()
    if choice == "google_flights":
        return google_flights_service
    if choice == "skyscanner":
        return skyscanner_service
    if settings.serpapi_api_key:
        return google_flights_service
    return skyscanner_service


flight_price_service = resolve_flight_price_provider()
