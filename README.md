# Sashyasnehi AI

An end-to-end crop disease advisory web app I built as a personal portfolio project.
It helps farmers detect crop disease from leaf images and gives practical, localized next steps (risk, causes, actions, and weather-aware advice).

## Why I Built This
I wanted to build one complete AI product, not just a model notebook. This project combines ML, backend APIs, UI/UX, and multilingual support in one workflow that feels useful in real farming scenarios.

## Demo / Screenshot
- Live demo: Add your deployed URL here
- Screenshots: Add project images in a `docs/` folder and link them here

Example:
`![Result Screen](docs/result-screen.png)`

## Tech Stack
- Backend: Flask, Python
- ML: TensorFlow, MobileNetV2 transfer learning
- Data/Logic: OpenWeather API, rule-based advisory, chemical safety lookup
- Frontend: HTML, CSS, JavaScript (multilingual UI + dynamic translation)
- Optional AI Layer: Gemini API for translation/chat enhancement

## How to Run

1. Clone the repo

```bash
git clone <your-repo-url>
cd SashyasnehiAI
```

2. Install dependencies

```bash
python -m pip install -r requirements.txt
```

3. Configure environment

Create `.env` from `.env.example` and set keys:

```env
SECRET_KEY=change-this
OPENWEATHER_API_KEY=your_openweather_key
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=models/gemini-2.0-flash
MODEL_PATH=model/disease_model.keras
CLASS_MAP_PATH=model/class_names.json
```

4. (Optional) Prepare dataset and train model

```bash
python prepare_dataset.py --output_dir dataset/plantvillage_subset --max_per_class 600
python train_model.py --data_dir dataset/plantvillage_subset --epochs 8
```

5. Run the app

```bash
python app.py
```

Open: `http://127.0.0.1:5001`

## Deploy on Render

This repo is now Render-ready with `render.yaml`.

1. Push your latest code to GitHub
2. In Render: New + -> Blueprint
3. Select this repository
4. Render will read `render.yaml` and create the web service automatically
5. Add missing secret env values in Render dashboard (if not already set)

Required env vars for full features:
- `SECRET_KEY`
- `OPENWEATHER_API_KEY`
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Notes:
- App starts with: `gunicorn app:app --workers 1 --threads 4 --timeout 180`
- If model files are missing, the app still boots but disease prediction features will be limited
- Free instances can cold-start; first request may take a few seconds

## Dataset / Source
- PlantVillage (public plant disease dataset)
- Weather context from OpenWeather API
- Market and advisory enrichment from project-side rule logic and integrated services

## Key Results / Findings
- Built a full ML-to-web pipeline: upload image -> model prediction -> severity -> risk -> actionable advisory
- Added multilingual result handling (English, Hindi, Kannada) with runtime language switching
- Added recent analysis snapshot + improved usability around result recall
- Improved translation quality control to avoid mixed-language or repetitive broken outputs

## Future Work
- Add user-specific advisory memory across seasons (farm timeline)
- Expand crop/disease coverage with more classes and regional datasets
- Add model confidence calibration and uncertainty warnings
- Add deployment with CI/CD + automated regression tests for translation and UI

## Portfolio Note
This is my personal project (not a hackathon build). I am actively improving it to reflect my end-to-end engineering approach: practical AI, usable product design, and continuous iteration from real feedback.
