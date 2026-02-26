"""
Generate a minimal synthetic dataset for fast local training.

Creates solid-color + noise images per disease class so train_model.py
can run immediately without any download. Replace with real images later.
"""
from __future__ import annotations
import argparse
import random
from pathlib import Path
import numpy as np
from PIL import Image

CLASSES = [
    "Tomato___Late_blight",
    "Tomato___Early_blight",
    "Potato___Late_blight",
    "Potato___Early_blight",
    "Pepper,_bell___Bacterial_spot",
    "Tomato___healthy",
]

# Distinct base colors per class so the model at least learns color statistics
BASE_COLORS = [
    (30, 80, 20),    # dark green - late blight
    (120, 90, 30),   # amber - early blight
    (60, 40, 20),    # brown - potato late blight
    (100, 70, 25),   # tan - potato early blight
    (20, 100, 40),   # medium green - bacterial spot
    (50, 160, 50),   # bright green - healthy
]


def make_image(base_color: tuple[int, int, int], size: int = 224) -> Image.Image:
    r, g, b = base_color
    noise = np.random.randint(-30, 30, (size, size, 3), dtype=np.int16)
    base = np.array([r, g, b], dtype=np.int16)
    arr = np.clip(base + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr, mode="RGB")


def generate(output_dir: Path, images_per_class: int) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for class_name, color in zip(CLASSES, BASE_COLORS):
        class_dir = output_dir / class_name
        class_dir.mkdir(parents=True, exist_ok=True)
        for i in range(images_per_class):
            img = make_image(color)
            img.save(class_dir / f"{i:04d}.jpg", format="JPEG", quality=90)
        print(f"Generated {images_per_class} images → {class_name}")
    print(f"\nDone. Total classes: {len(CLASSES)}, images each: {images_per_class}")
    print(f"Output: {output_dir}")
    print("\nNOTE: These are synthetic placeholder images.")
    print("Replace with real PlantVillage images for production accuracy.\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output_dir", default="dataset/plantvillage_subset")
    parser.add_argument("--images_per_class", type=int, default=120)
    args = parser.parse_args()
    generate(Path(args.output_dir), args.images_per_class)


if __name__ == "__main__":
    main()
