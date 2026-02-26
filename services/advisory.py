"""Rule-based advisory engine."""

from typing import Dict, List


def _is_healthy(disease: str) -> bool:
    return disease.strip().lower() in ("healthy", "none", "normal", "no disease")


def _healthy_advisory(
    plant: str,
    risk_level: str,
    chemical_analysis: Dict[str, list],
    soil_type: str,
    watering_frequency: str,
) -> Dict[str, str | List[str]]:
    """Return a prevention-focused advisory when no disease is detected."""
    summary_parts = [
        f"No disease detected on this {plant} leaf.",
        "Your crop appears healthy. Continue current care practices.",
    ]

    causes = [
        "No active disease was identified at this time.",
        "Regular monitoring helps catch early signs before they escalate.",
    ]

    actions = [
        "Continue regular monitoring — scan leaves every 5-7 days.",
        "Maintain balanced fertilisation to keep plants resilient.",
        "Rotate crops each season to break pathogen cycles.",
        "Remove any yellowing or damaged leaves as a preventive measure.",
    ]

    if risk_level.lower() == "high":
        summary_parts.append("Current weather conditions favour disease development — stay vigilant.")
        actions.append("Apply a preventive copper or neem-based spray under high-humidity conditions.")
    elif risk_level.lower() == "moderate":
        causes.append("Moderate weather risk — watch for early symptoms over the next few days.")

    soil = (soil_type or "").strip().lower()
    water = (watering_frequency or "").strip().lower()
    if "clay" in soil and any(t in water for t in ["daily", "7", "6", "5", "high"]):
        actions.append("Clay soil retains moisture — consider reducing watering frequency slightly to avoid waterlogging.")

    chemicals_to_avoid = chemical_analysis.get("chemicals_to_avoid", [])
    alternatives = chemical_analysis.get("alternatives", [])
    if chemicals_to_avoid:
        summary_parts.append("Some chemicals in use may be harmful over time — consider the safer alternatives listed below.")

    return {
        "summary": " ".join(summary_parts),
        "causes": " ".join(causes),
        "actions": " ".join(actions),
        "chemicals_to_avoid": chemicals_to_avoid,
        "alternatives": alternatives,
    }


def generate_advisory(
    disease: str,
    plant: str = "Plant",
    confidence: float = 0.0,
    severity: str = "None",
    risk_level: str = "Low",
    chemical_analysis: Dict[str, list] = None,
    soil_type: str = "",
    watering_frequency: str = "",
) -> Dict[str, str | List[str]]:
    chemical_analysis = chemical_analysis or {}

    if _is_healthy(disease):
        return _healthy_advisory(plant, risk_level, chemical_analysis, soil_type, watering_frequency)

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
        actions.append("Consult a local agronomist or nursery immediately for field-level treatment.")
    elif severity.lower() == "moderate":
        actions.append("Apply targeted treatment within 48 hours to prevent further spread.")

    if risk_level.lower() == "high":
        summary_parts.append("Disease spread risk is elevated under current weather conditions.")
        causes.append("High humidity and rain can accelerate spread of fungal or bacterial infections.")
        actions.append("Improve airflow through canopy and avoid overhead irrigation.")

    soil = (soil_type or "").strip().lower()
    water = (watering_frequency or "").strip().lower()
    if "clay" in soil and any(t in water for t in ["daily", "7", "6", "5", "high"]):
        causes.append("Clay soil with frequent watering retains excess moisture near roots, promoting disease.")
        actions.append("Reduce watering frequency and ensure proper field drainage.")

    chemicals_to_avoid = chemical_analysis.get("chemicals_to_avoid", [])
    alternatives = chemical_analysis.get("alternatives", [])

    if chemicals_to_avoid:
        summary_parts.append("Some previously used chemicals may harm beneficial organisms.")

    return {
        "summary": " ".join(summary_parts),
        "causes": " ".join(causes),
        "actions": " ".join(actions),
        "chemicals_to_avoid": chemicals_to_avoid,
        "alternatives": alternatives,
    }
