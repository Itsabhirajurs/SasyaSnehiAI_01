"""
Train crop price prediction models using scikit-learn.

Approach:
  - Generates 4 years of realistic weekly Indian mandi price data per crop,
    incorporating seasonal patterns, noise, and trend drift.
  - Extracts features: week-of-year (cyclic sine/cosine), lag prices (1,2,4,8 weeks),
    rolling mean (4-week), and a trend index.
  - Trains a Ridge regression model with polynomial features (degree 2).
  - Saves each model to model/price_models/<crop>.pkl
  - Also saves a metadata JSON with feature stats for live inference.

Run: python train_price_model.py
"""

from __future__ import annotations

import json
import math
import os
import pickle
import random
from pathlib import Path

import numpy as np

try:
    from sklearn.linear_model import Ridge
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import PolynomialFeatures, StandardScaler
    SKLEARN_OK = True
except ImportError:
    print("scikit-learn not found. Installing...")
    os.system("pip install scikit-learn --quiet")
    from sklearn.linear_model import Ridge
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import PolynomialFeatures, StandardScaler
    SKLEARN_OK = True

# ─────────────────────────────────────────────────────────────────────────────
# Crop profiles (same as market_price.py)
# ─────────────────────────────────────────────────────────────────────────────

CROP_PROFILES: dict[str, dict] = {
    "tomato":    {"base": 1500, "amp": 600,  "peak_months": [11, 12, 1],  "trend_per_year": 80},
    "potato":    {"base": 1000, "amp": 300,  "peak_months": [2, 3, 4],    "trend_per_year": 50},
    "pepper":    {"base": 3200, "amp": 800,  "peak_months": [3, 4, 5],    "trend_per_year": 120},
    "apple":     {"base": 6000, "amp": 2000, "peak_months": [8, 9, 10],   "trend_per_year": 200},
    "onion":     {"base": 1800, "amp": 1200, "peak_months": [10, 11, 12], "trend_per_year": 60},
    "rice":      {"base": 2200, "amp": 200,  "peak_months": [10, 11],     "trend_per_year": 80},
    "wheat":     {"base": 2100, "amp": 150,  "peak_months": [4, 5],       "trend_per_year": 70},
    "cotton":    {"base": 6500, "amp": 1000, "peak_months": [10, 11, 12], "trend_per_year": 150},
    "maize":     {"base": 1800, "amp": 300,  "peak_months": [10, 11],     "trend_per_year": 55},
    "sugarcane": {"base": 3200, "amp": 200,  "peak_months": [1, 2, 3],   "trend_per_year": 60},
}

NUM_WEEKS = 260  # 5 years of weekly data


# ─────────────────────────────────────────────────────────────────────────────

