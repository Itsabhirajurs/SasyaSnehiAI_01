"""Market price service — Indian crop prices.

Primary: data.gov.in AgMarknet (when key is available and server responds).
Fallback: Rich realistic Indian market simulation with proper seasonal patterns,
          multiple mandi entries, 14-week history, and ML trend prediction.
          This produces fully functional charts and analysis even without an API key.
"""

from __future__ import annotations

import math
import random
import statistics
from datetime import datetime, timedelta

import requests

# data.gov.in resource ID (kept for when it's back online)
AGMARKNET_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
DATA_GOV_BASE = "https://api.data.gov.in/resource"

# Indian market data — realistic base prices (INR/Quintal), seasonal variation, and mandis
INDIAN_MARKET_DATA: dict[str, dict] = {
    "tomato": {
        "base": 1500, "seasonal_amp": 600, "peak_months": [11, 12, 1],
        "mandis": [
            ("Azadpur", "Delhi", "Delhi"),
            ("Vashi APMC", "Thane", "Maharashtra"),
            ("KR Market", "Bengaluru", "Karnataka"),
            ("Lasalgaon", "Nashik", "Maharashtra"),
            ("Madanapalle", "Chittoor", "Andhra Pradesh"),
            ("Kolar", "Kolar", "Karnataka"),
        ],
    },
    "potato": {
        "base": 1000, "seasonal_amp": 300, "peak_months": [2, 3, 4],
        "mandis": [
            ("Agra APMC", "Agra", "Uttar Pradesh"),
            ("Azadpur", "Delhi", "Delhi"),
            ("Deesa", "Banaskantha", "Gujarat"),
            ("Jalandhar", "Jalandhar", "Punjab"),
            ("Farrukhabad", "Farrukhabad", "Uttar Pradesh"),
        ],
    },
    "pepper": {
        "base": 3200, "seasonal_amp": 800, "peak_months": [3, 4, 5],
        "mandis": [
            ("Kochi", "Ernakulam", "Kerala"),
            ("Azadpur", "Delhi", "Delhi"),
            ("Mysore", "Mysore", "Karnataka"),
            ("Guntur", "Guntur", "Andhra Pradesh"),
        ],
    },
    "apple": {
        "base": 6000, "seasonal_amp": 2000, "peak_months": [8, 9, 10],
        "mandis": [
            ("Azadpur", "Delhi", "Delhi"),
            ("Solan", "Solan", "Himachal Pradesh"),
            ("Shimla", "Shimla", "Himachal Pradesh"),
            ("Sopore", "Baramulla", "Jammu & Kashmir"),
            ("Crawford Market", "Mumbai", "Maharashtra"),
        ],
    },
    "onion": {
        "base": 1800, "seasonal_amp": 1200, "peak_months": [10, 11, 12],
        "mandis": [
            ("Lasalgaon", "Nashik", "Maharashtra"),
            ("Azadpur", "Delhi", "Delhi"),
            ("Mahabaleshwar", "Satara", "Maharashtra"),
            ("Bellary", "Bellary", "Karnataka"),
        ],
    },
    "rice": {
        "base": 2200, "seasonal_amp": 200, "peak_months": [10, 11],
        "mandis": [
            ("Sonepat", "Sonepat", "Haryana"),
            ("Karnal", "Karnal", "Haryana"),
            ("Cuttack", "Cuttack", "Odisha"),
            ("Warangal", "Warangal", "Telangana"),
        ],
    },
    "wheat": {
        "base": 2100, "seasonal_amp": 150, "peak_months": [4, 5],
        "mandis": [
            ("Khanna", "Ludhiana", "Punjab"),
            ("Karnal", "Karnal", "Haryana"),
            ("Azadpur", "Delhi", "Delhi"),
            ("Indore", "Indore", "Madhya Pradesh"),
        ],
    },
    "cotton": {
        "base": 6500, "seasonal_amp": 1000, "peak_months": [10, 11, 12],
        "mandis": [
            ("Guntur", "Guntur", "Andhra Pradesh"),
            ("Akola", "Akola", "Maharashtra"),
            ("Kurnool", "Kurnool", "Andhra Pradesh"),
            ("Surendranagar", "Surendranagar", "Gujarat"),
        ],
    },
    "maize": {
        "base": 1800, "seasonal_amp": 300, "peak_months": [10, 11],
        "mandis": [
            ("Davangere", "Davangere", "Karnataka"),
            ("Nizamabad", "Nizamabad", "Telangana"),
            ("Dhule", "Dhule", "Maharashtra"),
        ],
    },
}

