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