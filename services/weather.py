"""Weather integration and environmental disease risk scoring."""

from typing import Dict

import requests


def _to_risk_level(score: float) -> str:
    if score < 0.4:
        return "Low"
    if score < 0.7:
        return "Moderate"
    return "High"


def _calculate_score(disease_confidence: float, humidity: float, rain_probability: float, temperature: float) -> float:
    """Score 0-1 where disease_confidence=0 means healthy/unknown.

    Components:
      - Disease confidence weight  (0 – 0.55)
      - Humidity factor             (0 – 0.20)
      - Rain probability factor     (0 – 0.15)
      - Temperature factor          (0 – 0.10)
    """
    disease_factor = max(0.0, min(1.0, float(disease_confidence))) * 0.55

    humidity_factor = 0.0
    if humidity > 80:
        humidity_factor = 0.20
    elif humidity > 60:
        humidity_factor = 0.10

    rain_factor = 0.0
    if rain_probability > 60:
        rain_factor = 0.15
    elif rain_probability > 30:
        rain_factor = 0.07

    # Temperatures in the 18-27°C sweet spot favour fungal/bacterial growth
    temp_factor = 0.10 if 18 <= temperature <= 27 else 0.0

    return min(disease_factor + humidity_factor + rain_factor + temp_factor, 1.0)


def get_environment_risk(
    api_key: str,
    base_url: str,
    latitude: float | None,
    longitude: float | None,
    base_confidence: float,
) -> Dict[str, float | str]:
    if not api_key or latitude is None or longitude is None:
        score = _calculate_score(base_confidence, 0.0, 0.0, 20.0)
        return {
            "risk_score": round(score, 3),
            "risk_level": _to_risk_level(score),
            "humidity": None,
            "temperature": None,
            "rain_probability": None,
        }

    weather_url = f"{base_url}/weather"
    forecast_url = f"{base_url}/forecast"

    weather_res = requests.get(
        weather_url,
        params={"lat": latitude, "lon": longitude, "appid": api_key, "units": "metric"},
        timeout=15,
    )
    weather_res.raise_for_status()
    weather_data = weather_res.json()

    forecast_res = requests.get(
        forecast_url,
        params={"lat": latitude, "lon": longitude, "appid": api_key, "units": "metric"},
        timeout=15,
    )
    forecast_res.raise_for_status()
    forecast_data = forecast_res.json()

    humidity = float(weather_data.get("main", {}).get("humidity", 0.0))
    temperature = float(weather_data.get("main", {}).get("temp", 0.0))

    pops = [float(item.get("pop", 0.0)) * 100 for item in forecast_data.get("list", [])[:4]]
    rain_probability = sum(pops) / len(pops) if pops else 0.0

    score = _calculate_score(base_confidence, humidity, rain_probability, temperature)

    return {
        "risk_score": round(score, 3),
        "risk_level": _to_risk_level(score),
        "humidity": round(humidity, 2),
        "temperature": round(temperature, 2),
        "rain_probability": round(rain_probability, 2),
    }
