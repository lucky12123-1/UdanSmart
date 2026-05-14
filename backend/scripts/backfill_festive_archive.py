"""Seed festive_prices_archive.json with realistic 2024 prices."""

from __future__ import annotations

from pathlib import Path
import json
import random
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.ml.features import EXPLICIT_BASE_PRICES

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE_PATH = ROOT / "data" / "festive_prices_archive.json"
FESTIVALS = {
    "Diwali_2024": ("2024-10-29/2024-11-05", 1.65),
    "Dussehra_2024": ("2024-10-09/2024-10-13", 1.42),
    "Holi_2024": ("2024-03-20/2024-03-26", 1.32),
    "Eid_ul-Fitr_2024": ("2024-04-08/2024-04-13", 1.35),
    "Eid_ul-Adha_2024": ("2024-06-15/2024-06-19", 1.25),
    "Christmas_2024": ("2024-12-22/2024-12-27", 1.30),
    "New_Year_2024": ("2024-12-29/2025-01-03", 1.34),
    "Republic_Day_2024": ("2024-01-24/2024-01-28", 1.20),
}


def main() -> None:
    """Generate top-route festive archive records."""

    archive = json.loads(ARCHIVE_PATH.read_text(encoding="utf-8")) if ARCHIVE_PATH.exists() else {}
    top_routes = list(EXPLICIT_BASE_PRICES.items())[:50]
    prices = []
    for route, base_price in top_routes:
        reverse = "-".join(reversed(route.split("-")))
        for route_key in {route, reverse}:
            archive.setdefault(route_key, {})
            for festival, (date_range, modifier) in FESTIVALS.items():
                rng = random.Random(f"{route_key}-{festival}")
                avg = round(base_price * modifier * rng.uniform(0.95, 1.12) / 50) * 50
                peak = round(avg * rng.uniform(1.22, 1.45) / 50) * 50
                archive[route_key][festival] = {
                    "date_range": date_range,
                    "avg_price_inr": int(avg),
                    "peak_price_inr": int(peak),
                }
                prices.append(avg)
    ARCHIVE_PATH.write_text(json.dumps(archive, indent=2), encoding="utf-8")
    print(f"routes populated: {len(archive)}")
    print(f"festivals covered: {len(FESTIVALS)}")
    print(f"price range: ₹{int(min(prices)):,} - ₹{int(max(prices)):,}")


if __name__ == "__main__":
    main()
