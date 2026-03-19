# ══════════════════════════════════════════════════════
# IMPORTS
# ══════════════════════════════════════════════════════
import os
import pickle
import logging
import numpy as np
import shutil
from pathlib import Path
from typing import List, Dict, Any, Optional

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# ══════════════════════════════════════════════════════
# STRUCTURED LOGGING
# ══════════════════════════════════════════════════════
logging.basicConfig(
    level   = logging.INFO,
    format  = "%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt = "%Y-%m-%d %H:%M:%S"
)
log = logging.getLogger("agrishield")

# ══════════════════════════════════════════════════════
# ENV  (restrict CORS to known origins)
# ══════════════════════════════════════════════════════
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]
log.info(f"CORS allowed origins: {ALLOWED_ORIGINS}")

# Prefer project-root `models/`, but keep fallbacks for backward compatibility
PROJECT_ROOT = Path(__file__).resolve().parent.parent
FALLBACKS = [
    PROJECT_ROOT / "models",                  # project-root models (preferred)
    Path(__file__).parent / "modelsbackend", # older location used during edits
    Path(__file__).parent / "models",        # legacy backend/models
]

# Find first fallback that contains all required artifacts (checked below)
MODELS_DIR = None

# ══════════════════════════════════════════════════════
# SCHEMAS
# ══════════════════════════════════════════════════════
class CropInput(BaseModel):
    N:           float = Field(..., ge=0,   le=200,  description="Nitrogen (kg/ha)")
    P:           float = Field(..., ge=0,   le=200,  description="Phosphorus (kg/ha)")
    K:           float = Field(..., ge=0,   le=200,  description="Potassium (kg/ha)")
    ph:          float = Field(..., ge=0,   le=14,   description="Soil pH")
    temperature: float = Field(..., ge=-10, le=60,   description="Temperature (°C)")
    humidity:    float = Field(..., ge=0,   le=100,  description="Relative humidity (%)")
    rainfall:    float = Field(..., ge=0,   le=500,  description="Seasonal/monthly rainfall (mm)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "N": 90, "P": 42, "K": 43, "ph": 6.5,
                "temperature": 28.0, "humidity": 65.0, "rainfall": 120.0
            }
        }
    }

class AlternativeCrop(BaseModel):
    crop:       str
    confidence: float

class CropOutput(BaseModel):
    recommended_crop: str
    confidence:       float
    confidence_label: str
    low_confidence:   bool
    alternatives:     List[AlternativeCrop]
    inputs_used:      Dict[str, Any]
    warnings:         List[str]

# ══════════════════════════════════════════════════════
# GLOBAL STATE  (populated at import time)
# ══════════════════════════════════════════════════════
model          = None
label_encoder  = None
FEATURE_ORDER  = None   # full list incl. engineered features
FEATURES_BASE  = None   # base feature names from raw input
feature_ranges = None
clip_bounds    = None   # NEW FIX #1 – clip-then-warn instead of reject
metadata       = None

