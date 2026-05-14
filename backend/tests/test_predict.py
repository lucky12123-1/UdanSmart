"""Tests for the prediction API."""

from __future__ import annotations

from datetime import date, timedelta

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def future_payload(**overrides: object) -> dict:
    """Return a valid future request payload."""

    start = date.today() + timedelta(days=20)
    payload = {
        "origin": "DEL",
        "destination": "BOM",
        "travel_date_start": start.isoformat(),
        "travel_date_end": (start + timedelta(days=5)).isoformat(),
        "cabin": "economy",
        "adults": 1,
    }
    payload.update(overrides)
    return payload


def test_predict_valid_route_returns_200() -> None:
    """DEL-BOM returns a complete successful prediction."""

    response = client.post("/api/predict/", json=future_payload())
    assert response.status_code == 200
    data = response.json()
    assert data["has_flights"] is True
    assert data["predicted_price"] > 0
    assert data["days"]


def test_response_has_required_fields() -> None:
    """Prediction response includes dashboard fields."""

    data = client.post("/api/predict/", json=future_payload()).json()
    for key in ["has_flights", "trend_60_days", "festive_reference", "model_version", "data_freshness"]:
        assert key in data


def test_same_origin_destination_returns_422() -> None:
    """Origin and destination cannot match."""

    response = client.post("/api/predict/", json=future_payload(destination="DEL"))
    assert response.status_code == 422


def test_past_travel_date_returns_422() -> None:
    """Past travel dates are invalid."""

    yesterday = date.today() - timedelta(days=1)
    response = client.post("/api/predict/", json=future_payload(travel_date_start=yesterday.isoformat(), travel_date_end=yesterday.isoformat()))
    assert response.status_code == 422


def test_price_labels_are_valid() -> None:
    """Calendar labels use the supported set only."""

    data = client.post("/api/predict/", json=future_payload()).json()
    labels = {item["price_label"] for item in data["days"]}
    assert labels <= {"cheap", "moderate", "expensive", "festive_peak"}


def test_no_flight_route_returns_clean_state() -> None:
    """A route without direct fare pattern returns has_flights false."""

    start = date.today() + timedelta(days=20)
    response = client.post("/api/predict/", json=future_payload(origin="SLV", destination="BEK", travel_date_start=start.isoformat(), travel_date_end=start.isoformat()))
    assert response.status_code == 200
    assert response.json()["has_flights"] is False