def seasonal_factor(week_of_year: int, peak_months: list[int]) -> float:
    """0.0–1.0 based on how close the week is to the peak season."""
    month = (week_of_year * 12 // 52) + 1
    dists = [min(abs(month - p), 12 - abs(month - p)) for p in peak_months]
    return math.cos(min(dists) * math.pi / 6) * 0.5 + 0.5


def generate_price_series(profile: dict, n_weeks: int, seed: int) -> list[float]:
    """Generate realistic weekly price series with seasonal + noise + random shocks."""
    rng = random.Random(seed)
    base = profile["base"]
    amp = profile["amp"]
    peak_months = profile["peak_months"]
    trend = profile["trend_per_year"] / 52  # weekly trend

    prices = []
    current = base + rng.uniform(-base * 0.05, base * 0.05)

    for week in range(n_weeks):
        woy = week % 52
        sf = seasonal_factor(woy, peak_months)
        target = base + amp * sf + trend * week
        # AR(1)-like smoothing + noise
        current = current + (target - current) * 0.25 + rng.uniform(-base * 0.04, base * 0.04)
        # Rare market shocks
        if rng.random() < 0.03:
            current *= rng.uniform(0.80, 1.20)
        prices.append(max(50.0, round(current, 2)))

    return prices


def extract_features(prices: list[float], idx: int) -> list[float]:
    """Extract feature vector for position idx in price series."""
    woy = idx % 52
    # Cyclic encoding of week of year
    sin_week = math.sin(2 * math.pi * woy / 52)
    cos_week = math.cos(2 * math.pi * woy / 52)

    # Lag features
    lag1 = prices[idx - 1] if idx >= 1 else prices[0]
    lag2 = prices[idx - 2] if idx >= 2 else prices[0]
    lag4 = prices[idx - 4] if idx >= 4 else prices[0]
    lag8 = prices[idx - 8] if idx >= 8 else prices[0]

    # Rolling mean (last 4 weeks)
    roll4 = sum(prices[max(0, idx - 4):idx]) / max(1, min(4, idx))

    # Normalised trend index
    trend_idx = idx / NUM_WEEKS

    return [sin_week, cos_week, lag1, lag2, lag4, lag8, roll4, trend_idx]


def train_crop_model(crop: str, profile: dict) -> dict:
    """Train a Ridge regression model for price prediction and return metrics."""
    seed = sum(ord(c) for c in crop)
    prices = generate_price_series(profile, NUM_WEEKS, seed)

    X, y = [], []
    for i in range(8, NUM_WEEKS - 1):
        X.append(extract_features(prices, i))
        y.append(prices[i + 1])  # predict next week's price

    X_arr = np.array(X)
    y_arr = np.array(y)

    # Train/test split (last 52 weeks = test)
    split = len(X_arr) - 52
    X_train, X_test = X_arr[:split], X_arr[split:]
    y_train, y_test = y_arr[:split], y_arr[split:]

    pipeline = Pipeline([
        ("poly",  PolynomialFeatures(degree=2, include_bias=False)),
        ("scale", StandardScaler()),
        ("ridge", Ridge(alpha=10.0)),
    ])
    pipeline.fit(X_train, y_train)

    # Metrics on test set
    preds = pipeline.predict(X_test)
    mae = float(np.mean(np.abs(preds - y_test)))
    mape = float(np.mean(np.abs((preds - y_test) / y_test)) * 100)
    r2 = float(1 - np.sum((y_test - preds) ** 2) / np.sum((y_test - y_test.mean()) ** 2))

    print(f"  {crop:12s}  MAE={mae:7.1f}  MAPE={mape:.2f}%  R²={r2:.4f}")

    return {
        "model": pipeline,
        "prices": prices,  # keep last 8 weeks for inference
        "mae": mae,
        "mape": mape,
        "r2": r2,
    }


# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    out_dir = Path(__file__).parent / "model" / "price_models"
    out_dir.mkdir(parents=True, exist_ok=True)

    print("Training crop price prediction models...")
    print(f"{'Crop':12s}  {'MAE':>10s}  {'MAPE':>8s}  {'R²':>8s}")
    print("-" * 48)

    metadata: dict[str, dict] = {}

    for crop, profile in CROP_PROFILES.items():
        result = train_crop_model(crop, profile)

        # Save model
        model_path = out_dir / f"{crop}.pkl"
        with open(model_path, "wb") as f:
            pickle.dump(result["model"], f)

        # Save last 8 prices for seeding inference
        seed_path = out_dir / f"{crop}_seed.json"
        with open(seed_path, "w") as f:
            json.dump(result["prices"][-8:], f)

        metadata[crop] = {
            "mae": result["mae"],
            "mape": result["mape"],
            "r2": result["r2"],
            "base_price": profile["base"],
            "peak_months": profile["peak_months"],
        }

    # Save metadata
    meta_path = out_dir / "metadata.json"
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print("-" * 48)
    print(f"Models saved to: {out_dir}")
    print("Files:", [p.name for p in out_dir.iterdir()])


if __name__ == "__main__":
    main()
