"""Market price service — Indian crop prices.

Priority chain:
  1. data.gov.in AgMarknet   (free key from https://data.gov.in — Indian mandi prices)
  2. Yahoo Finance CBOT/ICE  (FREE, no key — real global commodity futures)
  3. Alpha Vantage            (free key from alphavantage.co — commodity data)
  4. Rich seasonal simulation (always works — realistic Indian market model)
"""

from __future__ import annotations

import json
import math
import pickle
import random
import statistics
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import requests

# ── Sklearn price model loading ──────────────────────────────────────────────
_PRICE_MODELS_DIR = Path(__file__).parent.parent / "model" / "price_models"
_MODEL_CACHE: dict[str, object] = {}
_METADATA_CACHE: dict[str, dict] = {}


def _load_price_model(crop_key: str):
    """Lazy-load sklearn pipeline from .pkl; cache in memory."""
    if crop_key in _MODEL_CACHE:
        return _MODEL_CACHE[crop_key]
    pkl_path = _PRICE_MODELS_DIR / f"{crop_key}.pkl"
    if not pkl_path.exists():
        return None
    try:
        with open(pkl_path, "rb") as f:
            model = pickle.load(f)
        _MODEL_CACHE[crop_key] = model
        return model
    except Exception:
        return None


def _get_model_meta(crop_key: str) -> dict:
    """Return metadata (mae, r2, mape) for a crop model."""
    if _METADATA_CACHE:
        return _METADATA_CACHE.get(crop_key, {})
    meta_path = _PRICE_MODELS_DIR / "metadata.json"
    if meta_path.exists():
        try:
            with open(meta_path) as f:
                data = json.load(f)
            _METADATA_CACHE.update(data)
        except Exception:
            pass
    return _METADATA_CACHE.get(crop_key, {})


def _ml_predict_next(crop_key: str, prices: list[float]) -> float | None:
    """Use trained sklearn Ridge pipeline to predict next-week price."""
    if len(prices) < 8:
        return None
    model = _load_price_model(crop_key)
    if model is None:
        return None
    try:
        idx = len(prices) - 1
        woy = idx % 52
        sin_w = math.sin(2 * math.pi * woy / 52)
        cos_w = math.cos(2 * math.pi * woy / 52)
        lag1, lag2 = prices[-1], prices[-2]
        lag4, lag8 = prices[-4], prices[-8]
        roll4 = sum(prices[-4:]) / 4
        trend_idx = min(1.0, idx / 260)
        feat = np.array([[sin_w, cos_w, lag1, lag2, lag4, lag8, roll4, trend_idx]])
        return float(model.predict(feat)[0])
    except Exception:
        return None


# data.gov.in resource ID (kept for when it's back online)
AGMARKNET_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
DATA_GOV_BASE = "https://api.data.gov.in/resource"

