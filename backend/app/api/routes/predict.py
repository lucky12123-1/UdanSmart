"""Prediction API route."""

from __future__ import annotations

import hashlib
import json
from datetime import date, datetime, timedelta
from statistics import mean

from fastapi import APIRouter
from pydantic import TypeAdapter

from app.core.cache import get_redis
from app.core.config import settings
from app.ml.features import get_base_price, load_airports, route_key
from app.ml.predictor import predictor
from app.schemas.prediction import (
    DayPrediction,
    PredictionRequest,
    PredictionResponse,
    WeeklyAnalysis90d,
    WeekdayAnalysis,
)
from app.services.calendar_service import generate_calendar_data, price_label
from app.services.festive_archive import festive_archive
from app.services.price_store import price_store

router = APIRouter(prefix="/predict", tags=["prediction"])
response_adapter = TypeAdapter(PredictionResponse)

DAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
]


def _cache_key(payload: PredictionRequest) -> str:
    raw = payload.model_dump_json()
    return "cache:predict:" + hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _weekly_analysis_90d(origin: str, destination: str, cabin: str, adults: int) -> WeeklyAnalysis90d:
    """Aggregate the last 90 days of route fares by weekday (Sun=0 … Sat=6)."""

    today = datetime.now().date()
    route = route_key(origin, destination)
    buckets: dict[int, list[float]] = {index: [] for index in range(7)}

    for offset in range(1, 91):
        day = today - timedelta(days=offset)
        stored = price_store.get_live_price(route, day.isoformat())
        price = stored if stored is not None else predictor.predict_price(origin, destination, day, cabin, adults)
        js_dow = (day.weekday() + 1) % 7
        buckets[js_dow].append(price)

    entries: list[dict] = []
    for dow in range(7):
        prices = buckets[dow]
        if not prices:
            continue
        entries.append(
            {
                "dow": dow,
                "day_name": DAY_NAMES[dow],
                "avg_price": round(float(mean(prices)), 2),
                "sample_count": len(prices),
            }
        )

    if not entries:
        return WeeklyAnalysis90d()

    route_avg = float(mean(price for prices in buckets.values() for price in prices))
    best = min(entries, key=lambda item: item["avg_price"])
    priciest_price = max(item["avg_price"] for item in entries)
    weekday_models = [
        WeekdayAnalysis(
            dow=item["dow"],
            day_name=item["day_name"],
            avg_price=item["avg_price"],
            sample_count=item["sample_count"],
            pct_vs_route_avg=round((item["avg_price"] - route_avg) / route_avg * 100) if route_avg else 0,
            is_cheapest=item["dow"] == best["dow"],
            is_priciest=item["avg_price"] == priciest_price,
        )
        for item in entries
    ]
    weekday_models.sort(key=lambda item: item.dow)

    return WeeklyAnalysis90d(
        days=weekday_models,
        best_day_of_week=best["day_name"],
        best_dow=best["dow"],
        route_avg=round(route_avg, 2),
        analysis_period_days=90,
    )


def _trend(origin: str, destination: str, cabin: str, adults: int) -> list[dict]:
    today = datetime.now().date()
    route = route_key(origin, destination)
    items = []
    for idx in range(90):
        day = today + timedelta(days=idx + 1)
        stored = price_store.get_live_price(route, day.isoformat())
        price = stored if stored is not None else predictor.predict_price(origin, destination, day, cabin, adults)
        features = generate_calendar_data(origin, destination, day, day, cabin, adults)["days"][0]
        items.append({
            "date": day.isoformat(),
            "price": price,
            "holiday_name": features.get("holiday_name"),
            "is_festive_period": features.get("is_festive_period"),
            "is_diwali_period": features.get("is_diwali_period"),
        })
    return items


