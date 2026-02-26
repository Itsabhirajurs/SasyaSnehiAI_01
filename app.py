"""Flask application for Sashyasnehi AI crop advisory MVP."""

from __future__ import annotations

import json
import uuid
import xml.etree.ElementTree as ET
from pathlib import Path

from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from markupsafe import Markup, escape

from config import Config
from model.model_loader import DiseaseModelService
from services.advisory import generate_advisory
from services.chemical_safety import ChemicalSafetyService
from services.geocoding import reverse_geocode, get_nearby_shops
from services.govt_schemes import get_schemes
from services.llm_service import LLMService
from services.market_price import get_market_prices
from services.severity import estimate_severity
from services.translation import translate
from services.weather import get_environment_risk
from services.weather_forecast import get_forecast
import community_db


app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = app.config["SECRET_KEY"]

@app.template_filter('nl2br')
def nl2br_filter(value: str) -> Markup:
    return Markup(str(escape(value)).replace('\n', '<br>'))

Path(app.config["UPLOAD_FOLDER"]).mkdir(parents=True, exist_ok=True)

# Initialise community DB
community_db.init_db(app.config["COMMUNITY_DB"])

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
    is_healthy = disease_name.strip().lower() in ("healthy", "none", "normal", "no disease")

    # If plant is healthy, severity is meaningless — override to zero
    if is_healthy:
        severity = {"percentage": 0.0, "category": "None"}
    else:
        severity = estimate_severity(str(save_path))

    # Disease confidence drives the risk score — 0 for healthy predictions
    disease_confidence = 0.0 if is_healthy else confidence

    try:
        weather = get_environment_risk(
            app.config["OPENWEATHER_API_KEY"],
            app.config["OPENWEATHER_BASE_URL"],
            latitude,
            longitude,
            disease_confidence,
        )
    except Exception:
        base_score = round(min(disease_confidence * 0.55, 1.0), 3)
        _rl = "High" if base_score >= 0.7 else ("Moderate" if base_score >= 0.4 else "Low")
        weather = {
            "risk_score": base_score,
            "risk_level": _rl,
            "humidity": None,
            "temperature": None,
            "rain_probability": None,
        }

    chemical_list = _split_chemicals(chemicals_used)
    chemical_analysis = chemical_service.analyze(chemical_list)

    advisory = generate_advisory(
        disease=disease_name,
        plant=plant_name,
        confidence=confidence,
        severity=str(severity["category"]),
        risk_level=str(weather["risk_level"]),
        chemical_analysis=chemical_analysis,
        soil_type=soil_type,
        watering_frequency=watering_frequency,
    )

    llm_available = llm_service.is_available()

    # Store original English advisory in session for language switching
    session["orig_advisory"] = {
        "summary": str(advisory.get("summary", "")),
        "causes": str(advisory.get("causes", "")),
        "actions": str(advisory.get("actions", "")),
    }

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

    # ── NEW: Geocoding (address from lat/lon) ────────────────────────────────
    location_info = reverse_geocode(latitude, longitude, app.config.get("GOOGLE_MAPS_API_KEY", ""))

    # ── NEW: 7-day weather forecast with crop advice ─────────────────────────
    forecast = get_forecast(app.config["OPENWEATHER_API_KEY"], latitude, longitude, plant_name)

    # ── NEW: Govt schemes for this state ────────────────────────────────────
    schemes = get_schemes(location_info.get("state"), plant_name, app.config.get("DATA_GOV_API_KEY", ""))

    # ── NEW: Market prices ───────────────────────────────────────────────────
    market = get_market_prices(plant_name, location_info.get("state"),
                               app.config.get("DATA_GOV_API_KEY", ""),
                               app.config.get("ALPHA_VANTAGE_KEY", ""))

    # ── NEW: Nearby agri shops ───────────────────────────────────────────────
    nearby_shops = get_nearby_shops(latitude, longitude, app.config.get("GOOGLE_MAPS_API_KEY", ""),
                                    f"pesticide fertilizer {plant_name} shop")

    # ── NEW: Similar community posts ────────────────────────────────────────
    similar_posts = community_db.get_similar_posts(plant_name, disease_name, limit=4)

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
        location_info=location_info,
        latitude=latitude,
        longitude=longitude,
        forecast=forecast,
        schemes=schemes,
        market=market,
        nearby_shops=nearby_shops,
        similar_posts=similar_posts,
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


# ─────────────────────────────────────────────────────────────────────────────
# COMMUNITY ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/community")
def community():
    plant_filter = request.args.get("plant", "")
    disease_filter = request.args.get("disease", "")
    state_filter = request.args.get("state", "")
    search = request.args.get("q", "")
    page = max(1, int(request.args.get("page", 1)))
    per_page = 20

    posts = community_db.get_posts(
        plant=plant_filter, disease=disease_filter,
        state=state_filter, search=search,
        limit=per_page, offset=(page - 1) * per_page
    )
    stats = community_db.get_stats()

    return render_template("community.html",
                           posts=posts, stats=stats,
                           plant_filter=plant_filter,
                           disease_filter=disease_filter,
                           state_filter=state_filter,
                           search=search, page=page)