# Indian market data — realistic base prices (INR/Quintal), seasonal variation, and mandis
# Each crop has mandis covering all 8 dropdown states + extras for realism
INDIAN_MARKET_DATA: dict[str, dict] = {
    "tomato": {
        "base": 1500, "seasonal_amp": 600, "peak_months": [11, 12, 1],
        "mandis": [
            ("KR Market", "Bengaluru", "Karnataka"),
            ("Kolar", "Kolar", "Karnataka"),
            ("Hubli", "Dharwad", "Karnataka"),
            ("Vashi APMC", "Thane", "Maharashtra"),
            ("Lasalgaon", "Nashik", "Maharashtra"),
            ("Pune APMC", "Pune", "Maharashtra"),
            ("Madanapalle", "Chittoor", "Andhra Pradesh"),
            ("Kurnool", "Kurnool", "Andhra Pradesh"),
            ("Warangal", "Warangal", "Telangana"),
            ("Hyderabad", "Ranga Reddy", "Telangana"),
            ("Jalandhar", "Jalandhar", "Punjab"),
            ("Amritsar", "Amritsar", "Punjab"),
            ("Koyambedu", "Chennai", "Tamil Nadu"),
            ("Madurai", "Madurai", "Tamil Nadu"),
            ("Rajkot", "Rajkot", "Gujarat"),
            ("Ahmedabad", "Ahmedabad", "Gujarat"),
            ("Lucknow", "Lucknow", "Uttar Pradesh"),
            ("Agra APMC", "Agra", "Uttar Pradesh"),
            ("Azadpur", "Delhi", "Delhi"),
        ],
    },
    "potato": {
        "base": 1000, "seasonal_amp": 300, "peak_months": [2, 3, 4],
        "mandis": [
            ("Agra APMC", "Agra", "Uttar Pradesh"),
            ("Farrukhabad", "Farrukhabad", "Uttar Pradesh"),
            ("Lucknow", "Lucknow", "Uttar Pradesh"),
            ("Jalandhar", "Jalandhar", "Punjab"),
            ("Ludhiana", "Ludhiana", "Punjab"),
            ("Deesa", "Banaskantha", "Gujarat"),
            ("Ahmedabad", "Ahmedabad", "Gujarat"),
            ("Bengaluru", "Bengaluru", "Karnataka"),
            ("Hubli", "Dharwad", "Karnataka"),
            ("Vashi APMC", "Thane", "Maharashtra"),
            ("Pune APMC", "Pune", "Maharashtra"),
            ("Kurnool", "Kurnool", "Andhra Pradesh"),
            ("Warangal", "Warangal", "Telangana"),
            ("Koyambedu", "Chennai", "Tamil Nadu"),
            ("Azadpur", "Delhi", "Delhi"),
        ],
    },
    "pepper": {
        "base": 3200, "seasonal_amp": 800, "peak_months": [3, 4, 5],
        "mandis": [
            ("Mysore", "Mysore", "Karnataka"),
            ("Bengaluru", "Bengaluru", "Karnataka"),
            ("Hubli", "Dharwad", "Karnataka"),
            ("Guntur", "Guntur", "Andhra Pradesh"),
            ("Kurnool", "Kurnool", "Andhra Pradesh"),
            ("Hyderabad", "Ranga Reddy", "Telangana"),
            ("Vashi APMC", "Thane", "Maharashtra"),
            ("Pune APMC", "Pune", "Maharashtra"),
            ("Jalandhar", "Jalandhar", "Punjab"),
            ("Koyambedu", "Chennai", "Tamil Nadu"),
            ("Coimbatore", "Coimbatore", "Tamil Nadu"),
            ("Rajkot", "Rajkot", "Gujarat"),
            ("Lucknow", "Lucknow", "Uttar Pradesh"),
            ("Azadpur", "Delhi", "Delhi"),
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
            ("Pune APMC", "Pune", "Maharashtra"),
            ("Bengaluru", "Bengaluru", "Karnataka"),
            ("Jalandhar", "Jalandhar", "Punjab"),
            ("Amritsar", "Amritsar", "Punjab"),
            ("Lucknow", "Lucknow", "Uttar Pradesh"),
            ("Ahmedabad", "Ahmedabad", "Gujarat"),
            ("Koyambedu", "Chennai", "Tamil Nadu"),
            ("Hyderabad", "Ranga Reddy", "Telangana"),
            ("Kurnool", "Kurnool", "Andhra Pradesh"),
        ],
    },
    "onion": {
        "base": 1800, "seasonal_amp": 1200, "peak_months": [10, 11, 12],
        "mandis": [
            ("Lasalgaon", "Nashik", "Maharashtra"),
            ("Mahabaleshwar", "Satara", "Maharashtra"),
            ("Pune APMC", "Pune", "Maharashtra"),
            ("Bellary", "Bellary", "Karnataka"),
            ("Hubli", "Dharwad", "Karnataka"),
            ("Kurnool", "Kurnool", "Andhra Pradesh"),
            ("Hyderabad", "Ranga Reddy", "Telangana"),
            ("Jalandhar", "Jalandhar", "Punjab"),
            ("Amritsar", "Amritsar", "Punjab"),
            ("Koyambedu", "Chennai", "Tamil Nadu"),
            ("Rajkot", "Rajkot", "Gujarat"),
            ("Lucknow", "Lucknow", "Uttar Pradesh"),
            ("Azadpur", "Delhi", "Delhi"),
        ],
    },
    "rice": {
        "base": 2200, "seasonal_amp": 200, "peak_months": [10, 11],
        "mandis": [
            ("Karnal", "Karnal", "Haryana"),
            ("Sonepat", "Sonepat", "Haryana"),
            ("Warangal", "Warangal", "Telangana"),
            ("Hyderabad", "Ranga Reddy", "Telangana"),
            ("Kurnool", "Kurnool", "Andhra Pradesh"),
            ("Guntur", "Guntur", "Andhra Pradesh"),
            ("Davangere", "Davangere", "Karnataka"),
            ("Jalandhar", "Jalandhar", "Punjab"),
            ("Ludhiana", "Ludhiana", "Punjab"),
            ("Koyambedu", "Chennai", "Tamil Nadu"),
            ("Thanjavur", "Thanjavur", "Tamil Nadu"),
            ("Rajkot", "Rajkot", "Gujarat"),
            ("Lucknow", "Lucknow", "Uttar Pradesh"),
            ("Vashi APMC", "Thane", "Maharashtra"),
            ("Azadpur", "Delhi", "Delhi"),
        ],
    },
    "wheat": {
        "base": 2100, "seasonal_amp": 150, "peak_months": [4, 5],
        "mandis": [
            ("Khanna", "Ludhiana", "Punjab"),
            ("Jalandhar", "Jalandhar", "Punjab"),
            ("Amritsar", "Amritsar", "Punjab"),
            ("Karnal", "Karnal", "Haryana"),
            ("Indore", "Indore", "Madhya Pradesh"),
            ("Lucknow", "Lucknow", "Uttar Pradesh"),
            ("Agra APMC", "Agra", "Uttar Pradesh"),
            ("Ahmedabad", "Ahmedabad", "Gujarat"),
            ("Vashi APMC", "Thane", "Maharashtra"),
            ("Bengaluru", "Bengaluru", "Karnataka"),
            ("Hyderabad", "Ranga Reddy", "Telangana"),
            ("Koyambedu", "Chennai", "Tamil Nadu"),
            ("Azadpur", "Delhi", "Delhi"),
        ],
    },
    "cotton": {
        "base": 6500, "seasonal_amp": 1000, "peak_months": [10, 11, 12],
        "mandis": [
            ("Guntur", "Guntur", "Andhra Pradesh"),
            ("Kurnool", "Kurnool", "Andhra Pradesh"),
            ("Akola", "Akola", "Maharashtra"),
            ("Nagpur", "Nagpur", "Maharashtra"),
            ("Surendranagar", "Surendranagar", "Gujarat"),
            ("Rajkot", "Rajkot", "Gujarat"),
            ("Warangal", "Warangal", "Telangana"),
            ("Hubli", "Dharwad", "Karnataka"),
            ("Jalandhar", "Jalandhar", "Punjab"),
            ("Lucknow", "Lucknow", "Uttar Pradesh"),
            ("Coimbatore", "Coimbatore", "Tamil Nadu"),
            ("Azadpur", "Delhi", "Delhi"),
        ],
    },
    "maize": {
        "base": 1800, "seasonal_amp": 300, "peak_months": [10, 11],
        "mandis": [
            ("Davangere", "Davangere", "Karnataka"),
            ("Hubli", "Dharwad", "Karnataka"),
            ("Nizamabad", "Nizamabad", "Telangana"),
            ("Hyderabad", "Ranga Reddy", "Telangana"),
            ("Dhule", "Dhule", "Maharashtra"),
            ("Pune APMC", "Pune", "Maharashtra"),
            ("Guntur", "Guntur", "Andhra Pradesh"),
            ("Jalandhar", "Jalandhar", "Punjab"),
            ("Koyambedu", "Chennai", "Tamil Nadu"),
            ("Rajkot", "Rajkot", "Gujarat"),
            ("Lucknow", "Lucknow", "Uttar Pradesh"),
            ("Azadpur", "Delhi", "Delhi"),
        ],
    },
    "mango": {
        "base": 4000, "seasonal_amp": 2500, "peak_months": [5, 6, 7],
        "mandis": [
            ("Vashi APMC", "Thane", "Maharashtra"),
            ("Ratnagiri", "Ratnagiri", "Maharashtra"),
            ("Bengaluru", "Bengaluru", "Karnataka"),
            ("Hubli", "Dharwad", "Karnataka"),
            ("Kurnool", "Kurnool", "Andhra Pradesh"),
            ("Hyderabad", "Ranga Reddy", "Telangana"),
            ("Koyambedu", "Chennai", "Tamil Nadu"),
            ("Madurai", "Madurai", "Tamil Nadu"),
            ("Lucknow", "Lucknow", "Uttar Pradesh"),
            ("Ahmedabad", "Ahmedabad", "Gujarat"),
            ("Jalandhar", "Jalandhar", "Punjab"),
            ("Azadpur", "Delhi", "Delhi"),
        ],
    },
}

