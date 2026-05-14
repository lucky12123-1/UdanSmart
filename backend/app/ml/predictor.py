"""Prediction service with LightGBM support and deterministic simulation fallback."""

from __future__ import annotations

import hashlib
from datetime import date, datetime

import numpy as np

from app.ml.features import (
    BOOKING_BUCKET_MODIFIERS,
    DOW_MODIFIERS,
    MONTH_MODIFIERS,
    engineer_features,
    features_to_array,
    festive_multiplier,
)
from app.ml.model import model_registry


class FlightPricePredictor:
    """Predict India domestic flight prices in INR."""

    def predict_price(
        self,
        origin: str,
        destination: str,
        travel_date: date,
        cabin: str = "economy",
        adults: int = 1,
        booking_date: date | None = None,
    ) -> float:
        """Predict a deterministic price for the requested route and date."""

        features = engineer_features(origin, destination, travel_date, booking_date, cabin, adults)
        model = model_registry.load()
        if model is not None:
            price = float(model.predict(features_to_array(features))[0])
            return max(1200.0, round(price / 10) * 10)
        return self.simulate_price(origin, destination, travel_date, cabin, adults, booking_date)

    def simulate_price(
        self,
        origin: str,
        destination: str,
        travel_date: date,
        cabin: str = "economy",
        adults: int = 1,
        booking_date: date | None = None,
    ) -> float:
        """Generate a realistic deterministic fallback price in INR."""

        booking_date = booking_date or datetime.now().date()
        features = engineer_features(origin, destination, travel_date, booking_date, cabin, adults)
        price = features["base_price"]
        price *= 1 + DOW_MODIFIERS[features["day_of_week"]]
        price *= 1 + MONTH_MODIFIERS[features["month"] - 1]
        price *= 1 + BOOKING_BUCKET_MODIFIERS[features["booking_bucket"]]
        price *= festive_multiplier(origin, destination, travel_date)
        if features["is_tourist_route"] and features["is_winter_peak"]:
            price *= 1.18
        if features["is_pilgrimage_route"] and features["is_festive_period"]:
            price *= 1.16
        if features["is_monsoon"] and not features["is_pilgrimage_route"]:
            price *= 0.94
        price *= features["cabin_multiplier"]
        price *= 1 + max(0, adults - 1) * 0.03
        seed = f"{origin}-{destination}-{travel_date.isoformat()}-{cabin}-{adults}"
        digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
        jitter_seed = int(digest[:8], 16)
        jitter = np.random.default_rng(jitter_seed).normal(1.0, 0.035)
        return float(max(1200, round(price * jitter / 10) * 10))


predictor = FlightPricePredictor()