# ══════════════════════════════════════════════════════
# MODEL LOADING AT IMPORT TIME
# ══════════════════════════════════════════════════════
def _load_models():
    global model, label_encoder, FEATURE_ORDER, FEATURES_BASE, \
           feature_ranges, clip_bounds, metadata

    required = [
        "calibrated_model.pkl",    # NEW FIX #5 – API loads calibrated wrapper, not raw XGBoost
        "label_encoder.pkl",
        "feature_columns.pkl",
        "feature_ranges.pkl",
        "clip_bounds.pkl",
        "model_metadata.pkl",
    ]
    # locate a models directory that contains all required artifacts
    global MODELS_DIR
    for candidate in FALLBACKS:
        if all((candidate / fname).exists() for fname in required):
            MODELS_DIR = candidate
            break

    if MODELS_DIR is None:
        # build helpful diagnostics
        diagnostics = []
        for candidate in FALLBACKS:
            missing = [fname for fname in required if not (candidate / fname).exists()]
            diagnostics.append(f"{candidate}: missing {missing}")
        raise FileNotFoundError(
            "Required model artifacts not found in any known locations.\n"
            "Checked locations:\n  " + "\n  ".join(diagnostics) +
            "\n→ Run crop_rec.py and ensure artifacts are saved to the project-root models/ folder."
        )

    # If artifacts currently live in a fallback inside backend, copy them
    # into the canonical project-root models/ directory for future imports.
    canonical = PROJECT_ROOT / "models"
    canonical.mkdir(parents=True, exist_ok=True)
    if MODELS_DIR.resolve() != canonical.resolve():
        log.info(f"Copying model artifacts from {MODELS_DIR} → {canonical}")
        for fname in required:
            src = MODELS_DIR / fname
            dst = canonical / fname
            try:
                shutil.copy2(src, dst)
            except Exception as ex:
                log.warning(f"Failed to copy {src} to {dst}: {ex}")
        MODELS_DIR = canonical

    # NEW FIX #5 – Load calibrated model (CalibratedClassifierCV pickle)
    # This replaces the old XGBClassifier JSON load.
    # The calibrated model's predict_proba() returns well-calibrated probabilities.
    with open(MODELS_DIR / "calibrated_model.pkl", "rb") as f:
        model = pickle.load(f)
    log.info("✅ Calibrated model loaded from calibrated_model.pkl  [NEW FIX #5]")

    with open(MODELS_DIR / "label_encoder.pkl",   "rb") as f:
        label_encoder = pickle.load(f)
    with open(MODELS_DIR / "feature_columns.pkl", "rb") as f:
        FEATURE_ORDER = pickle.load(f)
    with open(MODELS_DIR / "feature_ranges.pkl",  "rb") as f:
        feature_ranges = pickle.load(f)
    with open(MODELS_DIR / "clip_bounds.pkl",     "rb") as f:
        cb_data = pickle.load(f)
        clip_bounds   = cb_data["bounds"]
        FEATURES_BASE = cb_data["columns"]
    with open(MODELS_DIR / "model_metadata.pkl",  "rb") as f:
        metadata = pickle.load(f)

    log.info(f"✅ Label encoder: {len(label_encoder.classes_)} classes")
    log.info(f"✅ Feature order : {FEATURE_ORDER}")
    log.info(f"✅ Confidence threshold : {metadata['confidence_threshold']}")
    log.info(f"✅ Calibration method   : {metadata.get('calibration_method', 'sigmoid')}")
    log.info(f"✅ Val log-loss (cal)   : {metadata.get('val_log_loss_cal', 'n/a')}")
    log.info(f"✅ Log-transformed      : {metadata.get('log_transformed_cols', [])}")

try:
    _load_models()
except Exception as e:
    log.error(f"❌ CRITICAL: Failed to load models at import time: {e}")
    raise

# ══════════════════════════════════════════════════════
# CREATE ROUTER
# ══════════════════════════════════════════════════════
router = APIRouter(tags=["crops"])

# ══════════════════════════════════════════════════════
# INTERACTION FEATURE ENGINEERING
# Must mirror exactly what crop_rec.py computes during training.
# ══════════════════════════════════════════════════════
def add_interaction_features(arr: np.ndarray, base_columns: list) -> np.ndarray:
    """
    NEW FIX #2 – Adds NPK_sum, N_P_ratio, Temp_Humidity_Index.
    Applied to a (1, n_base_features) array; returns (1, n_all_features).
    """
    col_idx = {c: i for i, c in enumerate(base_columns)}
    N   = arr[:, col_idx["N"]]
    P   = arr[:, col_idx["P"]]
    K   = arr[:, col_idx["K"]]
    T   = arr[:, col_idx["temperature"]]
    H   = arr[:, col_idx["humidity"]]
    npk = (N + P + K).reshape(-1, 1)
    npr = (N / (P + 1)).reshape(-1, 1)
    thi = (T * H).reshape(-1, 1)
    return np.hstack([arr, npk, npr, thi])

