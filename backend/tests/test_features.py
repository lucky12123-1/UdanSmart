"""Tests for India-specific feature engineering."""

from __future__ import annotations

from datetime import date

from app.ml.features import booking_bucket, engineer_features, load_airports


def test_airport_count() -> None:
    """Airport data contains 82 India-only airports."""

    assert len(load_airports()) == 82


def test_engineer_features_india_flags() -> None:
    """Feature output includes India-specific route and festive flags."""

    features = engineer_features("DEL", "BOM", date(2025, 10, 20), date(2025, 9, 20))
    for key in [
        "is_diwali_period", "is_holi_period", "is_eid_period", "is_festive_period",
        "is_monsoon", "is_winter_peak", "is_navratri_period", "is_durga_puja_period",
        "is_northeast_route", "is_pilgrimage_route", "is_tourist_route", "route_distance_km",
        "route_distance_bucket", "days_before_departure", "day_of_week", "month",
        "week_of_year", "dow_sin", "dow_cos", "month_sin", "month_cos", "woy_sin",
        "woy_cos", "is_weekend", "is_holiday", "days_to_nearest_holiday", "booking_bucket",
        "cabin_multiplier", "adults", "holiday_name",
    ]:
        assert key in features


def test_cyclical_values_are_bounded() -> None:
    """Cyclical encodings are always in [-1, 1]."""

    features = engineer_features("DEL", "BOM", date(2025, 3, 14))
    for key in ["dow_sin", "dow_cos", "month_sin", "month_cos", "woy_sin", "woy_cos"]:
        assert -1 <= features[key] <= 1


def test_known_indian_holidays() -> None:
    """Known Indian festival and national dates are detected."""

    assert engineer_features("DEL", "BOM", date(2025, 10, 20))["is_diwali_period"] == 1
    assert engineer_features("DEL", "BOM", date(2025, 3, 14))["is_holi_period"] == 1
    assert engineer_features("DEL", "BOM", date(2025, 1, 26))["is_holiday"] == 1


def test_booking_bucket_assignment() -> None:
    """Booking bucket follows India domestic lead-time rules."""

    assert booking_bucket(2) == 0
    assert booking_bucket(6) == 1
    assert booking_bucket(14) == 2
    assert booking_bucket(35) == 3
    assert booking_bucket(90) == 4


def test_monsoon_flag() -> None:
    """June to September is marked as monsoon."""

    assert engineer_features("DEL", "BOM", date(2025, 8, 10))["is_monsoon"] == 1
    assert engineer_features("DEL", "BOM", date(2025, 2, 10))["is_monsoon"] == 0
