"""Rule-based advisory engine."""

from typing import Dict, List


def generate_advisory(
    disease: str,
    confidence: float,
    severity: str,
    risk_level: str,
    chemical_analysis: Dict[str, list],
    soil_type: str,
    watering_frequency: str,
) -> Dict[str, str | List[str]]:
    summary_parts = [
        f"Detected disease: {disease} (confidence: {confidence * 100:.1f}%).",
        f"Severity is {severity}.",
        f"Environmental risk is {risk_level}.",
    ]

    causes = [
        "Pathogen pressure likely increased by current field and weather conditions.",
        "Disease progression may accelerate if leaf wetness remains high.",
    ]

    actions = [
        "Isolate heavily affected leaves and dispose away from field.",
        "Maintain morning irrigation and avoid wet foliage overnight.",
        "Track symptoms daily and repeat photo checks every 2-3 days.",
    ]

    if severity.lower() == "severe":
        summary_parts.append("Urgency is high. Immediate intervention is recommended.")
        actions.append("Consult a local agronomist/nursery immediately for field-level treatment.")

    if risk_level.lower() == "high":
        summary_parts.append("Disease spread risk is high under current weather conditions.")
        causes.append("High humidity/rain can promote rapid spread of fungal or bacterial infection.")
        actions.append("Improve airflow and reduce canopy moisture where possible.")

    soil = (soil_type or "").strip().lower()
    water = (watering_frequency or "").strip().lower()
    if "clay" in soil and any(token in water for token in ["daily", "7", "6", "5", "high"]):
        causes.append("Clay soil with frequent watering can retain excess moisture near roots.")
        actions.append("Reduce watering frequency and ensure proper drainage to prevent root stress.")

    chemicals_to_avoid = chemical_analysis.get("chemicals_to_avoid", [])
    alternatives = chemical_analysis.get("alternatives", [])

    if chemicals_to_avoid:
        summary_parts.append("Some previously used chemicals may be harmful to beneficial organisms.")

    return {
        "summary": " ".join(summary_parts),
        "causes": " ".join(causes),
        "actions": " ".join(actions),
        "chemicals_to_avoid": chemicals_to_avoid,
        "alternatives": alternatives,
    }
