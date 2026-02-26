"""Chemical safety lookup service."""

import json
import re
from pathlib import Path
from typing import Dict, List


class ChemicalSafetyService:
    """Loads chemical knowledge base and returns risk analysis."""

    def __init__(self, db_path: str):
        self.db_path = Path(db_path)
        self.db: Dict[str, Dict[str, str]] = {}
        self.load()

    @staticmethod
    def normalize_name(name: str) -> str:
        normalized = name.strip().lower()
        normalized = re.sub(r"[^a-z0-9\s-]", "", normalized)
        normalized = re.sub(r"\s+", " ", normalized)
        return normalized

    def load(self) -> None:
        if not self.db_path.exists():
            self.db = {}
            return
        self.db = json.loads(self.db_path.read_text(encoding="utf-8"))

    def analyze(self, chemical_names: List[str]) -> Dict[str, list]:
        findings = []
        chemicals_to_avoid: list[str] = []
        alternatives: list[str] = []

        for chemical in chemical_names:
            key = self.normalize_name(chemical)
            info = self.db.get(key)
            if not info:
                findings.append(
                    {
                        "chemical": chemical,
                        "status": "Unknown",
                        "message": "No safety profile found in local DB.",
                    }
                )
                continue

            warning = (
                f"Bee toxicity: {info.get('bee_toxicity', 'Unknown')}, "
                f"Soil impact: {info.get('soil_microbe_impact', 'Unknown')}, "
                f"Human risk: {info.get('human_health_risk', 'Unknown')}"
            )
            findings.append(
                {
                    "chemical": chemical,
                    "status": "Flagged",
                    "message": warning,
                }
            )
            chemicals_to_avoid.append(chemical)
            if info.get("alternative"):
                alternatives.append(info["alternative"])

        return {
            "findings": findings,
            "chemicals_to_avoid": sorted(set(chemicals_to_avoid)),
            "alternatives": sorted(set(alternatives)),
        }
