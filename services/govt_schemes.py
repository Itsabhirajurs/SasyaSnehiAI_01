"""Govt schemes service — fetches farmer welfare schemes from data.gov.in
   filtered by state/region and relevant to the crop being analysed."""

from __future__ import annotations

import requests

DATA_GOV_BASE = "https://api.data.gov.in/resource"

# Known scheme dataset resource IDs on data.gov.in
# These are publicly listed agriculture-related datasets
SCHEME_RESOURCE_IDS = [
    "48f0bf1e-7a28-4e94-91af-e73ca56d5e68",   # PM-KISAN beneficiary data
    "9ef84268-d588-465a-a308-a864a43d0070",   # AgMarknet
]

# Statically known major central + state farmer schemes
STATIC_SCHEMES: dict[str, list[dict]] = {
    "default": [
        {
            "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
            "benefit": "Rs 6,000/year direct income support in 3 instalments",
            "eligibility": "All small and marginal farmers with cultivable land",
            "how_to_apply": "Register at pmkisan.gov.in or nearest CSC",
            "link": "https://pmkisan.gov.in",
            "category": "Income Support",
        },
        {
            "name": "PM Fasal Bima Yojana (PMFBY)",
            "benefit": "Crop insurance at very low premium (2% Kharif, 1.5% Rabi)",
            "eligibility": "All farmers growing notified crops",
            "how_to_apply": "Apply through nearest bank or insurance company before crop season",
            "link": "https://pmfby.gov.in",
            "category": "Crop Insurance",
        },
        {
            "name": "Kisan Credit Card (KCC)",
            "benefit": "Revolving credit up to Rs 3 lakh at 4% interest for crop inputs",
            "eligibility": "All farmer-owners and tenant farmers",
            "how_to_apply": "Apply at any nationalized bank branch",
            "link": "https://rbi.org.in",
            "category": "Credit & Subsidy",
        },
        {
            "name": "Soil Health Card Scheme",
            "benefit": "Free soil testing and customised fertilizer recommendations",
            "eligibility": "All farmers",
            "how_to_apply": "Visit nearest Krishi Vigyan Kendra (KVK) or agriculture office",
            "link": "https://soilhealth.dac.gov.in",
            "category": "Soil & Input",
        },
        {
            "name": "National Mission on Oilseeds and Oil Palm (NMOOP)",
            "benefit": "Seed subsidy, demonstration plots, IPM support for oilseed crops",
            "eligibility": "Farmers growing oilseeds/oil palm",
            "how_to_apply": "Contact district agriculture office",
            "link": "https://agricoop.gov.in",
            "category": "Crop-Specific",
        },
        {
            "name": "eNAM (National Agriculture Market)",
            "benefit": "Online platform to sell produce directly — better price discovery",
            "eligibility": "All farmers near enlisted mandis",
            "how_to_apply": "Register at enam.gov.in or at your local APMC",
            "link": "https://enam.gov.in",
            "category": "Market Access",
        },
    ],
    "karnataka": [
        {
            "name": "Raitha Samparka Kendra (RSK)",
            "benefit": "Single-window for all state agriculture services + subsidized inputs",
            "eligibility": "Karnataka farmers",
            "how_to_apply": "Visit nearest RSK center",
            "link": "https://raitamitra.kar.nic.in",
            "category": "State Scheme",
        },
        {
            "name": "Bhoochetana Scheme",
            "benefit": "Soil health improvement, micronutrient supply, demonstration farms",
            "eligibility": "Karnataka farmers with soil health card",
            "how_to_apply": "Through district agriculture office or Bhoochetana portal",
            "link": "https://raitamitra.kar.nic.in",
            "category": "Soil & Input",
        },
        {
            "name": "Krishi Bhagya Scheme",
            "benefit": "Farm pond, micro-irrigation, sprinkler/drip subsidy up to 90%",
            "eligibility": "Karnataka dry-land farmers",
            "how_to_apply": "Apply at district agriculture office",
            "link": "https://raitamitra.kar.nic.in",
            "category": "Irrigation",
        },
    ],
    "maharashtra": [
        {
            "name": "Nanaji Deshmukh Krishi Sanjivani Project",
            "benefit": "Climate-resilient agriculture support, crop diversification subsidy",
            "eligibility": "Drought-prone Maharashtra farmers",
            "how_to_apply": "Apply via Mahaagri portal or at district collectorate",
            "link": "https://dbt.mahapocra.gov.in",
            "category": "Climate Resilience",
        },
        {
            "name": "Atal Solar Krishi Pump Yojana",
            "benefit": "Solar powered irrigation pumps at 95% subsidy",
            "eligibility": "Maharashtra farmers without grid power",
            "how_to_apply": "Apply at MSEDCL or agriculture office",
            "link": "https://mahadiscom.in",
            "category": "Irrigation",
        },
    ],
    "andhra pradesh": [
        {
            "name": "YSR Rythu Bharosa",
            "benefit": "Rs 13,500/year per farmer family for input cost assistance",
            "eligibility": "Andhra Pradesh farmers and tenant farmers",
            "how_to_apply": "Automatic — based on land records. Verify at sachivalayam",
            "link": "https://ysrrythubharosa.ap.gov.in",
            "category": "Income Support",
        },
    ],
    "telangana": [
        {
            "name": "Rythu Bandhu Scheme",
            "benefit": "Rs 10,000/acre/year investment support",
            "eligibility": "Telangana landowning farmers",
            "how_to_apply": "Automatic via land records. Contact village secretary",
            "link": "https://rythubandhu.telangana.gov.in",
            "category": "Income Support",
        },
    ],
    "punjab": [
        {
            "name": "Punjab Kisan Karj Mafi Scheme",
            "benefit": "Farm loan waiver up to Rs 2 lakh",
            "eligibility": "Punjab small/marginal farmers",
            "how_to_apply": "Apply via Punjab government portal",
            "link": "https://punjab.gov.in",
            "category": "Credit & Subsidy",
        },
    ],
}