# State-level price adjustment factors — some states are premium/discount markets
_STATE_PRICE_FACTOR: dict[str, float] = {
    "karnataka": 0.95,
    "maharashtra": 1.05,
    "andhra pradesh": 0.92,
    "telangana": 0.94,
    "punjab": 1.08,
    "tamil nadu": 1.02,
    "gujarat": 0.97,
    "uttar pradesh": 0.90,
    "delhi": 1.12,
    "haryana": 1.04,
    "madhya pradesh": 0.93,
    "himachal pradesh": 1.15,
    "kerala": 1.10,
    "jammu & kashmir": 1.18,
    "odisha": 0.88,
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
    "mango": "mango",
}


# ─────────────────────────────────────────────────────────────────────────────

def get_market_prices(plant_name: str, state: str | None, api_key: str,
                      alpha_vantage_key: str = "") -> dict:
    """Fetch crop market prices.
    Priority: data.gov.in → Yahoo Finance → Alpha Vantage → simulation.
    """
    state_clean = (state or "").strip()
    state_param = state_clean if state_clean else None

    # 1) Official Indian mandi prices (best source, needs free key)
    if api_key and api_key.strip():
        result = _try_data_gov(plant_name, state_param, api_key.strip())
        if result:
            return result

    # 2) Yahoo Finance CBOT/ICE futures — FREE, no key needed
    result = _try_yahoo_finance(plant_name, state_param)
    if result:
        return result

    # 3) Alpha Vantage commodity data (needs free key)
    if alpha_vantage_key and alpha_vantage_key.strip():
        result = _try_alpha_vantage(plant_name, alpha_vantage_key.strip())
        if result:
            return result

    # 4) Rich realistic Indian market simulation + ML prediction
    return _rich_market_simulation(plant_name, state_param)


