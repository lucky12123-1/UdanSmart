"""Tests for Google Flights price extraction."""

from app.services.flight_data import (
    extract_google_flights_lowest_price,
    extract_skyscanner_price,
)


def test_extract_google_flights_from_price_insights():
    payload = {"price_insights": {"lowest_price": 4200}, "best_flights": [{"price": 4500}]}
    assert extract_google_flights_lowest_price(payload) == 4200.0


def test_extract_google_flights_from_flight_buckets():
    payload = {
        "best_flights": [{"price": 5100}],
        "other_flights": [{"price": 4800}, {"price": 6200}],
    }
    assert extract_google_flights_lowest_price(payload) == 4800.0


def test_extract_google_flights_returns_none_on_error():
    assert extract_google_flights_lowest_price({"error": "Invalid API key"}) is None
    assert extract_google_flights_lowest_price({}) is None


def test_extract_skyscanner_nested_price():
    payload = {"quotes": [{"price": 3000}, {"rawPrice": 2800}]}
    assert extract_skyscanner_price(payload) == 2800.0