@app.route("/community/new", methods=["GET", "POST"])
def community_new():
    if request.method == "POST":
        title = request.form.get("title", "").strip()
        body = request.form.get("body", "").strip()
        plant = request.form.get("plant", "").strip()
        disease = request.form.get("disease", "").strip()
        location = request.form.get("location", "").strip()
        state = request.form.get("state", "").strip()
        author = request.form.get("author", "Anonymous").strip() or "Anonymous"
        tags = request.form.get("tags", "").strip()

        if not title or not body:
            return render_template("community_new.html",
                                   error="Title and description are required.")

        post_id = community_db.create_post(title=title, body=body, plant=plant,
                                           disease=disease, location=location,
                                           state=state, author=author, tags=tags)
        return redirect(url_for("community_post", post_id=post_id))

    # Pre-fill from query params (when coming from result page)
    return render_template("community_new.html",
                           plant=request.args.get("plant", ""),
                           disease=request.args.get("disease", ""),
                           location=request.args.get("location", ""),
                           state=request.args.get("state", ""))


@app.route("/community/post/<int:post_id>")
def community_post(post_id: int):
    post = community_db.get_post(post_id)
    if post is None:
        return redirect(url_for("community"))
    replies = community_db.get_replies(post_id)
    similar = community_db.get_similar_posts(
        post.get("plant", ""), post.get("disease", ""), limit=4)
    return render_template("community_post.html", post=post,
                           replies=replies, similar=similar)


@app.route("/community/reply", methods=["POST"])
def community_reply():
    payload = request.get_json(silent=True) or {}
    post_id = int(payload.get("post_id", 0))
    body = str(payload.get("body", "")).strip()
    author = str(payload.get("author", "Anonymous")).strip() or "Anonymous"

    if not post_id or not body:
        return jsonify({"error": "post_id and body required"}), 400

    reply_id = community_db.add_reply(post_id, body, author)
    replies = community_db.get_replies(post_id)
    reply = next((r for r in replies if r["id"] == reply_id), None)
    return jsonify({"ok": True, "reply": reply})


@app.route("/community/vote_post", methods=["POST"])
def community_vote_post():
    payload = request.get_json(silent=True) or {}
    post_id = int(payload.get("post_id", 0))
    voter = str(payload.get("voter", request.remote_addr or "anon"))
    if not post_id:
        return jsonify({"error": "post_id required"}), 400
    result = community_db.vote_post(post_id, voter)
    return jsonify(result)


@app.route("/community/vote_reply", methods=["POST"])
def community_vote_reply():
    payload = request.get_json(silent=True) or {}
    reply_id = int(payload.get("reply_id", 0))
    voter = str(payload.get("voter", request.remote_addr or "anon"))
    if not reply_id:
        return jsonify({"error": "reply_id required"}), 400
    result = community_db.vote_reply(reply_id, voter)
    return jsonify(result)


@app.route("/community/solve", methods=["POST"])
def community_solve():
    payload = request.get_json(silent=True) or {}
    reply_id = int(payload.get("reply_id", 0))
    post_id = int(payload.get("post_id", 0))
    if reply_id and post_id:
        community_db.mark_solution(reply_id, post_id)
    return jsonify({"ok": True})


# ─────────────────────────────────────────────────────────────────────────────
# MARKET ANALYSIS ROUTE
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/market")
def market_page():
    crop = request.args.get("crop", "Tomato")
    state = request.args.get("state", "")
    market_data = get_market_prices(crop, state,
                                    app.config.get("DATA_GOV_API_KEY", ""),
                                    app.config.get("ALPHA_VANTAGE_KEY", ""))
    return render_template("market.html", market=market_data, crop=crop, state=state)


# ─────────────────────────────────────────────────────────────────────────────
# GEOCODING API (for upload page address display)
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/api/geocode")
def api_geocode():
    try:
        lat = float(request.args.get("lat", ""))
        lon = float(request.args.get("lon", ""))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid lat/lon"}), 400

    info = reverse_geocode(lat, lon, app.config.get("GOOGLE_MAPS_API_KEY", ""))
    return jsonify(info)


# ─────────────────────────────────────────────────────────────────────────────
# TRANSLATION API
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/api/translate", methods=["POST"])
def api_translate():
    payload = request.get_json(silent=True) or {}
    text = str(payload.get("text", ""))
    target = str(payload.get("target", "English"))
    if not text:
        return jsonify({"translated": ""})
    result = translate(text, target,
                       api_key=app.config.get("LIBRETRANSLATE_API_KEY", ""),
                       base_url=app.config.get("LIBRETRANSLATE_URL", ""))
    return jsonify({"translated": result})


# ─────────────────────────────────────────────────────────────────────────────
# SCHEMES API
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/api/schemes")
def api_schemes():
    state = request.args.get("state", "")
    crop = request.args.get("crop", "")
    result = get_schemes(state, crop, app.config.get("DATA_GOV_API_KEY", ""))
    return jsonify(result)