# Alpha Vantage commodity symbols (maps to crop_key)
_AV_SYMBOLS: dict[str, str] = {
    "wheat": "WHEAT",
    "corn": "CORN",
    "maize": "CORN",
    "cotton": "COTTON",
    "rice": "RICE",
    "sugarcane": "SUGAR",
}

# ── Yahoo Finance commodity futures (FREE, no key needed) ───────────────────
_YAHOO_SYMBOLS: dict[str, str] = {
    "wheat": "ZW=F",    # CBOT Wheat
    "corn": "ZC=F",     # CBOT Corn
    "maize": "ZC=F",    # alias
    "cotton": "CT=F",   # ICE Cotton
    "rice": "ZR=F",     # CBOT Rough Rice
}

# Conversion factors: commodity future unit → INR / Quintal
# Formula: (price_in_cents / 100) × factor × USD_TO_INR = INR/Quintal
_YAHOO_USD_TO_INR = 84  # current approximate rate
_YAHOO_UNIT_FACTORS: dict[str, float] = {
    "ZW=F": 3.674,    # 1 bushel=27.22 kg → 100/27.22 bushels/quintal
    "ZC=F": 3.937,    # 1 bushel=25.40 kg → 100/25.40 bushels/quintal
    "CT=F": 121.25,   # 1 lb=0.4536 kg → 220.46 lbs/quintal × 0.55 (kapas/lint adjust)
    "ZR=F": 2.205,    # 1 cwt=45.36 kg → 100/45.36 cwts/quintal
}
# Min price in cents to filter bad data from Yahoo Finance
_YAHOO_MIN_PRICE: dict[str, float] = {
    "ZW=F": 200,   # Wheat rarely below 200 cents/bushel
    "ZC=F": 150,   # Corn rarely below 150 cents/bushel
    "CT=F": 30,    # Cotton rarely below 30 cents/lb
    "ZR=F": 300,   # Rice rarely below 300 cents/cwt
}


