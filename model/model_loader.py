"""Load and run disease model predictions."""

import json
from pathlib import Path
from typing import Dict

import numpy as np
import tensorflow as tf
from PIL import Image


class DiseaseModelService:
    """Model service that loads once and serves predictions."""

    def __init__(self, model_path: str, class_map_path: str):
        self.model_path = Path(model_path)
        self.class_map_path = Path(class_map_path)
        self.model: tf.keras.Model | None = None
        self.class_names: list[str] = []

    def load(self) -> None:
        if self.model is not None:
            return
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
        if not self.class_map_path.exists():
            raise FileNotFoundError(f"Class map not found: {self.class_map_path}")

        self.model = tf.keras.models.load_model(self.model_path)
        self.class_names = json.loads(self.class_map_path.read_text(encoding="utf-8"))

    @staticmethod
    def preprocess(image_path: str) -> np.ndarray:
        image = Image.open(image_path).convert("RGB").resize((224, 224))
        arr = np.array(image, dtype=np.float32)
        arr = np.expand_dims(arr, axis=0)
        return tf.keras.applications.mobilenet_v2.preprocess_input(arr)

    def predict(self, image_path: str) -> Dict[str, float | str]:
        self.load()
        assert self.model is not None

        batch = self.preprocess(image_path)
        probs = self.model.predict(batch, verbose=0)[0]

        idx = int(np.argmax(probs))
        confidence = float(probs[idx])
        label = self.class_names[idx] if idx < len(self.class_names) else "Unknown"

        return {
            "label": label,
            "confidence": confidence,
        }
