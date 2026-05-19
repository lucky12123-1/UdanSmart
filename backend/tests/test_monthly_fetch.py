"""Tests for monthly week price fetch helpers."""

from datetime import date

from app.services.daily_price_fetch import (
    active_fetch_routes,
    resolve_monthly_week_anchor,
    week_travel_dates,
)
from app.services.price_store import PriceStore


def test_week_travel_dates_first_week_of_june():
    days = week_travel_dates(7, anchor=date(2026, 6, 1))
    assert days[0] == "2026-06-01"
    assert days[-1] == "2026-06-07"
    assert len(days) == 7


def test_anchor_mid_month_targets_next_month(monkeypatch):
    from types import SimpleNamespace

    monkeypatch.setattr(
        "app.services.daily_price_fetch.settings",
        SimpleNamespace(monthly_fetch_anchor_date="", monthly_fetch_day=1),
    )
    anchor = resolve_monthly_week_anchor(date(2026, 5, 18))
    assert anchor == date(2026, 6, 1)


def test_anchor_on_first_of_month(monkeypatch):
    from types import SimpleNamespace

    monkeypatch.setattr(
        "app.services.daily_price_fetch.settings",
        SimpleNamespace(monthly_fetch_anchor_date="", monthly_fetch_day=1),
    )
    anchor = resolve_monthly_week_anchor(date(2026, 6, 1))
    assert anchor == date(2026, 6, 1)


def test_active_fetch_routes_count_25(monkeypatch):
    from types import SimpleNamespace

    monkeypatch.setattr(
        "app.services.daily_price_fetch.settings",
        SimpleNamespace(monthly_fetch_route_count=25),
    )
    assert len(active_fetch_routes()) == 25


def test_live_window_gate(monkeypatch):
    store = PriceStore.__new__(PriceStore)

    def fake_meta():
        return {
            "schedule": "monthly_week",
            "date_from": "2026-06-01",
            "date_to": "2026-06-07",
        }

    monkeypatch.setattr(store, "get_fetch_metadata", fake_meta)
    assert store.is_live_price_date("2026-06-03") is True
    assert store.is_live_price_date("2026-06-15") is False
