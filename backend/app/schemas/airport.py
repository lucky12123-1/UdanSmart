"""Pydantic schemas for India airport data."""

from __future__ import annotations

from pydantic import BaseModel


class AirportOut(BaseModel):
    """Airport response schema."""

    code: str
    city: str
    name: str
    type: str
    flag: str
    lat: float
    lon: float
    state: str
