"""Redis cache helpers with a development in-memory fallback."""

from __future__ import annotations

import fnmatch
import time
from typing import Any

import redis

from app.core.config import settings


class MemoryRedis:
    """Small Redis-like fallback used when a Redis server is unavailable."""

    def __init__(self) -> None:
        self._store: dict[str, tuple[Any, float | None]] = {}
        self._zsets: dict[str, dict[str, float]] = {}

    def _expired(self, key: str) -> bool:
        item = self._store.get(key)
        if item is None:
            return True
        _, expires_at = item
        if expires_at is not None and expires_at < time.time():
            self._store.pop(key, None)
            return True
        return False

    def get(self, key: str) -> Any | None:
        """Return a value by key."""

        if self._expired(key):
            return None
        return self._store[key][0]

    def set(self, key: str, value: Any, ex: int | None = None) -> bool:
        """Set a value with optional expiry seconds."""

        expires_at = time.time() + ex if ex else None
        self._store[key] = (value, expires_at)
        return True

    def delete(self, key: str) -> int:
        """Delete a value."""

        existed = key in self._store
        self._store.pop(key, None)
        return int(existed)

    def keys(self, pattern: str) -> list[str]:
        """Return keys matching a glob pattern."""

        return [key for key in self._store if not self._expired(key) and fnmatch.fnmatch(key, pattern)]

    def zadd(self, key: str, mapping: dict[str, float]) -> int:
        """Add members to a sorted set."""

        self._zsets.setdefault(key, {}).update(mapping)
        return len(mapping)

    def zrangebyscore(self, key: str, min_score: float, max_score: float) -> list[str]:
        """Return sorted-set members within a score range."""

        members = self._zsets.get(key, {})
        return [m for m, s in sorted(members.items(), key=lambda item: item[1]) if min_score <= s <= max_score]

    def zremrangebyscore(self, key: str, min_score: float, max_score: float) -> int:
        """Remove sorted-set members within a score range."""

        members = self._zsets.get(key, {})
        doomed = [m for m, s in members.items() if min_score <= s <= max_score]
        for member in doomed:
            members.pop(member, None)
        return len(doomed)


_client: redis.Redis | MemoryRedis | None = None


def get_redis() -> redis.Redis | MemoryRedis:
    """Return a Redis client or a memory fallback if Redis is offline."""

    global _client
    if _client is not None:
        return _client
    try:
        client = redis.from_url(settings.redis_url, decode_responses=True)
        client.ping()
        _client = client
    except redis.RedisError:
        _client = MemoryRedis()
    return _client
