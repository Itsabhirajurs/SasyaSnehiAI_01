"""Geocoding service — reverse geocode lat/long to human-readable address using Google Maps API."""

from __future__ import annotations

import requests


def reverse_geocode(lat: float, lon: float, api_key: str) -> dict:
    """
    Convert lat/lon to a human-readable address.
    Returns dict with keys: address, city, state, country, district
    Falls back to coordinates string if API unavailable.
    """
    if not api_key or lat is None or lon is None:
        return {
            "address": f"{lat:.4f}, {lon:.4f}",
            "city": None,
            "state": None,
            "district": None,
            "country": "India",
        }

    try:
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {"latlng": f"{lat},{lon}", "key": api_key, "language": "en"}
        resp = requests.get(url, params=params, timeout=6)
        data = resp.json()

        if data.get("status") != "OK" or not data.get("results"):
            return {
                "address": f"{lat:.4f}° N, {lon:.4f}° E",
                "city": None,
                "state": None,
                "district": None,
                "country": "India",
            }

        result = data["results"][0]
        components = result.get("address_components", [])

        city = None
        state = None
        district = None
        country = "India"

        for comp in components:
            types = comp.get("types", [])
            if "locality" in types or "administrative_area_level_3" in types:
                city = comp["long_name"]
            if "administrative_area_level_1" in types:
                state = comp["long_name"]
            if "administrative_area_level_2" in types:
                district = comp["long_name"]
            if "country" in types:
                country = comp["long_name"]

        formatted = result.get("formatted_address", f"{lat:.4f}, {lon:.4f}")
        # Shorten for display — keep up to city, state
        short = city or district or ""
        if state and state not in short:
            short = f"{short}, {state}" if short else state

        return {
            "address": short or formatted,
            "full_address": formatted,
            "city": city,
            "state": state,
            "district": district,
            "country": country,
        }

    except Exception:
        return {
            "address": f"{lat:.4f}° N, {lon:.4f}° E",
            "city": None,
            "state": None,
            "district": None,
            "country": "India",
        }


def get_nearby_shops(lat: float, lon: float, api_key: str, query: str = "pesticide fertilizer shop") -> list[dict]:
    """Find nearby agri-input shops using Google Places API."""
    if not api_key or lat is None or lon is None:
        return []

    try:
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            "location": f"{lat},{lon}",
            "radius": 10000,         # 10 km radius
            "keyword": query,
            "key": api_key,
        }
        resp = requests.get(url, params=params, timeout=8)
        data = resp.json()

        shops = []
        for place in data.get("results", [])[:6]:
            shops.append({
                "name": place.get("name", ""),
                "address": place.get("vicinity", ""),
                "rating": place.get("rating"),
                "open_now": place.get("opening_hours", {}).get("open_now"),
                "maps_url": f"https://www.google.com/maps/place/?q=place_id:{place.get('place_id', '')}",
                "distance_approx": _haversine(lat, lon,
                    place["geometry"]["location"]["lat"],
                    place["geometry"]["location"]["lng"]),
            })
        shops.sort(key=lambda x: x["distance_approx"])
        return shops

    except Exception:
        return []


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Approximate distance in km between two lat/lon points."""
    import math
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 1)