# ══════════════════════════════════════════════════════
# NEW FIX #1 – INPUT PROCESSING: CLIP + WARN, NOT REJECT
# ══════════════════════════════════════════════════════
def build_and_validate_features(raw: dict) -> tuple[np.ndarray, list[str]]:
    """
    1. Build base feature array from user input (FEATURES_BASE order).
    2. Apply training clip bounds (warn user if any value was clipped, don't reject).
       → NEW FIX #1: replaces hard 422 rejection with soft clip + warning.
    3. Apply log1p to features that were log-transformed during training.
    4. Add interaction features (NPK_sum, N_P_ratio, Temp_Humidity_Index).
    5. Validate against post-transform feature_ranges (sanity check only).

    Returns (feature_array, warnings_list).
    """
    warnings   = []
    log_cols   = set(metadata.get("log_transformed_cols", []))

    # Step 1 – build base array
    base_arr = np.array([[raw[col] for col in FEATURES_BASE]], dtype=float)

    # Step 2 – apply clip bounds (warn, not reject)   [NEW FIX #1]
    for idx, (lo, hi) in clip_bounds.items():
        col   = FEATURES_BASE[idx]
        value = base_arr[0, idx]
        if value < lo:
            warnings.append(
                f"{col} = {value:.2f} is below the training range minimum "
                f"({lo:.2f}); value was clipped to maintain prediction stability."
            )
            base_arr[0, idx] = lo
        elif value > hi:
            warnings.append(
                f"{col} = {value:.2f} is above the training range maximum "
                f"({hi:.2f}); value was clipped to maintain prediction stability."
            )
            base_arr[0, idx] = hi

    # Step 3 – log1p transform (same columns as training)
    for i, col in enumerate(FEATURES_BASE):
        if col in log_cols:
            base_arr[0, i] = np.log1p(base_arr[0, i])

    # Step 4 – engineered interaction features   [NEW FIX #2]
    full_arr = add_interaction_features(base_arr, FEATURES_BASE)

    # Step 5 – optional sanity check against saved ranges (soft, warns only)
    for j, col in enumerate(FEATURE_ORDER):
        rng = feature_ranges[col]
        val = full_arr[0, j]
        if val < rng["min"] - 1e-6 or val > rng["max"] + 1e-6:
            warnings.append(
                f"[sanity] Post-transform value for '{col}' ({val:.4f}) "
                f"is outside training range [{rng['min']:.4f} – {rng['max']:.4f}]. "
                f"Prediction may be less reliable."
            )

    return full_arr, warnings

# ══════════════════════════════════════════════════════
# NEW FIX #4 – CONFIDENCE LABEL HELPER
# Threshold lowered to 0.40 (from 0.50) in metadata.
# ══════════════════════════════════════════════════════
def confidence_label(conf: float) -> str:
    if conf >= 0.85: return "High confidence – excellent match"
    if conf >= 0.60: return "Moderate confidence – consider alternatives too"
    if conf >= 0.40: return "Low confidence – review soil & weather conditions"
    return "Very low confidence – consult a local agronomist"

# ══════════════════════════════════════════════════════
# ENDPOINTS
# ══════════════════════════════════════════════════════
@router.get("/", summary="Health Check")
def root():
    return {
        "status":  "running",
        "message": "AgriShield Crop Recommendation API 🌾",
        "version": "7.0.0",
        "mode":    "manual_inputs",
        "fixes": {
            "original": [
                "feature_columns", "cors_restricted", "startup_loading",
                "feature_range_validation", "rainfall_note",
                "structured_logging", "confidence_threshold",
                "xgboost_native_json"
            ],
            "round_1": [
                "no_leakage_split_first", "clip_warn_not_reject",
                "interaction_features_NPK_THI", "cv_on_train_only",
                "threshold_lowered_to_0.40",
            ],
            "round_2": [
                "calibrated_probabilities", "f1_macro_tuning_scoring",
                "validation_log_loss_check", "feature_length_safety_check",
                "no_premature_rounding",
            ],
            "round_3": [
                "calibration_after_eval_not_before",    # metrics now honest
                "sigmoid_not_isotonic",                  # stable on small val set
                "removed_dead_X_full_code",              # cleanup
                "cv_scoring_f1_macro_consistent",        # key + scoring aligned
                "metadata_confidence_threshold_hard_access",  # fail loudly
            ]
        },
        "docs": "/docs"
    }