def _try_yahoo_finance(plant_name: str, state: str | None) -> dict | None:
    """Fetch REAL commodity futures from Yahoo Finance (FREE, no key).

    Covers: wheat, corn/maize, cotton, rice.
    Returns None for crops without futures (tomato, potato, onion, etc.)
    """
    crop_key = _resolve_crop(plant_name)
    symbol = _YAHOO_SYMBOLS.get(crop_key)
    if not symbol:
        return None  # Perishable crops have no futures

    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
        params = {"range": "6mo", "interval": "1wk"}
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        r = requests.get(url, params=params, headers=headers, timeout=10)
        r.raise_for_status()
        data = r.json()

        result_data = data.get("chart", {}).get("result")
        if not result_data:
            return None

        chart = result_data[0]
        closes_raw = chart["indicators"]["quote"][0]["close"]
        timestamps = chart.get("timestamp", [])

        # Filter out None values and bad data; convert to INR/Quintal
        factor = _YAHOO_UNIT_FACTORS.get(symbol, 1.0) * _YAHOO_USD_TO_INR
        min_price_cents = _YAHOO_MIN_PRICE.get(symbol, 50)
        # Yahoo Finance commodity prices are in cents (USX) — divide by 100
        prices_inr = []
        for c in closes_raw:
            if c is not None and c >= min_price_cents:
                prices_inr.append(round(c / 100 * factor, 0))

        if len(prices_inr) < 5:
            return None

        # Take last 14 weeks for chart, or all available
        history = prices_inr[-14:] if len(prices_inr) > 14 else prices_inr

        avg = statistics.mean(history)
        ml_pred = _ml_predict_next(crop_key, history)
        _, lin_pred, trend_label = _predict_trend(history)
        prediction = ml_pred if ml_pred and ml_pred > 0 else lin_pred
        meta = _get_model_meta(crop_key)

        # State-aware mandi generation using real price as anchor
        state_norm = (state or "").strip().lower()
        state_factor = 1.0
        if state_norm:
            state_factor = _STATE_PRICE_FACTOR.get(state_norm, 1.0)

        info = INDIAN_MARKET_DATA.get(crop_key, {})
        mandis = info.get("mandis", [
            ("Azadpur", "Delhi", "Delhi"),
            ("Vashi APMC", "Thane", "Maharashtra"),
        ])

        # Filter mandis by state
        if state_norm:
            filtered = [m for m in mandis if state_norm in m[2].lower()]
            mandi_list = filtered if filtered else mandis
        else:
            mandi_list = mandis

        # Build mandi entries anchored to REAL price
        rng = random.Random(int(avg * 100) + sum(ord(c) for c in (state or "")))
        market_entries = []
        mandi_prices = []
        current_price = history[-1] * state_factor
        for (mkt, dist, st) in mandi_list[:8]:
            variation = rng.uniform(0.90, 1.10)
            mf = _STATE_PRICE_FACTOR.get(st.lower(), 1.0)
            modal = round(current_price * variation * mf, 0)
            lo = round(modal * rng.uniform(0.85, 0.95), 0)
            hi = round(modal * rng.uniform(1.05, 1.18), 0)
            market_entries.append({
                "market": mkt, "state": st, "district": dist,
                "commodity": plant_name.capitalize(),
                "min_price": lo, "max_price": hi, "modal_price": modal,
                "date": datetime.now().strftime("%d/%m/%Y"),
            })
            mandi_prices.append(modal)

        market_entries.sort(key=lambda x: x["modal_price"], reverse=True)

        # Adjust history for selected state
        adj_history = [round(p * state_factor, 0) for p in history]

        kpi_avg = round(statistics.mean(mandi_prices), 0) if mandi_prices else round(avg * state_factor, 0)
        kpi_median = round(statistics.median(mandi_prices), 0) if mandi_prices else round(avg * state_factor, 0)

        return {
            "available": True,
            "plant": plant_name,
            "commodity": plant_name.capitalize(),
            "avg_price": kpi_avg,
            "median_price": kpi_median,
            "min_price": round(min(mandi_prices), 0) if mandi_prices else round(min(adj_history), 0),
            "max_price": round(max(mandi_prices), 0) if mandi_prices else round(max(adj_history), 0),
            "sample_count": len(market_entries),
            "trend": trend_label,
            "predicted_next_week": round(max(100, prediction * state_factor), 0),
            "markets": market_entries,
            "price_history": adj_history,
            "currency": "INR/Quintal",
            "last_updated": datetime.now().strftime("%d %b %Y"),
            "source": f"Yahoo Finance ({symbol}) — LIVE",
            "model_used": "ML Ridge" if (ml_pred and ml_pred > 0) else "Linear Regression",
            "model_r2": meta.get("r2"),
            "note": f"Real-time {plant_name.capitalize()} futures from CBOT/ICE, converted to INR/Quintal" + (
                f" — showing {state} market estimates" if state_norm else ""
            ),
        }
    except Exception:
        return None


