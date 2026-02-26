"""Prepare a fast-train PlantVillage subset from source zip.

This avoids TFDS extraction path-length issues on Windows by downloading
the PlantVillage zip once and exporting only selected classes into
class-wise folders compatible with `train_model.py`.
"""

from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path
import zipfile

import requests


PLANT_VILLAGE_URL = "https://data.mendeley.com/public-files/datasets/tywbtsjrjv/files/d5652a28-c1d8-4b76-97f3-72fb80f94efc/file_downloaded"


DEFAULT_CLASSES = [
    "Tomato___Late_blight",
    "Tomato___Early_blight",
    "Potato___Late_blight",
    "Potato___Early_blight",
    "Pepper,_bell___Bacterial_spot",
    "Tomato___healthy",
]


def _download_zip(url: str, zip_path: Path) -> None:
    if zip_path.exists() and zip_path.stat().st_size > 0:
        print(f"Using cached zip: {zip_path}")
        return

    zip_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"Downloading PlantVillage zip to: {zip_path}")
    with requests.get(url, stream=True, timeout=120) as response:
        response.raise_for_status()
        with open(zip_path, "wb") as file_handle:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    file_handle.write(chunk)


def export_subset(output_dir: Path, classes: list[str], max_per_class: int, zip_path: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    class_set = set(classes)
    counts: Counter[str] = Counter()
    discovered_classes: set[str] = set()

    with zipfile.ZipFile(zip_path, "r") as archive:
        for info in archive.infolist():
            if info.is_dir():
                continue

            path_parts = Path(info.filename).parts
            if len(path_parts) < 3:
                continue

            class_name = path_parts[-2]
            discovered_classes.add(class_name)

            if class_name not in class_set:
                continue
            if counts[class_name] >= max_per_class:
                continue

            class_dir = output_dir / class_name
            class_dir.mkdir(parents=True, exist_ok=True)

            extension = Path(info.filename).suffix.lower() or ".jpg"
            out_file = class_dir / f"{counts[class_name]:05d}{extension}"

            with archive.open(info, "r") as src, open(out_file, "wb") as dst:
                dst.write(src.read())

            counts[class_name] += 1

            if all(counts[name] >= max_per_class for name in classes):
                break

    missing = [name for name in classes if name not in discovered_classes]
    if missing:
        raise ValueError(
            "Some requested classes were not found in downloaded zip: " + ", ".join(missing)
        )

    print("Dataset export complete.")
    for class_name in classes:
        print(f"{class_name}: {counts[class_name]} images")


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare PlantVillage subset for fast training")
    parser.add_argument("--output_dir", default="dataset/plantvillage_subset", help="Output dataset folder")
    parser.add_argument("--max_per_class", type=int, default=600, help="Max images per class")
    parser.add_argument(
        "--classes",
        nargs="*",
        default=DEFAULT_CLASSES,
        help="PlantVillage class folder names to export",
    )
    parser.add_argument(
        "--zip_cache",
        default="C:/pv_cache/plant_village.zip",
        help="Local cache path for downloaded PlantVillage zip",
    )
    args = parser.parse_args()

    zip_path = Path(args.zip_cache)
    _download_zip(PLANT_VILLAGE_URL, zip_path)

    export_subset(
        output_dir=Path(args.output_dir),
        classes=args.classes,
        max_per_class=args.max_per_class,
        zip_path=zip_path,
    )


if __name__ == "__main__":
    main()
