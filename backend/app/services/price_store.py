"""Redis-backed 90-day rolling price store."""

from __future__ import annotations

import json
from datetime import datetime, timedelta
from statistics import mean

from app.core.cache import get_redis
from app.core.config import settings

SECONDS_PER_DAY = 86_400
FETCH_META_KEY = "fetch:meta:last_run"


class PriceStore:
    """Manage stored Skyscanner prices with a Redis TTL-based rolling window."""

    def __init__(self) -> None:
        self.redis = get_redis()
        self.ttl_seconds = settings.price_store_ttl_days * SECONDS_PER_DAY

    @staticmethod
    def _date_score(day: str) -> int:
        return int(day.replace("-", ""))

    def store_price(self, route_key: str, date: str, price: float, source: str = "skyscanner") -> None:
        """Store one route-date price with a 90-day TTL and sorted-set index."""

        key = f"prices:{route_key}:{date}"
        payload = {"price": price, "source": source, "stored_at": datetime.utcnow().isoformat()}
        self.redis.set(key, json.dumps(payload), ex=self.ttl_seconds)
        index_key = f"prices:index:{route_key}"
        self.redis.zadd(index_key, {date: self._date_score(date)})
        cutoff = self._date_score((datetime.utcnow().date() - timedelta(days=settings.price_store_ttl_days)).isoformat())
        self.redis.zremrangebyscore(index_key, 0, cutoff)
        self.redis.delete(f"no_flights:{route_key}")

    def mark_no_flights(self, route_key: str) -> None:
        """Mark a route as having no fetched flights for 24 hours."""

        self.redis.set(f"no_flights:{route_key}", "true", ex=SECONDS_PER_DAY)

    def get_price(self, route_key: str, date: str) -> float | None:
        """Return a stored price for a route-date pair, if available."""

        raw = self.redis.get(f"prices:{route_key}:{date}")
        if not raw:
            return None
        return float(json.loads(raw)["price"])

    def get_price_entry(self, route_key: str, date: str) -> dict | None:
        """Return the full stored price entry, if available."""

        raw = self.redis.get(f"prices:{route_key}:{date}")
        return json.loads(raw) if raw else None

    def get_price_history(self, route_key: str, days: int = 90) -> list[dict]:
        """Return sorted historical prices for a route over the last N days."""

        end = datetime.utcnow().date()
        start = end - timedelta(days=days)
        members = self.redis.zrangebyscore(
            f"prices:index:{route_key}", self._date_score(start.isoformat()), self._date_score(end.isoformat())
        )
        history = []
        for member in members:
            entry = self.get_price_entry(route_key, member)
            if entry:
                history.append({"date": member, "price": float(entry["price"]), "source": entry.get("source", "skyscanner")})
        return sorted(history, key=lambda item: item["date"])

    def get_route_average(self, route_key: str, days: int = 30) -> float | None:
        """Return the mean stored price for the route over the last N days."""

        prices = [item["price"] for item in self.get_price_history(route_key, days)]
        return float(mean(prices)) if prices else None

    def route_has_flights(self, route_key: str) -> bool:
        """Return False only when the route was explicitly marked no-flight."""

        return self.redis.get(f"no_flights:{route_key}") != "true"

    def count_entries(self) -> int:
        """Return approximate number of stored route-date price entries."""

        return len(self.redis.keys("prices:*:*"))

    def save_fetch_metadata(self, payload: dict) -> None:
        """Store summary of the latest scheduled price fetch."""

        self.redis.set(FETCH_META_KEY, json.dumps(payload), ex=self.ttl_seconds)

    def get_fetch_metadata(self) -> dict | None:
        """Return summary of the latest scheduled price fetch, if any."""

        raw = self.redis.get(FETCH_META_KEY)
        return json.loads(raw) if raw else None


price_store = PriceStore()