# ─────────────────────────────────────────────────────────────────────────────
# RETRANSLATE — Switch advisory language on result page
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/api/retranslate", methods=["POST"])
def api_retranslate():
    payload = request.get_json(silent=True) or {}
    target_lang = str(payload.get("language", "English"))
    orig = session.get("orig_advisory", {})
    if not orig:
        return jsonify({"error": "No session advisory found"}), 404

    if target_lang == "English":
        return jsonify(orig)

    if not llm_service.is_available():
        return jsonify(orig)

    translated = {
        "summary": llm_service.translate_text(str(orig.get("summary", "")), target_lang),
        "causes": llm_service.translate_text(str(orig.get("causes", "")), target_lang),
        "actions": llm_service.translate_text(str(orig.get("actions", "")), target_lang),
    }
    return jsonify(translated)


# ─────────────────────────────────────────────────────────────────────────────
# NEWS API — Farming news via Google News RSS
# ─────────────────────────────────────────────────────────────────────────────

_NEWS_CACHE: list[dict] = []
_NEWS_CACHE_TIME: float = 0.0

STATIC_FARMING_NEWS = [
    {"title": "PM-KISAN: 6,000 annual benefit now reaches 11 crore farmers", "source": "PIB India", "link": "https://pib.gov.in", "date": "2026-02-25"},
    {"title": "ICAR releases new high-yield drought-resistant maize variety for Rabi season", "source": "ICAR", "link": "https://icar.org.in", "date": "2026-02-24"},
    {"title": "Onion prices decline 15% at Lasalgaon APMC on improved supplies", "source": "Agri Market", "link": "https://agmarknet.gov.in", "date": "2026-02-23"},
    {"title": "Rabi wheat crop in excellent condition across Punjab and Haryana: Agriculture Ministry", "source": "Mint", "link": "https://livemint.com", "date": "2026-02-22"},
    {"title": "Organic farming area in India crosses 4.6 million hectares in 2025-26", "source": "APEDA", "link": "https://apeda.gov.in", "date": "2026-02-21"},
    {"title": "New drone spray guidelines for small farmers under SMAM scheme", "source": "Agri Tribune", "link": "#", "date": "2026-02-20"},
    {"title": "Soil health card 2.0 rollout: AI-based recommendations for 5 crore farmers", "source": "Krishi Jagran", "link": "https://krishijagran.com", "date": "2026-02-19"},
    {"title": "Government to procure 6.5 crore tonnes of wheat at MSP ₹2,425/quintal", "source": "FCI", "link": "https://fci.gov.in", "date": "2026-02-18"},
    {"title": "Tomato late blight advisory issued for Karnataka hill districts", "source": "KSDA", "link": "#", "date": "2026-02-17"},
    {"title": "Karnataka farmers get bonus ₹500/quintal for organic turmeric exports", "source": "KA Agri Dept", "link": "#", "date": "2026-02-16"},
    {"title": "Cheaper bio-fertilizers now available at 40% subsidy through NABARD", "source": "NABARD", "link": "https://nabard.org", "date": "2026-02-15"},
    {"title": "Beekeeping scheme: ₹250 crore allocated for 1 lakh bee box units for farmers", "source": "NHM", "link": "#", "date": "2026-02-14"},
    {"title": "India achieves record 341 MT food grain production in 2024-25", "source": "CACP", "link": "#", "date": "2026-02-13"},
    {"title": "New pest alert: Spodoptera frugiperda detected in maize fields of MP", "source": "ICAR-NBAII", "link": "#", "date": "2026-02-12"},
    {"title": "eNAM platform connects 1,361 mandis; ₹3 lakh crore trade recorded", "source": "eNAM", "link": "https://enam.gov.in", "date": "2026-02-11"},
]


@app.route("/api/news")
def api_news():
    import time
    global _NEWS_CACHE, _NEWS_CACHE_TIME
    # Return cache if fresh (15 minutes)
    if _NEWS_CACHE and (time.time() - _NEWS_CACHE_TIME) < 900:
        return jsonify(_NEWS_CACHE)

    # Try Google News RSS
    try:
        import requests as req
        url = ("https://news.google.com/rss/search"
               "?q=farming+agriculture+India+crop&hl=en-IN&gl=IN&ceid=IN:en")
        r = req.get(url, timeout=5, headers={"User-Agent": "Mozilla/5.0"})
        root = ET.fromstring(r.content)
        items = root.findall(".//item")[:15]
        news = []
        for item in items:
            title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "#").strip()
            pub = (item.findtext("pubDate") or "")[:16]
            source_el = item.find("{https://news.google.com/rss}source")
            src = source_el.text if source_el is not None else "Google News"
            if title:
                news.append({"title": title, "source": src, "link": link, "date": pub})
        if news:
            _NEWS_CACHE = news
            _NEWS_CACHE_TIME = time.time()
            return jsonify(news)
    except Exception:
        pass

    # Fallback: curated static list
    _NEWS_CACHE = STATIC_FARMING_NEWS
    _NEWS_CACHE_TIME = time.time()
    return jsonify(STATIC_FARMING_NEWS)


if __name__ == "__main__":
    app.run(debug=True)
