"""India-aware calendar analysis service."""

from __future__ import annotations

from datetime import date, datetime, timedelta
from statistics import mean

import numpy as np

from app.ml.features import engineer_features, holiday_info, near_named_holiday, route_key
from app.ml.predictor import predictor
from app.services.festive_archive import festive_archive
from app.services.price_store import price_store


def daterange(start: date, end: date) -> list[date]:
    """Return inclusive list of dates."""

    return [start + timedelta(days=idx) for idx in range((end - start).days + 1)]


def price_label(price: float, prices: list[float], is_diwali: bool) -> str:
    """Classify a price using percentile thresholds and festive overrides."""

    if is_diwali:
        return "festive_peak"
    low, high = np.percentile(prices, [30, 70])
    if price <= low:
        return "cheap"
    if price >= high:
        return "expensive"
    return "moderate"


def festive_last_year_for_date(route: str, day: date) -> float | None:
    """Return a rough last-year festive price when the date aligns with an archive window."""

    for item in festive_archive.get_festive_prices_for_route(route):
        start_raw, end_raw = item["date_range"].split("/")
        start = datetime.fromisoformat(start_raw).date().replace(year=day.year)
        end = datetime.fromisoformat(end_raw).date().replace(year=day.year)
        if start <= day <= end:
            return float(item["avg_price_inr"])
    return None


def generate_calendar_data(
    origin: str, dest: str, start_date: date, end_date: date, cabin: str, adults: int
) -> dict:
    """Generate calendar and trend data with India-specific context."""

    route = route_key(origin, dest)
    days = daterange(start_date, end_date)
    raw_days = []
    prices = []
    for day in days:
        stored = price_store.get_live_price(route, day.isoformat())
        source = "stored" if stored is not None else "simulated"
        price = stored if stored is not None else predictor.predict_price(origin, dest, day, cabin, adults)
        prices.append(float(price))
        is_holiday, name = holiday_info(day)
        features = engineer_features(origin, dest, day, cabin=cabin, adults=adults)
        raw_days.append({
            "date": day,
            "price": float(price),
            "is_holiday": is_holiday,
            "holiday_name": name,
            "is_festive_period": bool(features["is_festive_period"]),
            "is_diwali_period": bool(features["is_diwali_period"]),
            "is_monsoon": bool(features["is_monsoon"]),
            "source": source,
            "festive_price_last_year": festive_last_year_for_date(route, day),
            "bihu_peak": bool((origin in {"GAU", "IMF", "IXA", "DIB", "IXS"} or dest in {"GAU", "IMF", "IXA", "DIB", "IXS"}) and near_named_holiday(day, ("Bihu",), 4)),
            "monsoon_off_peak": bool(features["is_monsoon"] and not features["is_pilgrimage_route"]),
            "pilgrimage_peak": bool(features["is_pilgrimage_route"] and features["is_festive_period"]),
        })
    labelled_days = [{**item, "price_label": price_label(item["price"], prices, item["is_diwali_period"])} for item in raw_days]
    return {"days": labelled_days, "average": float(mean(prices)) if prices else None}
