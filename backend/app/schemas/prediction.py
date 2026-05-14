"""Pydantic schemas for prediction requests and responses."""

from __future__ import annotations

from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator, model_validator

Cabin = Literal["economy", "premium_economy", "business", "first"]
PriceLabel = Literal["cheap", "moderate", "expensive", "festive_peak"]
Signal = Literal["BUY", "BUY_NOW", "WAIT"]
Source = Literal["stored", "simulated"]


class PredictionRequest(BaseModel):
    """Validated input payload for India domestic price prediction."""

    origin: str = Field(min_length=2, max_length=3)
    destination: str = Field(min_length=2, max_length=3)
    travel_date_start: date
    travel_date_end: date
    cabin: Cabin
    adults: int = Field(ge=1, le=9)

    @field_validator("origin", "destination")
    @classmethod
    def uppercase_iata(cls, value: str) -> str:
        """Normalize IATA codes to uppercase."""

        return value.upper()

    @model_validator(mode="after")
    def validate_dates_and_route(self) -> "PredictionRequest":
        """Validate route and future date constraints."""

        today = datetime.now().date()
        if self.origin == self.destination:
            raise ValueError("Origin and destination cannot be the same")
        if self.travel_date_start <= today:
            raise ValueError("Travel dates must be in the future")
        if self.travel_date_end < self.travel_date_start:
            raise ValueError("Return date must be after departure date")
        if (self.travel_date_end - self.travel_date_start).days > 30:
            raise ValueError("Travel date range cannot exceed 30 days")
        return self


class DayPrediction(BaseModel):
    """Prediction details for one calendar day."""

    date: date
    price: float
    price_label: PriceLabel
    is_holiday: bool
    holiday_name: str | None = None
    is_festive_period: bool
    is_diwali_period: bool
    is_monsoon: bool
    source: Source
    festive_price_last_year: float | None = None


class PredictionResponse(BaseModel):
    """Complete prediction response consumed by the frontend dashboard."""

    has_flights: bool
    origin: str
    destination: str
    origin_city: str
    destination_city: str
    recommended_date: date | None = None
    signal: Signal | None = None
    reasoning: str | None = None
    predicted_price: float | None = None
    route_average_price: float | None = None
    confidence: float | None = None
    days: list[DayPrediction] = Field(default_factory=list)
    trend_60_days: list[dict[str, Any]] | None = None
    festive_reference: list[dict[str, Any]] | None = None
    model_version: str
    data_freshness: str