def _try_alpha_vantage(plant_name: str, av_key: str) -> dict | None:
    """Fetch real price from Alpha Vantage commodity API (free, 25 req/day)."""
    crop_key = _resolve_crop(plant_name)
    symbol = _AV_SYMBOLS.get(crop_key)
    if not symbol:
        return None  # Only covers above crops
    try:
        url = "https://www.alphavantage.co/query"
        params = {"function": "COMMODITY", "symbol": symbol, "apikey": av_key}
        r = requests.get(url, params=params, timeout=8)
        r.raise_for_status()
        data = r.json()
        if "Information" in data or "Note" in data:
            return None  # Rate limit hit
        records = data.get("data", [])
        if not records:
            return None
        # Alpha Vantage prices are in USD/unit (international). Convert to rough INR/quintal
        # 1 USD ≈ 83 INR; units vary by commodity but we normalise to /quintal
        USD_TO_INR = 83
        UNIT_FACTORS = {"WHEAT": 3.674, "CORN": 3.937, "COTTON": 2.205,
                        "RICE": 4.409, "SUGAR": 2000.0}  # → INR/Quintal multipliers
        factor = UNIT_FACTORS.get(symbol, 1.0) * USD_TO_INR

        prices = []
        for rec in records[:14]:
            try:
                prices.append(float(rec["value"]) * factor)
            except (KeyError, ValueError):
                continue
        if not prices:
            return None

        avg = statistics.mean(prices)
        ml_pred = _ml_predict_next(crop_key, prices)
        _, lin_pred, trend_label = _predict_trend(prices)
        prediction = ml_pred if ml_pred and ml_pred > 0 else lin_pred
        meta = _get_model_meta(crop_key)

        return {
            "available": True,
            "plant": plant_name,
            "commodity": plant_name.capitalize(),
            "avg_price": round(avg, 0),
            "median_price": round(statistics.median(prices), 0),
            "min_price": round(min(prices), 0),
            "max_price": round(max(prices), 0),
            "sample_count": len(prices),
            "trend": trend_label,
            "predicted_next_week": round(max(100, prediction), 0),
            "markets": [],
            "price_history": prices,
            "currency": "INR/Quintal (est.)",
            "last_updated": datetime.now().strftime("%d %b %Y"),
            "source": "Alpha Vantage (live global commodity)",
            "model_used": "ML Ridge" if ml_pred else "Linear Regression",
            "model_r2": meta.get("r2"),
            "note": "Prices converted from USD international futures — use as indicative trend only.",
        }
    except Exception:
        return None


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
            params["filters[state]"] = state.strip()

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
    crop_key = _resolve_crop(plant_name)
    ml_pred = _ml_predict_next(crop_key, prices[-14:] if len(prices) >= 14 else prices)
    _, lin_pred, trend_label = _predict_trend(prices)
    prediction = ml_pred if ml_pred and ml_pred > 0 else lin_pred
    meta = _get_model_meta(crop_key)

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
        "predicted_next_week": round(max(100, prediction), 0),
        "markets": markets[:8],
        "price_history": prices[-14:],
        "currency": "INR/Quintal",
        "last_updated": datetime.now().strftime("%d %b %Y"),
        "source": "data.gov.in (AgMarknet)",
        "model_used": "ML Ridge" if ml_pred else "Linear Regression",
        "model_r2": meta.get("r2"),
    }


