"""Airport search API routes."""

from __future__ import annotations

from fastapi import APIRouter, Query

from app.ml.features import ROUTE_BASE_PRICES, load_airports
from app.schemas.airport import AirportOut

router = APIRouter(prefix="/airports", tags=["airports"])


def _score(query: str, airport: dict) -> int:
    q = query.lower()
    code = airport["code"].lower()
    city = airport["city"].lower()
    name = airport["name"].lower()
    if code == q:
        return 100
    if city.startswith(q):
        return 80
    if q in city:
        return 60
    if q in name or q in code:
        return 40
    return 0


@router.get("/", response_model=list[AirportOut])
def all_airports() -> list[AirportOut]:
    """Return all India-only airports."""

    return [AirportOut(**airport) for airport in load_airports().values()]


@router.get("/search", response_model=list[AirportOut])
def search_airports(q: str = Query(min_length=1)) -> list[AirportOut]:
    """Search airports by IATA, city, or airport name."""

    matches = []
    for airport in load_airports().values():
        score = _score(q, airport)
        if score:
            matches.append((score, airport["city"], airport))
    matches.sort(key=lambda item: (-item[0], item[1]))
    return [AirportOut(**airport) for _, _, airport in matches[:8]]


@router.get("/routes")
def valid_routes() -> dict[str, list[str]]:
    """Return all valid direct route pairs."""

    return {"routes": sorted(ROUTE_BASE_PRICES.keys())}
