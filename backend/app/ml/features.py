"""India-specific feature engineering for domestic flight price prediction."""

from __future__ import annotations

import json
import math
from datetime import date, datetime, timedelta
from functools import lru_cache
from pathlib import Path
from typing import Any

import numpy as np

from app.core.config import settings

EXPLICIT_BASE_PRICES: dict[str, int] = {
  'DEL-BOM': 5500,
  'DEL-BLR': 5800,
  'DEL-MAA': 6200,
  'DEL-HYD': 5600,
  'DEL-CCU': 5900,
  'BOM-BLR': 4200,
  'BOM-MAA': 4500,
  'BOM-HYD': 3800,
  'BOM-CCU': 6500,
  'BLR-MAA': 3200,
  'BLR-HYD': 3000,
  'BLR-CCU': 5800,
  'MAA-HYD': 2800,
  'MAA-CCU': 5500,
  'HYD-CCU': 5200,
  'DEL-GOI': 6500,
  'DEL-COK': 7200,
  'DEL-GAU': 6800,
  'DEL-JAI': 2800,
  'DEL-AMD': 4800,
  'DEL-LKO': 3200,
  'DEL-VNS': 3800,
  'DEL-ATQ': 3000,
  'BOM-GOI': 3500,
  'BOM-COK': 4800,
  'BOM-AMD': 3200,
  'BLR-COK': 3400,
  'BLR-TRV': 4000,
  'BLR-GOI': 4200,
  'MAA-TRV': 3000,
  'DEL-SXR': 5500,
  'DEL-IXL': 6800,
  'DEL-UDR': 3500,
  'DEL-JDH': 3200,
  'DEL-JSA': 3800,
  'BOM-UDR': 4200,
  'BOM-JDH': 4000,
  'BOM-IXZ': 9500,
  'DEL-IXZ': 10500,
  'BLR-IXZ': 9800,
  'DEL-DED': 3000,
  'DEL-DHM': 3800,
  'DEL-KUU': 4200,
  'DEL-SLV': 3500,
  'DEL-IMF': 7500,
  'DEL-IXA': 7000,
  'CCU-GAU': 4200,
  'CCU-IMF': 5500,
  'CCU-IXA': 4800,
  'GAU-IMF': 3500,
  'GAU-IXA': 3200,
  'GAU-DIB': 2800,
  'DEL-GAY': 4200,
  'DEL-PAT': 3500,
  'BOM-VNS': 5200,
  'BLR-TIR': 3500,
  'MAA-TIR': 2500,
  'HYD-TIR': 2200,
  'COK-SAG': 5500,
  'BOM-SAG': 3000
}

DOW_MODIFIERS = [0.02, -0.10, -0.08, 0.00, 0.15, 0.25, 0.12]
MONTH_MODIFIERS = [0.10, -0.05, 0.15, 0.00, 0.05, -0.08, -0.10, -0.12, 0.05, 0.30, 0.35, 0.20]
BOOKING_BUCKET_MODIFIERS = [0.50, 0.25, 0.05, -0.12, -0.08]
CABIN_MULTIPLIERS = {"economy": 1.0, "premium_economy": 1.65, "business": 3.2, "first": 5.5}
NORTHEAST_CODES = {"GAU", "IMF", "IXA", "DIB", "IXS", "AJL", "DMU"}
PILGRIMAGE_CODES = {"VNS", "GAY", "TIR", "SAG", "DHM", "DED", "IXD", "PAT"}
TOURIST_CODES = {"GOI", "GOX", "UDR", "JSA", "IXL", "SXR", "KUU", "IXZ", "DHM", "JDH", "COK", "TRV"}
SOUTH_CODES = {"MAA", "TRV", "BLR", "COK", "CCJ", "IXE", "CJB", "IXM"}
HUB_CODES = {"DEL", "BOM", "BLR", "MAA", "HYD", "CCU", "AMD", "JAI", "GOI", "COK", "GAU", "PNQ"}


@lru_cache(maxsize=1)
def load_airports() -> dict[str, dict[str, Any]]:
    """Load India-only airport data keyed by IATA code."""

    path = settings.data_dir / "airports_india.json"
    with path.open("r", encoding="utf-8") as handle:
        airports = json.load(handle)
    return {airport["code"]: airport for airport in airports}