def _rich_market_simulation(plant_name: str, state: str | None) -> dict:
    """Generate realistic Indian market price data with proper seasonal patterns.

    When a state is selected, prices are adjusted by a state-specific factor
    so that KPI values, chart, and mandis visibly change per state.
    """
    crop_key = _resolve_crop(plant_name)
    info = INDIAN_MARKET_DATA.get(crop_key, {
        "base": 1500, "seasonal_amp": 300, "peak_months": [10, 11],
        "mandis": [("Azadpur", "Delhi", "Delhi"), ("Vashi APMC", "Thane", "Maharashtra")],
    })

    base = info["base"]
    amp = info["seasonal_amp"]
    peak_months = info["peak_months"]
    mandis = info["mandis"]

    # ── State-aware price adjustment ─────────────────────────────────────────
    state_norm = (state or "").strip().lower()
    state_factor = 1.0
    if state_norm:
        state_factor = _STATE_PRICE_FACTOR.get(state_norm, 1.0)
        # Also perturb slightly so each state-crop combo is unique
        state_seed = sum(ord(c) for c in state_norm)
        state_rng = random.Random(state_seed + sum(ord(c) for c in crop_key))
        state_factor *= state_rng.uniform(0.96, 1.04)

    adj_base = base * state_factor
    adj_amp = amp * state_factor

    # Seed randomness from crop name + state so prices differ per state
    seed = sum(ord(c) for c in plant_name.lower())
    if state_norm:
        seed += sum(ord(c) * (i + 1) for i, c in enumerate(state_norm))
    rng = random.Random(seed + datetime.now().isocalendar()[1])

    def _seasonal_factor(month: int) -> float:
        """Returns 0.0–1.0 based on how close month is to peak season."""
        dists = [min(abs(month - p), 12 - abs(month - p)) for p in peak_months]
        min_dist = min(dists)
        return math.cos(min_dist * math.pi / 6) * 0.5 + 0.5

    # Generate 14-week price history (state-specific)
    history = []
    today = datetime.now()
    current = adj_base + rng.uniform(-adj_base * 0.05, adj_base * 0.05)
    for i in range(14, 0, -1):
        week_date = today - timedelta(weeks=i)
        season = _seasonal_factor(week_date.month)
        target = adj_base + adj_amp * season + rng.uniform(-adj_amp * 0.15, adj_amp * 0.15)
        current = current + (target - current) * 0.3 + rng.uniform(-adj_base * 0.03, adj_base * 0.03)
        history.append(max(100, round(current, 0)))

    # ── Filter mandis by state ───────────────────────────────────────────────
    filtered_mandis = []
    if state_norm:
        filtered_mandis = [m for m in mandis if state_norm in m[2].lower()]

    mandi_list = filtered_mandis if filtered_mandis else mandis

    # ── Compute KPIs from mandis (state-specific) ───────────────────────────
    avg_price = statistics.mean(history[-7:])
    ml_pred = _ml_predict_next(crop_key, history)
    _, lin_pred, trend_label = _predict_trend(history)
    prediction = ml_pred if ml_pred and ml_pred > 0 else lin_pred
    meta = _get_model_meta(crop_key)

    # Build market entries with state-aware pricing
    market_entries = []
    mandi_prices = []
    for (mkt, dist, st) in mandi_list[:8]:
        variation = rng.uniform(0.88, 1.12)
        # Apply per-mandi state factor for the mandi's own state
        mandi_state_factor = _STATE_PRICE_FACTOR.get(st.lower(), 1.0)
        modal = round(avg_price * variation * mandi_state_factor, 0)
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
        mandi_prices.append(modal)

    market_entries.sort(key=lambda x: x["modal_price"], reverse=True)

    # Recompute KPIs from filtered mandi prices if available
    if mandi_prices:
        kpi_avg = round(statistics.mean(mandi_prices), 0)
        kpi_median = round(statistics.median(mandi_prices), 0)
        kpi_min = round(min(mandi_prices), 0)
        kpi_max = round(max(mandi_prices), 0)
    else:
        kpi_avg = round(avg_price, 0)
        kpi_median = round(statistics.median(history[-7:]), 0)
        kpi_min = round(min(history[-7:]), 0)
        kpi_max = round(max(history[-7:]), 0)

    # Build note
    note = "Indicative prices based on seasonal patterns — connect DATA_GOV_API_KEY for live AgMarknet data"
    if state_norm:
        if filtered_mandis:
            note = f"Showing {state} market data (simulated)" 
        else:
            note = f"No mandis found for {state} — showing all available mandis (simulated)"

    return {
        "available": True,
        "plant": plant_name,
        "commodity": plant_name.capitalize(),
        "avg_price": kpi_avg,
        "median_price": kpi_median,
        "min_price": kpi_min,
        "max_price": kpi_max,
        "sample_count": len(market_entries),
        "trend": trend_label,
        "predicted_next_week": round(max(100, prediction), 0),
        "markets": market_entries,
        "price_history": history,
        "currency": "INR/Quintal",
        "last_updated": today.strftime("%d %b %Y"),
        "note": note,
        "source": "Seasonal Simulation",
        "model_used": "ML Ridge" if (ml_pred and ml_pred > 0) else "Linear Regression",
        "model_r2": meta.get("r2"),
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
