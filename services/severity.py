"""HSV-based disease severity estimation from plant images."""

from typing import Dict

import cv2
import numpy as np


YELLOW_LOWER = np.array([15, 50, 50])
YELLOW_UPPER = np.array([35, 255, 255])

BROWN_LOWER = np.array([5, 50, 20])
BROWN_UPPER = np.array([20, 255, 200])

DARK_LOWER = np.array([0, 0, 0])
DARK_UPPER = np.array([180, 255, 60])


def _category(percentage: float) -> str:
    if percentage <= 10:
        return "Mild"
    if percentage <= 30:
        return "Moderate"
    return "Severe"


def estimate_severity(image_path: str) -> Dict[str, float | str]:
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Unable to read image for severity estimation.")

    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    yellow_mask = cv2.inRange(hsv, YELLOW_LOWER, YELLOW_UPPER)
    brown_mask = cv2.inRange(hsv, BROWN_LOWER, BROWN_UPPER)
    dark_mask = cv2.inRange(hsv, DARK_LOWER, DARK_UPPER)

    combined = cv2.bitwise_or(yellow_mask, brown_mask)
    combined = cv2.bitwise_or(combined, dark_mask)

    infected_pixels = float(np.count_nonzero(combined))
    total_pixels = float(combined.shape[0] * combined.shape[1])
    percentage = (infected_pixels / total_pixels) * 100 if total_pixels else 0.0

    return {
        "percentage": round(percentage, 2),
        "category": _category(percentage),
    }