@lru_cache(maxsize=1)
def load_holidays() -> dict[str, dict[str, str]]:
    """Load India holiday data keyed by ISO date."""

    path = settings.data_dir / "holidays_india.json"
    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    return {entry["date"]: entry for entry in payload.get("IN", [])}


def haversine_km(origin: str, destination: str) -> float:
    """Calculate great-circle distance between two Indian airports."""

    airports = load_airports()
    a = airports[origin]
    b = airports[destination]
    lat1, lon1, lat2, lon2 = map(math.radians, [a["lat"], a["lon"], b["lat"], b["lon"]])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 6371.0 * 2 * math.asin(math.sqrt(h))


def _distance_base_price(origin: str, destination: str) -> int:
    distance = haversine_km(origin, destination)
    if distance < 400:
        return int(2100 + distance * 2.8)
    if distance < 1000:
        return int(3100 + distance * 2.1)
    if distance < 2000:
        return int(4200 + distance * 1.55)
    return int(6500 + distance * 1.35)


def _build_route_prices() -> dict[str, int]:
    """Build India domestic route base prices for meaningful direct routes."""

    airports = load_airports()
    prices: dict[str, int] = {}
    for route, price in EXPLICIT_BASE_PRICES.items():
        origin, destination = route.split("-")
        prices[route] = price
        prices[f"{destination}-{origin}"] = price
    for origin in airports:
        for destination in airports:
            if origin == destination:
                continue
            route = f"{origin}-{destination}"
            if route in prices:
                continue
            distance = haversine_km(origin, destination)
            connected = (
                origin in HUB_CODES
                or destination in HUB_CODES
                or (origin in NORTHEAST_CODES and destination in NORTHEAST_CODES)
                or (origin in SOUTH_CODES and destination in SOUTH_CODES and distance < 900)
            )
            if connected and distance >= 140:
                prices[route] = int(round(_distance_base_price(origin, destination) / 50) * 50)
    return prices


ROUTE_BASE_PRICES = _build_route_prices()


def route_key(origin: str, destination: str) -> str:
    """Return normalized route key."""

    return f"{origin.upper()}-{destination.upper()}"


def get_base_price(origin: str, destination: str) -> int | None:
    """Return base fare for a direct India domestic route."""

    return ROUTE_BASE_PRICES.get(route_key(origin, destination))


def booking_bucket(days_before_departure: int) -> int:
    """Map booking lead time to an India-calibrated bucket."""

    if days_before_departure <= 3:
        return 0
    if days_before_departure <= 7:
        return 1
    if days_before_departure <= 21:
        return 2
    if days_before_departure <= 60:
        return 3
    return 4


def route_distance_bucket(distance_km: float) -> int:
    """Map distance to short, medium, long, or ultra bucket."""

    if distance_km < 400:
        return 0
    if distance_km < 1000:
        return 1
    if distance_km < 2000:
        return 2
    return 3


def holiday_info(travel_date: date) -> tuple[bool, str | None]:
    """Return whether a date is an Indian holiday and its display name."""

    entry = load_holidays().get(travel_date.isoformat())
    if entry:
        return True, entry["name"]
    return False, None


def days_to_nearest_holiday(travel_date: date) -> int:
    """Return days to nearest listed Indian holiday, capped at 30."""

    holiday_dates = [datetime.fromisoformat(day).date() for day in load_holidays()]
    if not holiday_dates:
        return 30
    return min(30, min(abs((hday - travel_date).days) for hday in holiday_dates))


def near_named_holiday(travel_date: date, names: tuple[str, ...], window: int) -> bool:
    """Return True when the travel date is within a holiday window."""

    for day, entry in load_holidays().items():
        if any(name.lower() in entry["name"].lower() for name in names):
            if abs((datetime.fromisoformat(day).date() - travel_date).days) <= window:
                return True
    return False


