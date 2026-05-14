"""Historical festive price archive service."""

from __future__ import annotations

import json
from datetime import datetime, timedelta
from functools import lru_cache
from typing import Any

from app.core.config import settings


class FestiveArchive:
    """Load and query last year's festive price reference data."""

    @lru_cache(maxsize=1)
    def load_archive(self) -> dict[str, Any]:
        """Load festive_prices_archive.json from disk."""

        with settings.resolved_festive_archive_path.open("r", encoding="utf-8") as handle:
            return json.load(handle)

    def get_festive_prices_for_route(self, route_key: str) -> list[dict[str, Any]]:
        """Return all archived festive prices for a route."""

        route_data = self.load_archive().get(route_key, {})
        prices = []
        for key, value in route_data.items():
            festival, year = key.rsplit("_", 1)
            prices.append({"festival": festival.replace("_", " "), "year": int(year), **value})
        return prices

    def estimate_this_year_price(self, last_year_price: float, festival: str) -> float:
        """Estimate this year's festive price with simple India-specific inflation."""

        name = festival.lower()
        if "diwali" in name:
            factor = 1.12
        elif "holi" in name:
            factor = 1.08
        elif "eid" in name:
            factor = 1.10
        elif "christmas" in name or "new year" in name:
            factor = 1.07
        else:
            factor = 1.06
        return round(last_year_price * factor / 50) * 50

    def get_upcoming_festive_reference(
        self, route_key: str, travel_date_start: str, travel_date_end: str
    ) -> list[dict[str, Any]]:
        """Return last-year festival entries within +/-45 days of the travel window."""

        start = datetime.fromisoformat(travel_date_start).date()
        end = datetime.fromisoformat(travel_date_end).date()
        window_start = start - timedelta(days=45)
        window_end = end + timedelta(days=45)
        references = []
        for item in self.get_festive_prices_for_route(route_key):
            range_start = datetime.fromisoformat(item["date_range"].split("/")[0]).date()
            aligned = range_start.replace(year=start.year)
            if window_start <= aligned <= window_end:
                estimated = self.estimate_this_year_price(item["avg_price_inr"], item["festival"])
                references.append({
                    **item,
                    "date_last_year": item["date_range"],
                    "price_last_year": item["avg_price_inr"],
                    "estimated_this_year": estimated,
                    "trend_percent": round((estimated / item["avg_price_inr"] - 1) * 100, 1),
                })
        return references


festive_archive = FestiveArchive()
