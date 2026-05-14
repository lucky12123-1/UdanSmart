"""Validate bundled India data files."""

from __future__ import annotations

from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    """Print a summary of bundled airport and holiday data."""

    airports = json.loads((ROOT / "data" / "airports_india.json").read_text(encoding="utf-8"))
    holidays = json.loads((ROOT / "data" / "holidays_india.json").read_text(encoding="utf-8"))["IN"]
    print(f"Airports loaded: {len(airports)}")
    print(f"Holiday entries loaded: {len(holidays)}")


if __name__ == "__main__":
    main()
