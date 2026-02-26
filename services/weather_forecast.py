"""7-day weather forecast with crop-specific advisory using OpenWeather One Call API."""

from __future__ import annotations

import math
from datetime import datetime, timezone

import requests

# Crop-specific weather advice thresholds
CROP_PROFILES: dict[str, dict] = {
    "tomato": {
        "ideal_temp": (18, 29),
        "high_humid_risk": 75,
        "spray_window": "06:00 - 10:00",
        "disease_risk_temp": (20, 25),
        "tips": {
            "hot": "High temps stress tomato — increase watering frequency.",
            "humid": "High humidity increases late blight risk — apply copper fungicide.",
            "rain": "Avoid spraying before rain — wait for dry window.",
            "ideal": "Ideal conditions — monitor weekly for early symptoms.",
        },
    },
    "potato": {
        "ideal_temp": (15, 22),
        "high_humid_risk": 80,
        "spray_window": "07:00 - 11:00",
        "disease_risk_temp": (12, 18),
        "tips": {
            "hot": "Temperatures above 25°C slow potato tuber formation.",
            "humid": "High humidity with cool nights = late blight alert. Spray Mancozeb preventively.",
            "rain": "After rain, inspect for water-soaked lesions on leaves.",
            "ideal": "Good conditions — maintain consistent soil moisture.",
        },
    },
    "pepper": {
        "ideal_temp": (20, 30),
        "high_humid_risk": 70,
        "spray_window": "06:00 - 09:00",
        "disease_risk_temp": (22, 28),
        "tips": {
            "hot": "Bell peppers can drop flowers above 32°C — shade or mist.",
            "humid": "Bacterial spot spreads fast in humidity — use copper spray.",
            "rain": "Rain can splash bacterial spores — inspect after heavy rain.",
            "ideal": "Ideal growing conditions for pepper.",
        },
    },
    "apple": {
        "ideal_temp": (12, 24),
        "high_humid_risk": 70,
        "spray_window": "07:00 - 10:00",
        "disease_risk_temp": (15, 22),
        "tips": {
            "hot": "Heat stress during fruit set can cause drop.",
            "humid": "Apple scab thrives in wet weather — apply Captan or Mancozeb.",
            "rain": "Extended wet periods — apply protectant fungicide after each rain.",
            "ideal": "Good apple growing weather.",
        },
    },
    "default": {
        "ideal_temp": (18, 30),
        "high_humid_risk": 75,
        "spray_window": "06:00 - 10:00",
        "disease_risk_temp": (20, 27),
        "tips": {
            "hot": "High temperatures can stress crops — increase irrigation.",
            "humid": "High humidity increases fungal disease risk.",
            "rain": "Wait for a dry day before spraying.",
            "ideal": "Good growing conditions.",
        },
    },
}


def _get_crop_profile(plant_name: str) -> dict:
    key = plant_name.lower().strip()
    for k in CROP_PROFILES:
        if k in key:
            return CROP_PROFILES[k]
    return CROP_PROFILES["default"]


def get_forecast(api_key: str, lat: float, lon: float, plant_name: str = "crop") -> dict:
    """
    Fetch 5-day/3-hour forecast from OpenWeather and build daily summaries
    with crop-specific spraying recommendations.
    """
    if not api_key or lat is None or lon is None:
        return _empty_forecast()

    try:
        url = "https://api.openweathermap.org/data/2.5/forecast"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": api_key,
            "units": "metric",
        }
        resp = requests.get(url, params=params, timeout=8)
        data = resp.json()

        if data.get("cod") != "200":
            return _empty_forecast()

        daily = _aggregate_daily(data["list"])
        profile = _get_crop_profile(plant_name)
        advice = _build_advice(daily, profile, plant_name)

        return {
            "available": True,
            "daily": daily[:7],               # up to 7 days
            "crop_advice": advice,
            "spray_window": profile["spray_window"],
            "plant": plant_name,
        }

    except Exception:
        return _empty_forecast()


def _aggregate_daily(forecast_list: list) -> list[dict]:
    """Collapse 3-hourly data into daily summaries."""
    days: dict[str, dict] = {}

    for item in forecast_list:
        dt = datetime.fromtimestamp(item["dt"], tz=timezone.utc)
        day_key = dt.strftime("%Y-%m-%d")

        if day_key not in days:
            days[day_key] = {
                "date": day_key,
                "day_name": dt.strftime("%A"),
                "short_date": dt.strftime("%d %b"),
                "temps": [],
                "humidities": [],
                "rain": 0.0,
                "descriptions": [],
                "icons": [],
                "wind_speeds": [],
            }

        d = days[day_key]
        d["temps"].append(item["main"]["temp"])
        d["humidities"].append(item["main"]["humidity"])
        d["rain"] += item.get("rain", {}).get("3h", 0.0)
        d["descriptions"].append(item["weather"][0]["description"])
        d["icons"].append(item["weather"][0]["icon"])
        d["wind_speeds"].append(item["wind"]["speed"])

    result = []
    for day_key, d in sorted(days.items()):
        from collections import Counter
        most_common_icon = Counter(d["icons"]).most_common(1)[0][0]
        most_common_desc = Counter(d["descriptions"]).most_common(1)[0][0].capitalize()
        result.append({
            "date": d["date"],
            "day_name": d["day_name"],
            "short_date": d["short_date"],
            "temp_max": round(max(d["temps"]), 1),
            "temp_min": round(min(d["temps"]), 1),
            "humidity": round(sum(d["humidities"]) / len(d["humidities"])),
            "rain_mm": round(d["rain"], 1),
            "description": most_common_desc,
            "icon": f"https://openweathermap.org/img/wn/{most_common_icon}@2x.png",
            "wind_kmh": round((sum(d["wind_speeds"]) / len(d["wind_speeds"])) * 3.6, 1),
        })

    return result


def _build_advice(daily: list[dict], profile: dict, plant_name: str) -> list[dict]:
    """Generate day-by-day crop advice."""
    advice = []
    t_min, t_max = profile["ideal_temp"]
    humid_thresh = profile["high_humid_risk"]
    tips = profile["tips"]
    spray_ok_days = []

    for day in daily[:7]:
        day_tips = []
        spray_ok = True
        risk_level = "Low"

        # Temperature check
        avg_temp = (day["temp_max"] + day["temp_min"]) / 2
        if avg_temp > t_max + 3:
            day_tips.append(tips["hot"])
            risk_level = "Moderate"
        elif t_min <= avg_temp <= t_max:
            day_tips.append(tips["ideal"])
        
        # Rain check
        if day["rain_mm"] > 5:
            day_tips.append(tips["rain"])
            spray_ok = False
            if risk_level == "Low":
                risk_level = "Moderate"

        # Humidity check
        if day["humidity"] > humid_thresh:
            day_tips.append(tips["humid"])
            risk_level = "High"

        # Wind check
        if day["wind_kmh"] > 25:
            day_tips.append("High winds — avoid aerial spraying today.")
            spray_ok = False

        if spray_ok:
            spray_ok_days.append(day["day_name"])

        advice.append({
            "date": day["date"],
            "day_name": day["day_name"],
            "short_date": day["short_date"],
            "tips": day_tips or ["Continue routine care."],
            "spray_ok": spray_ok,
            "risk_level": risk_level,
            "spray_time": profile["spray_window"] if spray_ok else None,
        })

    return advice


def _empty_forecast() -> dict:
    return {
        "available": False,
        "daily": [],
        "crop_advice": [],
        "spray_window": "06:00 - 10:00",
        "plant": "crop",
    }