CROP_ALIASES: dict[str, str] = {
    "tomato": "tomato",
    "potato": "potato",
    "pepper": "pepper",
    "bell pepper": "pepper",
    "capsicum": "pepper",
    "apple": "apple",
    "onion": "onion",
    "rice": "rice",
    "paddy": "rice",
    "wheat": "wheat",
    "cotton": "cotton",
    "maize": "maize",
    "corn": "maize",
}


# ─────────────────────────────────────────────────────────────────────────────

def get_market_prices(plant_name: str, state: str | None, api_key: str) -> dict:
    """Fetch crop market prices. Tries data.gov.in first, falls back to rich simulation."""
    if api_key and api_key.strip():
        result = _try_data_gov(plant_name, state, api_key.strip())
        if result:
            return result

    # Rich realistic Indian market simulation
    return _rich_market_simulation(plant_name, state)


def _try_data_gov(plant_name: str, state: str | None, api_key: str) -> dict | None:
    """Try data.gov.in AgMarknet. Returns None on any failure."""
    crop_key = _resolve_crop(plant_name)
    crop_info = INDIAN_MARKET_DATA.get(crop_key, {})
    commodity = plant_name.capitalize()
    if crop_key == "pepper":
        commodity = "Capsicum"
    elif crop_key == "rice":
        commodity = "Paddy"
    elif crop_key == "maize":
        commodity = "Maize"

    try:
        params: dict = {
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
            timeout=8,
        )
        resp.raise_for_status()
        data = resp.json()
        records = data.get("records", [])
        if not records:
            return None
        return _process_records(records, plant_name)
    except Exception:
        return None


def _process_records(records: list[dict], plant_name: str) -> dict:
    """Process live AgMarknet records."""
    prices, markets = [], []
    for rec in records:
        try:
            modal = float(str(rec.get("modal_price", "0")).replace(",", ""))
            lo = float(str(rec.get("min_price", "0")).replace(",", ""))
            hi = float(str(rec.get("max_price", "0")).replace(",", ""))
            if modal <= 0:
                continue
            prices.append(modal)
            markets.append({
                "market": rec.get("market", ""),
                "state": rec.get("state", ""),
                "district": rec.get("district", ""),
                "commodity": rec.get("commodity", plant_name),
                "min_price": lo, "max_price": hi, "modal_price": modal,
                "date": rec.get("arrival_date", ""),
            })
        except (ValueError, TypeError):
            continue

    if not prices:
        return None  # type: ignore

    avg = statistics.mean(prices)
    _, prediction, trend_label = _predict_trend(prices)

    return {
        "available": True,
        "plant": plant_name,
        "commodity": markets[0]["commodity"] if markets else plant_name,
        "avg_price": round(avg, 0),
        "median_price": round(statistics.median(prices), 0),
        "min_price": round(min(prices), 0),
        "max_price": round(max(prices), 0),
        "sample_count": len(prices),
        "trend": trend_label,
        "predicted_next_week": round(prediction, 0),
        "markets": markets[:8],
        "price_history": prices[-14:],
        "currency": "INR/Quintal",
        "last_updated": datetime.now().strftime("%d %b %Y"),
        "source": "data.gov.in (AgMarknet)",
    }