@router.post("/predict", response_model=CropOutput, summary="Predict Best Crop (Top-3)")
async def predict(data: CropInput):
    """
    Full prediction pipeline (manual inputs):
    1. Accept temperature, humidity, and rainfall directly from the user.
    2. Clip out-of-range values and warn (NEW FIX #1 – no longer hard-rejects).
    3. Apply log1p to features that were log-transformed during training.
    4. Add interaction features: NPK_sum, N_P_ratio, Temp_Humidity_Index (NEW FIX #2).
    5. Build feature vector in training order from feature_columns.pkl.
    6. Run XGBoost predict_proba → return Top-3 crops.
    7. Add low-confidence warning if top score < threshold (0.40) (NEW FIX #4).
    """
    log.info(
        f"[PREDICT] N={data.N} P={data.P} K={data.K} ph={data.ph} "
        f"temp={data.temperature} hum={data.humidity} rain={data.rainfall}"
    )

    raw = {
        "N":           data.N,
        "P":           data.P,
        "K":           data.K,
        "temperature": data.temperature,
        "humidity":    data.humidity,
        "ph":          data.ph,
        "rainfall":    data.rainfall,
    }

    # Build features with clip-and-warn + interaction engineering
    features, proc_warnings = build_and_validate_features(raw)

    # NEW FIX #6 – Feature length safety check
    # Prevents silent shape mismatches if model was retrained with different features.
    if features.shape[1] != len(FEATURE_ORDER):
        raise HTTPException(
            status_code=500,
            detail=(
                f"Feature mismatch: model expects {len(FEATURE_ORDER)} features "
                f"but pipeline produced {features.shape[1]}. "
                f"Re-run crop_rec.py and redeploy the API."
            )
        )

    # Predict Top-3 using calibrated probabilities
    proba    = model.predict_proba(features)[0]
    top3_idx = np.argsort(proba)[::-1][:3]
    top3 = [
        {
            "crop":       label_encoder.inverse_transform([i])[0],
            "confidence": float(proba[i])    # NEW FIX #7: no rounding here – round in frontend
        }
        for i in top3_idx
    ]

    best_conf = top3[0]["confidence"]
    # NEW FIX (round 3): use metadata["confidence_threshold"] directly.
    # If metadata is missing this key the model artifacts are corrupt → crash loudly.
    threshold = metadata["confidence_threshold"]
    low_conf  = best_conf < threshold

    if low_conf:
        log.warning(
            f"[LOW CONFIDENCE] top crop='{top3[0]['crop']}' "
            f"conf={best_conf:.2f} < threshold={threshold}"
        )

    # Assemble all warnings
    warnings = list(proc_warnings)   # clipping / sanity warnings from preprocessing

    if low_conf:
        warnings.append(
            f"Prediction confidence ({best_conf*100:.1f}%) is below the "
            f"{threshold*100:.0f}% threshold. Review soil and weather conditions "
            f"or consult a local agronomist."
        )

    warnings.append(
        "Tip: The training dataset uses seasonal/monthly rainfall averages (mm). "
        "For best accuracy, enter the average monthly rainfall for your growing season "
        "rather than a single-day measurement."
    )

    log.info(
        f"[RESULT] crop='{top3[0]['crop']}' conf={best_conf:.4f} "
        f"low_confidence={low_conf}  alternatives={[t['crop'] for t in top3[1:]]}"
    )

    return CropOutput(
        recommended_crop = top3[0]["crop"],
        confidence       = best_conf,
        confidence_label = confidence_label(best_conf),
        low_confidence   = low_conf,
        alternatives     = [AlternativeCrop(**c) for c in top3[1:]],
        inputs_used      = raw,
        warnings         = warnings
    )


# ══════════════════════════════════════════════════════
# REGIONAL COMPARISON ENDPOINT
# Uses 100% FREE, NO-KEY APIs:
#   1. Open-Meteo Geocoding API  → district name → lat/lon
#      https://geocoding-api.open-meteo.com/v1/search
#   2. Open-Meteo Historical Weather API → 15 years of real climate data
#      https://archive-api.open-meteo.com/v1/archive
#   3. Curated crop history map → which crops are commercially grown per state
# Zero API keys needed. Zero cost.
# ══════════════════════════════════════════════════════