def festive_multiplier(origin: str, destination: str, travel_date: date) -> float:
    """Return India-specific festive surge multiplier."""

    multiplier = 1.0
    if near_named_holiday(travel_date, ("Diwali",), 5):
        multiplier *= 1.55
    if near_named_holiday(travel_date, ("Dussehra",), 3):
        multiplier *= 1.40
    if near_named_holiday(travel_date, ("Holi",), 2):
        multiplier *= 1.30
    if near_named_holiday(travel_date, ("Eid ul-Fitr",), 3):
        multiplier *= 1.35
    if near_named_holiday(travel_date, ("Eid ul-Adha",), 2):
        multiplier *= 1.25
    if (travel_date.month == 12 and travel_date.day >= 22) or (travel_date.month == 1 and travel_date.day <= 2):
        multiplier *= 1.28
    if near_named_holiday(travel_date, ("Republic Day",), 2):
        multiplier *= 1.20
    if near_named_holiday(travel_date, ("Independence Day",), 2):
        multiplier *= 1.15
    if near_named_holiday(travel_date, ("Navratri",), 3):
        multiplier *= 1.20
    if near_named_holiday(travel_date, ("Durga Puja",), 4) and "CCU" in {origin, destination}:
        multiplier *= 1.40
    if near_named_holiday(travel_date, ("Ganesh Chaturthi",), 3) and {origin, destination} & {"BOM", "PNQ"}:
        multiplier *= 1.35
    if near_named_holiday(travel_date, ("Makar Sankranti", "Pongal"), 3) and {origin, destination} & SOUTH_CODES:
        multiplier *= 1.25
    return multiplier


def engineer_features(
    origin: str,
    destination: str,
    travel_date: date,
    booking_date: date | None = None,
    cabin: str = "economy",
    adults: int = 1,
) -> dict[str, Any]:
    """Create India-specific model features for one route and travel date."""

    origin = origin.upper()
    destination = destination.upper()
    booking_date = booking_date or datetime.now().date()
    distance = haversine_km(origin, destination)
    days_before = max(0, (travel_date - booking_date).days)
    dow = travel_date.weekday()
    month = travel_date.month
    week = int(travel_date.strftime("%V"))
    is_holiday, holiday_name = holiday_info(travel_date)
    bucket = booking_bucket(days_before)
    is_diwali = near_named_holiday(travel_date, ("Diwali",), 7)
    is_holi = near_named_holiday(travel_date, ("Holi",), 3)
    is_eid = near_named_holiday(travel_date, ("Eid",), 3)
    is_navratri = near_named_holiday(travel_date, ("Navratri",), 5)
    is_durga = near_named_holiday(travel_date, ("Durga Puja",), 5)
    festive = is_diwali or is_holi or is_eid or is_navratri or is_durga or days_to_nearest_holiday(travel_date) <= 5
    return {
        "base_price": float(get_base_price(origin, destination) or _distance_base_price(origin, destination)),
        "is_diwali_period": int(is_diwali),
        "is_holi_period": int(is_holi),
        "is_eid_period": int(is_eid),
        "is_festive_period": int(festive),
        "is_monsoon": int(6 <= month <= 9),
        "is_winter_peak": int((month == 12 and travel_date.day >= 15) or (month == 1 and travel_date.day <= 10)),
        "is_navratri_period": int(is_navratri),
        "is_durga_puja_period": int(is_durga),
        "is_northeast_route": int(origin in NORTHEAST_CODES or destination in NORTHEAST_CODES),
        "is_pilgrimage_route": int(origin in PILGRIMAGE_CODES or destination in PILGRIMAGE_CODES),
        "is_tourist_route": int(origin in TOURIST_CODES or destination in TOURIST_CODES),
        "route_distance_km": distance,
        "route_distance_bucket": route_distance_bucket(distance),
        "days_before_departure": days_before,
        "day_of_week": dow,
        "month": month,
        "week_of_year": week,
        "dow_sin": math.sin(2 * math.pi * dow / 7),
        "dow_cos": math.cos(2 * math.pi * dow / 7),
        "month_sin": math.sin(2 * math.pi * month / 12),
        "month_cos": math.cos(2 * math.pi * month / 12),
        "woy_sin": math.sin(2 * math.pi * week / 52),
        "woy_cos": math.cos(2 * math.pi * week / 52),
        "is_weekend": int(dow >= 5),
        "is_holiday": int(is_holiday),
        "days_to_nearest_holiday": days_to_nearest_holiday(travel_date),
        "booking_bucket": bucket,
        "cabin_multiplier": CABIN_MULTIPLIERS.get(cabin, 1.0),
        "adults": adults,
        "holiday_name": holiday_name,
    }


FEATURE_COLUMNS = [key for key in engineer_features("DEL", "BOM", date(2026, 6, 1)).keys() if key != "holiday_name"]


def features_to_array(features: dict[str, Any]) -> np.ndarray:
    """Convert feature dictionary to a numeric model array."""

    return np.array([[float(features[column]) for column in FEATURE_COLUMNS]], dtype=float)
