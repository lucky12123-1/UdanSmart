"""Skyscanner price fetching service with graceful fallback behaviour."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from typing import Any

import httpx

from app.core.config import settings
from app.ml.features import ROUTE_BASE_PRICES

logger = logging.getLogger(__name__)


class SkyscannerService:
    """Fetch India domestic prices from Skyscanner-compatible endpoints."""

    def __init__(self) -> None:
        self.timeout = httpx.Timeout(12.0)

    async def fetch_route_price(self, origin: str, dest: str, date: str) -> dict[str, Any] | None:
        """Fetch a single route price in INR or return None when unavailable."""

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
        price = self._extract_price(payload)
        if price is None:
            logger.warning("No Skyscanner quote for %s-%s %s", origin, dest, date)
            return None
        return {"price": float(price), "currency": "INR", "fetched_at": datetime.utcnow(), "source": "skyscanner"}

    async def fetch_prices_for_all_routes(self, dates: list[str]) -> dict[str, float]:
        """Fetch prices for all active India domestic route-date pairs."""

        output: dict[str, float] = {}
        for route in ROUTE_BASE_PRICES:
            origin, dest = route.split("-")
            for day in dates:
                await asyncio.sleep(0.5)
                quote = await self.fetch_route_price(origin, dest, day)
                if quote:
                    output[f"{origin}-{dest}-{day}"] = float(quote["price"])
        return output

    @staticmethod
    def _extract_price(payload: dict[str, Any]) -> float | None:
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


skyscanner_service = SkyscannerService()