# Category icons
CATEGORY_ICONS = {
    "Income Support": "money",
    "Crop Insurance": "shield",
    "Credit & Subsidy": "bank",
    "Soil & Input": "leaf",
    "Irrigation": "droplet",
    "Market Access": "store",
    "State Scheme": "building",
    "Climate Resilience": "cloud-sun",
    "Crop-Specific": "seedling",
}


def get_schemes(state: str | None, crop: str | None, api_key: str) -> dict:
    """
    Return relevant farmer schemes for the given state and crop.
    Combines static DB with live data.gov.in query when API available.
    """
    state_key = (state or "").lower().strip()

    # Collect schemes: national + state-specific
    schemes = list(STATIC_SCHEMES["default"])

    for state_name, state_schemes in STATIC_SCHEMES.items():
        if state_name == "default":
            continue
        if state_key and state_name in state_key:
            schemes = state_schemes + schemes  # state schemes first

    # Add icons to each scheme
    for scheme in schemes:
        cat = scheme.get("category", "")
        scheme["icon"] = CATEGORY_ICONS.get(cat, "file-text")

    # Try to fetch additional live schemes if API available
    live_schemes = []
    if api_key:
        live_schemes = _fetch_live_schemes(state, crop, api_key)

    return {
        "available": True,
        "state": state or "All India",
        "schemes": schemes,
        "live_schemes": live_schemes,
        "total": len(schemes) + len(live_schemes),
    }


def _fetch_live_schemes(state: str | None, crop: str | None, api_key: str) -> list[dict]:
    """Attempt to fetch schemes from data.gov.in (best-effort)."""
    try:
        # Try PM-KISAN beneficiary metadata as example
        resp = requests.get(
            "https://api.data.gov.in/resource/48f0bf1e-7a28-4e94-91af-e73ca56d5e68",
            params={"api-key": api_key, "format": "json", "limit": 5},
            timeout=8,
        )
        # data.gov.in mostly returns data, not scheme info — skip for now
        return []
    except Exception:
        return []