# ── Curated crop history: commercially dominant crops per Indian state ──────
# Source: ICAR/Directorate of Economics & Statistics annual reports (public)
STATE_CROP_HISTORY: Dict[str, List[str]] = {
    "odisha":          ["rice","jute","maize","sugarcane","pigeonpeas","groundnut","mustard"],
    "maharashtra":     ["cotton","sugarcane","soybean","wheat","rice","grapes","orange","banana","chickpea"],
    "karnataka":       ["rice","maize","coffee","coconut","sugarcane","cotton","banana","mango","ragi"],
    "andhra pradesh":  ["rice","sugarcane","cotton","groundnut","maize","banana","chilli","tobacco"],
    "telangana":       ["rice","cotton","sugarcane","maize","chilli","groundnut","soybean"],
    "tamil nadu":      ["rice","sugarcane","cotton","coconut","banana","mango","groundnut"],
    "kerala":          ["rice","coconut","banana","coffee","pepper","cashew","rubber"],
    "uttar pradesh":   ["wheat","sugarcane","rice","potato","maize","mustard","lentil"],
    "madhya pradesh":  ["wheat","soybean","cotton","chickpea","lentil","sugarcane","maize"],
    "rajasthan":       ["wheat","bajra","mustard","chickpea","cotton","guar","mothbeans"],
    "punjab":          ["wheat","rice","maize","cotton","sugarcane","chickpea"],
    "haryana":         ["wheat","rice","cotton","sugarcane","mustard","chickpea"],
    "bihar":           ["rice","wheat","maize","sugarcane","lentil","potato","jute"],
    "west bengal":     ["rice","jute","potato","wheat","maize","tea","mustard"],
    "gujarat":         ["cotton","groundnut","wheat","rice","sugarcane","banana","mango"],
    "assam":           ["rice","tea","jute","sugarcane","mustard","banana"],
    "jharkhand":       ["rice","maize","wheat","sugarcane","lentil","mustard"],
    "chhattisgarh":    ["rice","maize","wheat","lentil","soybean","pigeonpeas"],
    "himachal pradesh":["apple","maize","wheat","potato","rice","ginger","tomato"],
    "uttarakhand":     ["wheat","rice","maize","sugarcane","potato","lentil"],
}

# ── Per-crop scientific suitability explanation ──────────────────────────────
CROP_SUITABILITY: Dict[str, Dict] = {
    "rice":        {"temp":(20,35), "rain":(150,300), "hum":(70,90), "ph":(5.5,7.0)},
    "wheat":       {"temp":(10,25), "rain":(30,100),  "hum":(50,70), "ph":(6.0,7.5)},
    "maize":       {"temp":(18,32), "rain":(50,120),  "hum":(50,80), "ph":(5.8,7.0)},
    "sugarcane":   {"temp":(20,35), "rain":(100,250), "hum":(70,90), "ph":(6.0,7.5)},
    "cotton":      {"temp":(20,35), "rain":(60,120),  "hum":(50,80), "ph":(5.8,8.0)},
    "jute":        {"temp":(24,37), "rain":(150,250), "hum":(70,90), "ph":(6.0,7.5)},
    "banana":      {"temp":(24,32), "rain":(100,220), "hum":(70,90), "ph":(6.0,7.5)},
    "mango":       {"temp":(22,32), "rain":(50,150),  "hum":(50,80), "ph":(5.5,7.5)},
    "coconut":     {"temp":(20,32), "rain":(100,200), "hum":(70,90), "ph":(5.0,8.0)},
    "coffee":      {"temp":(15,28), "rain":(100,200), "hum":(65,85), "ph":(5.5,6.5)},
    "chickpea":    {"temp":(15,25), "rain":(30,80),   "hum":(30,60), "ph":(6.0,9.0)},
    "lentil":      {"temp":(15,25), "rain":(20,70),   "hum":(40,70), "ph":(6.0,8.0)},
    "pigeonpeas":  {"temp":(18,30), "rain":(60,150),  "hum":(50,80), "ph":(5.0,7.5)},
    "kidneybeans": {"temp":(18,24), "rain":(30,80),   "hum":(50,75), "ph":(6.0,7.5)},
    "blackgram":   {"temp":(25,35), "rain":(60,120),  "hum":(60,90), "ph":(6.0,7.5)},
    "mungbean":    {"temp":(25,35), "rain":(50,100),  "hum":(60,85), "ph":(6.5,7.5)},
    "mothbeans":   {"temp":(24,38), "rain":(20,60),   "hum":(20,50), "ph":(6.5,8.0)},
    "grapes":      {"temp":(15,35), "rain":(50,100),  "hum":(30,70), "ph":(5.5,7.0)},
    "apple":       {"temp":(10,25), "rain":(80,150),  "hum":(50,80), "ph":(5.5,6.5)},
    "orange":      {"temp":(18,32), "rain":(75,150),  "hum":(50,80), "ph":(6.0,7.5)},
    "papaya":      {"temp":(22,32), "rain":(80,150),  "hum":(60,85), "ph":(6.0,6.5)},
    "muskmelon":   {"temp":(24,35), "rain":(30,80),   "hum":(40,75), "ph":(6.0,7.0)},
    "watermelon":  {"temp":(21,35), "rain":(40,100),  "hum":(50,80), "ph":(6.0,7.0)},
    "pomegranate": {"temp":(25,35), "rain":(30,80),   "hum":(20,60), "ph":(6.5,7.5)},
}

