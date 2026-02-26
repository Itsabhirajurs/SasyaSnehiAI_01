"""Market price service — fetches live crop prices from data.gov.in AgMarknet dataset
   and provides simple trend analysis + demand prediction using linear regression."""

from __future__ import annotations

import statistics
from datetime import datetime, timedelta

import requests

# data.gov.in AgMarknet dataset resource IDs (publicly documented)
AGMARKNET_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
DATA_GOV_BASE = "https://api.data.gov.in/resource"

# Crop aliases for searching
CROP_ALIASES: dict[str, list[str]] = {
    "tomato": ["Tomato", "tomato"],
    "potato": ["Potato", "potato"],
    "pepper": ["Capsicum", "capsicum", "Bell Pepper", "Pepper"],
    "apple": ["Apple", "apple"],
    "onion": ["Onion", "onion"],
    "rice": ["Rice", "Paddy", "rice"],
    "wheat": ["Wheat", "wheat"],
    "maize": ["Maize", "maize", "Corn"],
    "sugarcane": ["Sugarcane", "Sugar Cane"],
    "cotton": ["Cotton", "cotton"],
    "default": [],
}


def get_market_prices(plant_name: str, state: str | None, api_key: str) -> dict:
    """
    Fetch current market prices for the given crop.
    Returns price data, trend, and simple next-week prediction.
    """
    if not api_key:
        return _demo_prices(plant_name)

    crop_terms = _get_crop_terms(plant_name)
    commodity = crop_terms[0] if crop_terms else plant_name.capitalize()

    try:
        params = {
            "api-key": api_key,
            "format": "json",
            "filters[commodity]": commodity,
            "limit": 100,
            "offset": 0,
        }
        if state:
            params["filters[state]"] = state

        resp = requests.get(
            f"{DATA_GOV_BASE}/{AGMARKNET_RESOURCE_ID}",
            params=params,
            timeout=10,
        )
        data = resp.json()
        records = data.get("records", [])

        if not records:
            return _demo_prices(plant_name)

        return _process_records(records, plant_name)

    except Exception:
        return _demo_prices(plant_name)


def _get_crop_terms(plant_name: str) -> list[str]:
    key = plant_name.lower().strip()
    for crop_key, aliases in CROP_ALIASES.items():
        if crop_key in key:
            return aliases
    return [plant_name.capitalize()]


def _process_records(records: list[dict], plant_name: str) -> dict:
    """Process AgMarknet records into prices, trend, and prediction."""
    prices = []
    markets = []

    for rec in records:
        try:
            modal_price = float(str(rec.get("modal_price", "0")).replace(",", ""))
            min_price = float(str(rec.get("min_price", "0")).replace(",", ""))
            max_price = float(str(rec.get("max_price", "0")).replace(",", ""))
            if modal_price <= 0:
                continue

            prices.append(modal_price)
            markets.append({
                "market": rec.get("market", ""),
                "state": rec.get("state", ""),
                "district": rec.get("district", ""),
                "commodity": rec.get("commodity", plant_name),
                "variety": rec.get("variety", ""),
                "min_price": min_price,
                "max_price": max_price,
                "modal_price": modal_price,
                "date": rec.get("arrival_date", ""),
            })
        except (ValueError, TypeError):
            continue

    if not prices:
        return _demo_prices(plant_name)

    avg_price = statistics.mean(prices)
    median_price = statistics.median(prices)
    min_p = min(prices)
    max_p = max(prices)

    # Simple linear trend (last 10 prices)
    trend, prediction, trend_label = _predict_trend(prices)

    return {
        "available": True,
        "plant": plant_name,
        "commodity": markets[0]["commodity"] if markets else plant_name,
        "avg_price": round(avg_price, 2),
        "median_price": round(median_price, 2),
        "min_price": round(min_p, 2),
        "max_price": round(max_p, 2),
        "sample_count": len(prices),
        "trend": trend_label,
        "predicted_next_week": round(prediction, 2),
        "markets": markets[:8],
        "price_history": prices[-14:],  # last 14 data points for chart
        "currency": "INR/Quintal",
        "last_updated": datetime.now().strftime("%d %b %Y"),
    }


def _predict_trend(prices: list[float]) -> tuple[float, float, str]:
    """Simple linear regression to predict next price and identify trend."""
    if len(prices) < 3:
        p = prices[-1] if prices else 0
        return 0.0, p, "Stable"

    n = len(prices)
    x = list(range(n))
    mean_x = sum(x) / n
    mean_y = sum(prices) / n

    num = sum((x[i] - mean_x) * (prices[i] - mean_y) for i in range(n))
    den = sum((x[i] - mean_x) ** 2 for i in range(n))
    slope = num / den if den != 0 else 0
    intercept = mean_y - slope * mean_x

    next_val = slope * n + intercept

    if slope > 5:
        label = "Rising"
    elif slope < -5:
        label = "Falling"
    else:
        label = "Stable"

    return slope, max(0, next_val), label


def _demo_prices(plant_name: str) -> dict:
    """Demo fallback with realistic price ranges when API unavailable."""
    demo_data = {
        "tomato": (1200, 1800),
        "potato": (800, 1200),
        "pepper": (2500, 4000),
        "apple": (4000, 8000),
        "onion": (1000, 2500),
    }
    key = plant_name.lower()
    for crop, (lo, hi) in demo_data.items():
        if crop in key:
            avg = (lo + hi) // 2
            return {
                "available": False,
                "plant": plant_name,
                "commodity": plant_name.capitalize(),
                "avg_price": avg,
                "median_price": avg,
                "min_price": lo,
                "max_price": hi,
                "sample_count": 0,
                "trend": "Stable",
                "predicted_next_week": avg,
                "markets": [],
                "price_history": [],
                "currency": "INR/Quintal",
                "last_updated": "Demo data",
                "note": "Add DATA_GOV_API_KEY for live prices",
            }

    return {
        "available": False,
        "plant": plant_name,
        "commodity": plant_name.capitalize(),
        "avg_price": 0,
        "trend": "Unknown",
        "predicted_next_week": 0,
        "markets": [],
        "price_history": [],
        "currency": "INR/Quintal",
        "last_updated": "N/A",
        "note": "Market data not available for this crop. Add DATA_GOV_API_KEY.",
    }
