"""
Download real PlantVillage images via tensorflow_datasets and save as JPEGs
into dataset/plantvillage_real/<class_name>/ for the 6 classes we use.
Run once: python download_real_dataset.py
"""

import os
import json
from pathlib import Path

import numpy as np
import tensorflow as tf
import tensorflow_datasets as tfds

# The 6 classes we care about (must match class_names.json)
TARGET_CLASSES = [
    "Pepper,_bell___Bacterial_spot",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___healthy",
]

# Map from tfds label names to our folder names
# tfds uses underscores; plant_village labels look like "Pepper___bell___Bacterial_spot"
# Let's discover the mapping dynamically.

OUT_DIR = Path("dataset/plantvillage_real")
IMAGES_PER_CLASS = 500   # up to 500 real images per class

print("Loading PlantVillage dataset info (this may download ~800 MB)...")
builder = tfds.builder("plant_village", data_dir="dataset/tfds_cache")
builder.download_and_prepare()

info = builder.info
print("Label names in tfds dataset:")
label_names = info.features["label"].names
for i, n in enumerate(label_names):
    print(f"  {i:3d}: {n}")

# Build mapping: tfds label index -> our folder name
# tfds uses format like "Pepper___bell___Bacterial_spot" (3 underscores between parts)
def normalize(name: str) -> str:
    """Lowercase, drop special chars, for fuzzy matching."""
    return name.lower().replace(",", "").replace("-", "").replace(" ", "").replace("_", "")

our_normalized = {normalize(c): c for c in TARGET_CLASSES}

label_map: dict[int, str] = {}
for idx, tfds_name in enumerate(label_names):
    n = normalize(tfds_name)
    if n in our_normalized:
        label_map[idx] = our_normalized[n]
        print(f"  MATCHED: tfds[{idx}] '{tfds_name}' -> '{our_normalized[n]}'")

if len(label_map) != len(TARGET_CLASSES):
    print(f"\nWARNING: only matched {len(label_map)}/{len(TARGET_CLASSES)} classes!")
    print("Attempting partial match...")
    for idx, tfds_name in enumerate(label_names):
        for target in TARGET_CLASSES:
            if target not in label_map.values():
                # try substring match
                t_parts = [p.lower() for p in target.replace(",_", "___").split("___")]
                td_parts = [p.lower() for p in tfds_name.split("___")]
                if all(any(tp in td for td in td_parts) for tp in t_parts):
                    label_map[idx] = target
                    print(f"  PARTIAL MATCH: tfds[{idx}] '{tfds_name}' -> '{target}'")
                    break

print(f"\nFinal mapping ({len(label_map)} classes):")
for k, v in label_map.items():
    print(f"  {k} -> {v}")

# Create output dirs
for cls in label_map.values():
    (OUT_DIR / cls).mkdir(parents=True, exist_ok=True)

# Counters
counts = {v: 0 for v in label_map.values()}

print("\nExporting images...")
ds = builder.as_dataset(split="train+test" if "test" in builder.info.splits else "train", shuffle_files=True)

saved = 0
for example in ds.as_numpy_iterator():
    label_idx = int(example["label"])
    if label_idx not in label_map:
        continue
    cls = label_map[label_idx]
    if counts[cls] >= IMAGES_PER_CLASS:
        continue

    img = example["image"]  # numpy uint8 H x W x 3
    img_tensor = tf.image.encode_jpeg(img, quality=95)
    out_path = OUT_DIR / cls / f"{cls}_{counts[cls]:04d}.jpg"
    tf.io.write_file(str(out_path), img_tensor)
    counts[cls] += 1
    saved += 1

    if saved % 100 == 0:
        print(f"  Saved {saved} images so far: {counts}")

    # Stop if all classes filled
    if all(v >= IMAGES_PER_CLASS for v in counts.values()):
        break

print("\nDone! Final counts:")
for cls, cnt in counts.items():
    print(f"  {cls}: {cnt} images")
print(f"\nDataset saved to: {OUT_DIR.resolve()}")
print("\nNow run:")
print(f"  python train_model.py --data_dir {OUT_DIR} --epochs 10 --batch_size 32")