def _check_suitability(crop: str, temp: float, rain: float, hum: float) -> List[str]:
    """Return list of matched suitability reasons based on historical climate vs crop needs."""
    c   = crop.lower()
    req = CROP_SUITABILITY.get(c, {})
    matched = []
    if req:
        t_lo, t_hi = req["temp"]
        r_lo, r_hi = req["rain"]
        h_lo, h_hi = req["hum"]
        if t_lo <= temp <= t_hi:
            matched.append(f"Historical avg temperature ({temp:.1f}°C) is within {crop}'s ideal range ({t_lo}–{t_hi}°C)")
        else:
            matched.append(f"Historical avg temperature ({temp:.1f}°C) is {'below' if temp < t_lo else 'above'} {crop}'s ideal range ({t_lo}–{t_hi}°C)")
        if r_lo <= rain <= r_hi:
            matched.append(f"Average monthly rainfall ({rain:.0f} mm) suits {crop}'s water requirements")
        else:
            matched.append(f"Average monthly rainfall ({rain:.0f} mm) is {'below' if rain < r_lo else 'above'} {crop}'s optimal range ({r_lo}–{r_hi} mm)")
        if h_lo <= hum <= h_hi:
            matched.append(f"Average humidity ({hum:.0f}%) is suitable for {crop}")
        else:
            matched.append(f"Average humidity ({hum:.0f}%) is {'too low' if hum < h_lo else 'too high'} for ideal {crop} growth")
    return matched


# ── Schemas ───────────────────────────────────────────────────────────────────
class CompareInput(BaseModel):
    crop:     str
    state:    str
    district: str = ""

class HistoricalClimate(BaseModel):
    avg_temp_c:    float
    avg_rain_mm:   float
    avg_humidity:  float
    years_fetched: int
    source:        str

class CompareOutput(BaseModel):
    crop:              str
    state:             str
    district:          str
    is_commonly_grown: bool
    historical_crops:  List[str]
    alternatives:      List[str]
    climate:           Optional[HistoricalClimate]
    suitability_notes: List[str]
    summary:           str
    lat:               Optional[float]
    lon:               Optional[float]


# ── Helpers ───────────────────────────────────────────────────────────────────
GEOCODING_URL       = "https://geocoding-api.open-meteo.com/v1/search"
HISTORICAL_WEATHER_URL = "https://archive-api.open-meteo.com/v1/archive"

async def _geocode(district: str, state: str) -> Optional[tuple]:
    """district + state → (lat, lon) using Open-Meteo free geocoding. No key needed."""
    query = f"{district}, {state}, India" if district else f"{state}, India"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(GEOCODING_URL, params={"name": query, "count": 1, "language": "en", "format": "json"})
            r.raise_for_status()
            results = r.json().get("results", [])
            if results:
                return results[0]["latitude"], results[0]["longitude"]
    except Exception as e:
        log.warning(f"[GEOCODE] Failed for '{query}': {e}")
    return None

