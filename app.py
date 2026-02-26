"""Flask application for Sashyasnehi AI crop advisory MVP."""

from __future__ import annotations

import uuid
from pathlib import Path

from flask import Flask, jsonify, redirect, render_template, request, url_for

from config import Config
from model.model_loader import DiseaseModelService
from services.advisory import generate_advisory
from services.chemical_safety import ChemicalSafetyService
from services.llm_service import LLMService
from services.severity import estimate_severity
from services.weather import get_environment_risk


app = Flask(__name__)
app.config.from_object(Config)

Path(app.config["UPLOAD_FOLDER"]).mkdir(parents=True, exist_ok=True)

model_service = DiseaseModelService(app.config["MODEL_PATH"], app.config["CLASS_MAP_PATH"])
chemical_service = ChemicalSafetyService(str(Path(__file__).parent / "data" / "chemical_db.json"))
llm_service = LLMService(app.config["GEMINI_API_KEY"], app.config["GEMINI_MODEL"])


def _split_chemicals(raw: str) -> list[str]:
    if not raw:
        return []
    parts = []
    for token in raw.replace("\n", ",").split(","):
        cleaned = token.strip()
        if cleaned:
            parts.append(cleaned)
    return parts


def _parse_label(raw_label: str) -> tuple[str, str]:
    label = raw_label or "Unknown"
    if "___" in label:
        plant, disease = label.split("___", 1)
    elif "__" in label:
        plant, disease = label.split("__", 1)
    else:
        plant, disease = "Plant", label

    return plant.replace("_", " "), disease.replace("_", " ")


def _maps_link(query: str, latitude: float | None, longitude: float | None) -> str:
    if latitude is not None and longitude is not None:
        return f"https://www.google.com/maps/search/{query}/@{latitude},{longitude},13z"
    return f"https://www.google.com/maps/search/{query}"


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/about")
def about():
    return render_template("info.html")


@app.route("/upload")
def upload():
    return render_template("upload.html", languages=app.config["SUPPORTED_LANGUAGES"])


@app.route("/analyze", methods=["POST"])
def analyze():
    image = request.files.get("image")
    if image is None or image.filename == "":
        return redirect(url_for("upload"))

    filename = f"{uuid.uuid4().hex}_{image.filename}"
    save_path = Path(app.config["UPLOAD_FOLDER"]) / filename
    image.save(save_path)

    chemicals_used = request.form.get("chemicals", "")
    soil_type = request.form.get("soil_type", "")
    watering_frequency = request.form.get("watering_frequency", "")
    tilling_info = request.form.get("tilling_info", "")
    soil_test_info = request.form.get("soil_test_info", "")
    language = request.form.get("language", app.config["DEFAULT_LANGUAGE"])

    latitude_raw = request.form.get("latitude", "").strip()
    longitude_raw = request.form.get("longitude", "").strip()
    latitude = float(latitude_raw) if latitude_raw else None
    longitude = float(longitude_raw) if longitude_raw else None

    prediction_error = None
    try:
        prediction = model_service.predict(str(save_path))
    except Exception as exc:
        prediction = {"label": "Unknown_Disease", "confidence": 0.0}
        prediction_error = (
            "Disease model unavailable or not trained yet. "
            "Run train_model.py to generate model/disease_model.keras and model/class_names.json. "
            f"Details: {exc}"
        )

    plant_name, disease_name = _parse_label(str(prediction["label"]))
    confidence = float(prediction["confidence"])

    severity = estimate_severity(str(save_path))

    try:
        weather = get_environment_risk(
            app.config["OPENWEATHER_API_KEY"],
            app.config["OPENWEATHER_BASE_URL"],
            latitude,
            longitude,
            confidence,
        )
    except Exception:
        weather = {
            "risk_score": round(confidence, 3),
            "risk_level": "Moderate" if confidence >= 0.4 else "Low",
            "humidity": None,
            "temperature": None,
            "rain_probability": None,
        }

    chemical_list = _split_chemicals(chemicals_used)
    chemical_analysis = chemical_service.analyze(chemical_list)

    advisory = generate_advisory(
        disease=disease_name,
        confidence=confidence,
        severity=str(severity["category"]),
        risk_level=str(weather["risk_level"]),
        chemical_analysis=chemical_analysis,
        soil_type=soil_type,
        watering_frequency=watering_frequency,
    )

    llm_available = llm_service.is_available()
    if language != "English" and llm_available:
        advisory["summary"] = llm_service.translate_text(str(advisory["summary"]), language)
        advisory["causes"] = llm_service.translate_text(str(advisory["causes"]), language)
        advisory["actions"] = llm_service.translate_text(str(advisory["actions"]), language)

    show_nearby = str(severity["category"]).lower() == "severe"
    nursery_link = _maps_link("plant nursery", latitude, longitude) if show_nearby else None
    consultant_link = _maps_link("agriculture consultant", latitude, longitude) if show_nearby else None

    advisory_context = {
        "plant_name": plant_name,
        "disease": disease_name,
        "confidence": confidence,
        "severity": severity,
        "weather": weather,
        "advisory": advisory,
        "soil_type": soil_type,
        "watering_frequency": watering_frequency,
        "tilling_info": tilling_info,
        "soil_test_info": soil_test_info,
        "language": language,
    }

    return render_template(
        "result.html",
        image_url=url_for("static", filename=f"uploads/{filename}"),
        plant_name=plant_name,
        disease_name=disease_name,
        confidence=round(confidence * 100, 2),
        severity=severity,
        weather=weather,
        chemical_analysis=chemical_analysis,
        advisory=advisory,
        language=language,
        nursery_link=nursery_link,
        consultant_link=consultant_link,
        advisory_context=advisory_context,
        prediction_error=prediction_error,
        llm_available=llm_available,
    )


@app.route("/chat", methods=["POST"])
def chat():
    payload = request.get_json(silent=True) or {}
    question = str(payload.get("question", "")).strip()
    context = payload.get("context", {})
    language = str(payload.get("language", "English"))
    history: list[dict] = payload.get("history", [])

    if not question:
        return jsonify({"answer": "Please ask a question."}), 400

    answer = llm_service.chat_with_history(context, question, history=history)
    if language != "English":
        answer = llm_service.translate_text(answer, language)

    return jsonify({"answer": answer})


if __name__ == "__main__":
    app.run(debug=True)
