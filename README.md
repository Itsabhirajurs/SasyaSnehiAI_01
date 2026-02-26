# Sashyasnehi AI – MVP Setup

This project is a Flask + TensorFlow crop advisory MVP with:
- MobileNetV2 disease classification
- HSV severity estimation
- Weather-based risk scoring (OpenWeather)
- Chemical safety lookup
- Rule-based advisory engine
- Multilingual explanation + chat (Gemini)

## 1) Install dependencies

```bash
C:/Users/91701/AppData/Local/Programs/Python/Python312/python.exe -m pip install -r requirements.txt
```

## 2) Configure API keys

Create `.env` in project root using `.env.example`:

```env
SECRET_KEY=change-this
OPENWEATHER_API_KEY=your_openweather_key
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=models/gemini-2.0-flash
MODEL_PATH=model/disease_model.keras
CLASS_MAP_PATH=model/class_names.json
```

## 3) Prepare public PlantVillage subset (free)

```bash
C:/Users/91701/AppData/Local/Programs/Python/Python312/python.exe prepare_dataset.py --output_dir dataset/plantvillage_subset --max_per_class 600 --zip_cache C:/pv_cache/plant_village.zip
```

- Default exports 6 practical classes for fast training.
- You can change classes with `--classes`.
- This script avoids TFDS extraction and is safe for Windows path-length limits.

## 4) Train the model

```bash
C:/Users/91701/AppData/Local/Programs/Python/Python312/python.exe train_model.py --data_dir dataset/plantvillage_subset --epochs 8
```

Outputs:
- `model/disease_model.keras`
- `model/class_names.json`

## 5) Run the Flask app

```bash
C:/Users/91701/AppData/Local/Programs/Python/Python312/python.exe app.py
```

Open: `http://127.0.0.1:5000`

## Notes
- If model file is missing, app still runs with warning and fallback logic.
- For multilingual responses and richer chat, `GEMINI_API_KEY` is required.
- For weather enrichment, `OPENWEATHER_API_KEY` is required.