async def _fetch_historical_climate(lat: float, lon: float) -> Optional[HistoricalClimate]:
    """
    Fetch 15 years of daily climate data from Open-Meteo Historical Archive API.
    Computes annual averages for temperature, precipitation, and humidity.
    API: https://archive-api.open-meteo.com/v1/archive — FREE, no key required.
    """
    from datetime import date
    end_year   = date.today().year - 1           # last full year
    start_year = end_year - 14                   # 15 years back
    params = {
        "latitude":  lat,
        "longitude": lon,
        "start_date": f"{start_year}-01-01",
        "end_date":   f"{end_year}-12-31",
        "daily":      "temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean",
        "timezone":   "Asia/Kolkata",
    }
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.get(HISTORICAL_WEATHER_URL, params=params)
            r.raise_for_status()
            data   = r.json().get("daily", {})
            temps  = [v for v in (data.get("temperature_2m_mean") or []) if v is not None]
            rains  = [v for v in (data.get("precipitation_sum")   or []) if v is not None]
            hums   = [v for v in (data.get("relative_humidity_2m_mean") or []) if v is not None]
            if not temps:
                return None
            # Convert daily precipitation (mm/day) → monthly average (mm/month × 30)
            avg_rain_monthly = (sum(rains) / len(rains)) * 30 if rains else 0.0
            return HistoricalClimate(
                avg_temp_c   = round(sum(temps) / len(temps), 1),
                avg_rain_mm  = round(avg_rain_monthly, 1),
                avg_humidity = round(sum(hums) / len(hums), 1) if hums else 0.0,
                years_fetched= end_year - start_year + 1,
                source       = "Open-Meteo ERA5 Reanalysis Archive (Free, No Key)"
            )
    except Exception as e:
        log.warning(f"[HISTORICAL] Failed for ({lat},{lon}): {e}")
    return None


# ── Endpoint ──────────────────────────────────────────────────────────────────
@router.post("/compare", response_model=CompareOutput, summary="Regional Historical Crop Comparison")
async def compare(data: CompareInput):
    """
    Full comparison pipeline — 100% free, zero API keys:
    1. Geocode district → lat/lon   (Open-Meteo Geocoding API, free)
    2. Fetch 15-year climate data   (Open-Meteo Historical Archive API, free)
    3. Check if crop is historically grown in this state (curated crop map)
    4. Build suitability notes comparing real historical climate vs crop needs
    5. Return structured comparison with alternatives if crop is not common
    """
    crop_lower  = data.crop.lower().replace(" ", "")
    state_lower = data.state.lower().strip()

    # Step 1 – Geocode
    coords = await _geocode(data.district, data.state)
    lat = lon = None
    if coords:
        lat, lon = coords
        log.info(f"[COMPARE] Geocoded '{data.district}, {data.state}' → ({lat}, {lon})")
    else:
        log.warning(f"[COMPARE] Could not geocode '{data.district}, {data.state}'")

    # Step 2 – Historical climate
    climate = None
    if lat and lon:
        climate = await _fetch_historical_climate(lat, lon)
        if climate:
            log.info(f"[COMPARE] Climate: temp={climate.avg_temp_c}°C rain={climate.avg_rain_mm}mm hum={climate.avg_humidity}%")

    # Step 3 – Crop history lookup
    historical_crops = STATE_CROP_HISTORY.get(state_lower, [])
    is_commonly_grown = crop_lower in [c.replace(" ", "") for c in historical_crops]
    alternatives = [c for c in historical_crops if c.replace(" ", "") != crop_lower][:3]

    # Step 4 – Suitability notes from real climate data
    suitability_notes: List[str] = []
    if climate:
        suitability_notes = _check_suitability(
            data.crop,
            temp = climate.avg_temp_c,
            rain = climate.avg_rain_mm,
            hum  = climate.avg_humidity,
        )
    else:
        suitability_notes = [
            "Historical climate data could not be fetched for this location.",
            "Suitability is assessed from your manually entered conditions only.",
        ]

    # Step 5 – Build summary sentence
    if is_commonly_grown:
        summary = (
            f"{data.crop.capitalize()} is widely and commercially grown in {data.state}. "
            f"The ML recommendation aligns with established regional farming practice."
        )
    else:
        alt_str = ", ".join(c.capitalize() for c in alternatives) if alternatives else "local crops"
        summary = (
            f"{data.crop.capitalize()} is scientifically suitable based on your soil and climate data, "
            f"but it is not commonly cultivated at commercial scale in {data.state}. "
            f"Farmers in this region predominantly grow {alt_str}. "
            f"Consider growing {data.crop.capitalize()} experimentally while using regional crops for primary income."
        )

    log.info(f"[COMPARE] crop='{data.crop}' state='{data.state}' commonly_grown={is_commonly_grown}")

    return CompareOutput(
        crop              = data.crop,
        state             = data.state,
        district          = data.district,
        is_commonly_grown = is_commonly_grown,
        historical_crops  = historical_crops,
        alternatives      = alternatives,
        climate           = climate,
        suitability_notes = suitability_notes,
        summary           = summary,
        lat               = lat,
        lon               = lon,
    )