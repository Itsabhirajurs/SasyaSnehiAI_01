"""
Generate a minimal synthetic dataset for fast local training.

Creates patterned images per disease class with distinct visual signatures
so train_model.py can run immediately without any download.
Plant types (tomato vs potato) are given clearly different base hues.
Replace with real PlantVillage images for production-grade accuracy.
"""
from __future__ import annotations
import argparse
import random
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

CLASSES = [
    "Tomato___Late_blight",
    "Tomato___Early_blight",
    "Potato___Late_blight",
    "Potato___Early_blight",
    "Pepper,_bell___Bacterial_spot",
    "Tomato___healthy",
]

# Plant base hues — kept far apart so the model can learn plant identity
# Tomato: warm yellow-green (high R, high G, low B)
# Potato: cool blue-green (low R, medium G, high B)
# Pepper: vivid green (low R, high G, low B)
PLANT_BASE = {
    "Tomato":  (110, 145, 40),   # warm yellow-green
    "Potato":  (45,  110, 130),  # cool blue-green
    "Pepper":  (30,  160, 60),   # vivid medium green
}

# Disease modifiers applied on top of plant base
# (delta_r, delta_g, delta_b, spot_color, spot_radius_range, spot_count)
DISEASE_MOD = {
    "Late_blight":       (-30, -40, -10, (40, 20, 10),    (4, 12), 35),
    "Early_blight":      (+20, -10, -30, (130, 80, 10),   (3,  8), 25),
    "Bacterial_spot":    (-10, +20, -20, (20, 80, 20),    (2,  5), 50),
    "healthy":           (  0,  +5,   0, None,            (0,  0),  0),
}


def make_image(plant: str, disease_key: str, size: int = 224) -> Image.Image:
    rng = np.random.default_rng()
    base_r, base_g, base_b = PLANT_BASE[plant]
    dr, dg, db, spot_color, (smin, smax), n_spots = DISEASE_MOD[disease_key]

    # Background: plant color + disease shift + fine noise
    noise = rng.integers(-18, 18, (size, size, 3), dtype=np.int16)
    base = np.array([base_r + dr, base_g + dg, base_b + db], dtype=np.int16)
    arr = np.clip(base + noise, 0, 255).astype(np.uint8)
    img = Image.fromarray(arr, mode="RGB")

    # Draw disease spots / rings for texture
    if spot_color and n_spots > 0:
        draw = ImageDraw.Draw(img)
        for _ in range(n_spots):
            x = random.randint(0, size - 1)
            y = random.randint(0, size - 1)
            r = random.randint(smin, smax)
            sc = tuple(
                max(0, min(255, spot_color[i] + random.randint(-15, 15)))
                for i in range(3)
            )
            if disease_key == "Early_blight":
                # Concentric rings
                draw.ellipse([x - r, y - r, x + r, y + r], outline=sc, width=2)
                if r > 4:
                    draw.ellipse([x - r + 3, y - r + 3, x + r - 3, y + r - 3],
                                 outline=sc, width=1)
            else:
                draw.ellipse([x - r, y - r, x + r, y + r], fill=sc)

    return img


def generate(output_dir: Path, images_per_class: int) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for class_name in CLASSES:
        # Parse plant and disease from class name
        if "___" in class_name:
            raw_plant, raw_disease = class_name.split("___", 1)
        else:
            raw_plant, raw_disease = class_name, "healthy"

        # Map raw plant name to key
        if "Tomato" in raw_plant:
            plant_key = "Tomato"
        elif "Potato" in raw_plant:
            plant_key = "Potato"
        else:
            plant_key = "Pepper"

        # Map disease to key
        if "Late_blight" in raw_disease:
            disease_key = "Late_blight"
        elif "Early_blight" in raw_disease:
            disease_key = "Early_blight"
        elif "Bacterial" in raw_disease:
            disease_key = "Bacterial_spot"
        else:
            disease_key = "healthy"

        class_dir = output_dir / class_name
        class_dir.mkdir(parents=True, exist_ok=True)
        for i in range(images_per_class):
            img = make_image(plant_key, disease_key)
            img.save(class_dir / f"{i:04d}.jpg", format="JPEG", quality=90)
        print(f"Generated {images_per_class} images -> {class_name}")

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