def _buy_wait_signal(best_date: date, best_price: float, average: float, request: PredictionRequest, festive: bool) -> tuple[str, str, float]:
    days_before_best = (best_date - datetime.now().date()).days
    savings = max(0.0, (average - best_price) / average * 100) if average else 0.0
    if festive and (request.travel_date_start - datetime.now().date()).days < 30:
        return "BUY", "Festive season demand is building on Indian domestic routes. Book immediately before fares rise further.", 0.88
    if days_before_best < 5:
        return "BUY", "India domestic last-minute fares spike sharply. This is the strongest available price in your range.", 0.84
    if days_before_best < 45 and best_price < average:
        return "BUY_NOW", f"This date is about {savings:.0f}% below the route average, so booking now is sensible.", 0.82
    wait_days = max(0, days_before_best - 35)
    return "WAIT", f"You may see a better fare in about {wait_days} days if demand stays normal for this route.", 0.72


@router.post("/", response_model=PredictionResponse)
def predict(request: PredictionRequest) -> PredictionResponse:
    """Predict prices and calendar intelligence for an India domestic route."""

    redis_client = get_redis()
    key = _cache_key(request)
    cached = redis_client.get(key)
    if cached:
        return response_adapter.validate_json(cached)
    route = route_key(request.origin, request.destination)
    airports = load_airports()
    origin_city = airports.get(request.origin, {}).get("city", request.origin)
    destination_city = airports.get(request.destination, {}).get("city", request.destination)
    if not price_store.route_has_flights(route) and get_base_price(request.origin, request.destination) is None:
        response = PredictionResponse(
            has_flights=False,
            origin=request.origin,
            destination=request.destination,
            origin_city=origin_city,
            destination_city=destination_city,
            model_version=settings.model_version,
            data_freshness="simulated",
        )
        redis_client.set(key, response.model_dump_json(), ex=settings.cache_ttl_seconds)
        return response
    if get_base_price(request.origin, request.destination) is None:
        response = PredictionResponse(
            has_flights=False,
            origin=request.origin,
            destination=request.destination,
            origin_city=origin_city,
            destination_city=destination_city,
            reasoning="No direct operational fare pattern is available for this India domestic route.",
            model_version=settings.model_version,
            data_freshness="simulated",
        )
        redis_client.set(key, response.model_dump_json(), ex=settings.cache_ttl_seconds)
        return response
    calendar = generate_calendar_data(
        request.origin, request.destination, request.travel_date_start, request.travel_date_end, request.cabin, request.adults
    )
    day_models = [DayPrediction(**item) for item in calendar["days"]]
    prices = [day.price for day in day_models]
    average = float(mean(prices))
    best = min(day_models, key=lambda item: item.price)
    weekly_analysis = _weekly_analysis_90d(
        request.origin, request.destination, request.cabin, request.adults
    )
    signal, reasoning, confidence = _buy_wait_signal(best.date, best.price, average, request, any(day.is_festive_period for day in day_models))
    if weekly_analysis.best_day_of_week:
        reasoning = (
            f"Over the last 90 days, {weekly_analysis.best_day_of_week} has been the cheapest day to fly "
            f"{origin_city} → {destination_city}. {reasoning}"
        )
    festive_reference = festive_archive.get_upcoming_festive_reference(
        route, request.travel_date_start.isoformat(), request.travel_date_end.isoformat()
    )
    trend_90_days = _trend(request.origin, request.destination, request.cabin, request.adults)
    trend_90_day_avg = float(mean(item["price"] for item in trend_90_days)) if trend_90_days else None
    response = PredictionResponse(
        has_flights=True,
        origin=request.origin,
        destination=request.destination,
        origin_city=origin_city,
        destination_city=destination_city,
        recommended_date=best.date,
        signal=signal,
        reasoning=reasoning,
        predicted_price=best.price,
        route_average_price=average,
        confidence=confidence,
        days=day_models,
        trend_90_days=trend_90_days,
        trend_90_day_avg=trend_90_day_avg,
        weekly_analysis_90d=weekly_analysis,
        best_day_of_week=weekly_analysis.best_day_of_week,
        festive_reference=festive_reference,
        model_version=settings.model_version,
        data_freshness="real_time" if any(day.source == "stored" for day in day_models) else "simulated",
    )
    redis_client.set(key, response.model_dump_json(), ex=settings.cache_ttl_seconds)
    return response