def _rich_market_simulation(plant_name: str, state: str | None) -> dict:
    """Generate realistic Indian market price data with proper seasonal patterns."""
    crop_key = _resolve_crop(plant_name)
    info = INDIAN_MARKET_DATA.get(crop_key, {
        "base": 1500, "seasonal_amp": 300, "peak_months": [10, 11],
        "mandis": [("Azadpur", "Delhi", "Delhi"), ("Vashi APMC", "Thane", "Maharashtra")],
    })

    base = info["base"]
    amp = info["seasonal_amp"]
    peak_months = info["peak_months"]
    mandis = info["mandis"]

    # Seed randomness from crop name so prices are consistent per crop
    seed = sum(ord(c) for c in plant_name.lower())
    rng = random.Random(seed + datetime.now().isocalendar()[1])

    def _seasonal_factor(month: int) -> float:
        """Returns 0.0–1.0 based on how close month is to peak season."""
        dists = [min(abs(month - p), 12 - abs(month - p)) for p in peak_months]
        min_dist = min(dists)
        return math.cos(min_dist * math.pi / 6) * 0.5 + 0.5

    # Generate 14-week price history
    history = []
    today = datetime.now()
    current = base + rng.uniform(-base * 0.05, base * 0.05)
    for i in range(14, 0, -1):
        week_date = today - timedelta(weeks=i)
        season = _seasonal_factor(week_date.month)
        target = base + amp * season + rng.uniform(-amp * 0.15, amp * 0.15)
        # Smooth movement toward target
        current = current + (target - current) * 0.3 + rng.uniform(-base * 0.03, base * 0.03)
        history.append(max(100, round(current, 0)))

    avg_price = statistics.mean(history[-7:])  # last 7 weeks avg
    _, prediction, trend_label = _predict_trend(history)

    # Build mandi list, optionally filtering by state
    mandi_list = mandis.copy()
    if state:
        # Put state-matching mandis first
        mandi_list = [m for m in mandis if state.lower() in m[2].lower()] + \
                     [m for m in mandis if state.lower() not in m[2].lower()]

    market_entries = []
    for (mkt, dist, st) in mandi_list[:6]:
        variation = rng.uniform(0.88, 1.12)
        modal = round(avg_price * variation, 0)
        lo = round(modal * rng.uniform(0.82, 0.94), 0)
        hi = round(modal * rng.uniform(1.06, 1.20), 0)
        market_entries.append({
            "market": mkt,
            "state": st,
            "district": dist,
            "commodity": plant_name.capitalize(),
            "min_price": lo,
            "max_price": hi,
            "modal_price": modal,
            "date": (today - timedelta(days=rng.randint(0, 3))).strftime("%d/%m/%Y"),
        })

    # Sort by modal price descending
    market_entries.sort(key=lambda x: x["modal_price"], reverse=True)

    return {
        "available": True,
        "plant": plant_name,
        "commodity": plant_name.capitalize(),
        "avg_price": round(avg_price, 0),
        "median_price": round(statistics.median(history[-7:]), 0),
        "min_price": round(min(history[-7:]), 0),
        "max_price": round(max(history[-7:]), 0),
        "sample_count": len(market_entries),
        "trend": trend_label,
        "predicted_next_week": round(max(100, prediction), 0),
        "markets": market_entries,
        "price_history": history,
        "currency": "INR/Quintal",
        "last_updated": today.strftime("%d %b %Y"),
        "note": "Indicative prices based on seasonal patterns — connect DATA_GOV_API_KEY for live AgMarknet data",
        "source": "Seasonal Simulation",
    }


def _resolve_crop(plant_name: str) -> str:
    """Map any plant name to our canonical crop key."""
    lower = plant_name.lower().strip()
    for alias, key in CROP_ALIASES.items():
        if alias in lower:
            return key
    return lower


def _predict_trend(prices: list[float]) -> tuple[float, float, str]:
    """Linear regression on price list → slope, next predicted value, label."""
    if len(prices) < 3:
        p = prices[-1] if prices else 0
        return 0.0, p, "Stable"

    n = len(prices)
    x = list(range(n))
    mean_x = sum(x) / n
    mean_y = sum(prices) / n

    num = sum((x[i] - mean_x) * (prices[i] - mean_y) for i in range(n))
    den = sum((xi - mean_x) ** 2 for xi in x)
    slope = num / den if den else 0
    next_val = slope * n + (mean_y - slope * mean_x)

    if slope > base_threshold(prices):
        label = "Rising"
    elif slope < -base_threshold(prices):
        label = "Falling"
    else:
        label = "Stable"

    return slope, max(0, next_val), label


def base_threshold(prices: list[float]) -> float:
    """Dynamic threshold — 0.5% of mean price per week."""
    return (sum(prices) / len(prices)) * 0.005 if prices else 5
