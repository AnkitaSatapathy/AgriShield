"""
AgriShield Crop Recommendation API - No Logging Version
=========================================================================
Production-ready API with all logging removed
Run with: uvicorn main:app --reload
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Tuple
import pickle
import json
import numpy as np
import pandas as pd
import sys
from datetime import datetime
from pathlib import Path
from scipy.stats import entropy

# ============================================================================
# ROUTER SETUP
# ============================================================================

router = APIRouter(prefix="/api/crop", tags=["crop-recommendation"])

# ============================================================================
# CONFIGURATION
# ============================================================================

_BASE = Path(__file__).parent
MODEL_DIR = _BASE.parent / "models"

EPSILON = 1e-6
TOP_K_RECOMMENDATIONS = 5

# ============================================================================
# PENALTY CONFIGURATION
# ============================================================================

RICE_PENALTY_BASE = 0.85
RICE_PENALTY_WATER_THRESHOLD = 1200
RICE_PENALTY_EXCESSIVE_WATER_THRESHOLD = 2000
RICE_PENALTY_LOW_HUMIDITY_THRESHOLD = 60
RICE_PENALTY_LOW_K_THRESHOLD = 30
RICE_PENALTY_HIGH_K_THRESHOLD = 80
RICE_PENALTY_HIGH_N_THRESHOLD = 110
RICE_PENALTY_COOL_TEMP_THRESHOLD = 18

RAINFED_CROP_WATER_MIN = {
    "rice": 800,
    "jute": 1200,
    "coconut": 1200,
    "coffee": 1200,
    "sugarcane": 1500
}

PH_SENSITIVE_CROPS = {
    "extreme_acid_sensitive": {
        "crops": ["wheat", "maize", "cotton"],
        "threshold": 5.0,
        "penalty": 0.85
    },
    "acid_sensitive": {
        "crops": ["rice", "potato"],
        "threshold": 5.0,
        "penalty": 0.85
    },
    "alkaline_sensitive": {
        "crops": ["potato", "tea"],
        "threshold": 8.0,
        "penalty": 0.85
    }
}

TEMPERATURE_SENSITIVE_CROPS = {
    "heat_sensitive": {
        "crops": ["apple", "grapes", "lettuce"],
        "threshold": 35,
        "penalty": 0.85
    },
    "cold_sensitive": {
        "crops": ["cotton", "rice", "sugarcane"],
        "threshold": 15,
        "penalty": 0.85
    }
}

CROP_BOOST_MULTIPLIERS = {
    "wheat": {
        "boost": 1.3,
        "conditions": {
            "temp_range": (15, 22),
            "rainfall_range": (400, 700),
            "n_min": 70
        }
    },
    "maize": {
        "boost": 1.3,
        "conditions": {
            "n_min": 100,
            "temp_range": (22, 32),
            "rainfall_range": (500, 1000)
        }
    },
    "coconut": {
        "boost": 1.4,
        "conditions": {
            "k_min": 100,
            "rainfall_min": 1500,
            "temp_min": 25
        }
    },
    "cotton": {
        "boost": 1.3,
        "conditions": {
            "k_min": 70,
            "temp_range": (25, 35),
            "rainfall_range": (600, 1000)
        }
    },
    "coffee": {
        "boost": 1.4,
        "conditions": {
            "ph_range": (5.0, 6.0),
            "temp_range": (17, 24),
            "rainfall_min": 1200
        }
    },
    "jute": {
        "boost": 1.3,
        "conditions": {
            "rainfall_min": 1500,
            "temp_min": 27,
            "humidity_min": 75
        }
    }
}

MAX_BOOSTED_PROBABILITY = 0.85
MAX_CONFIDENCE_WITH_WARNINGS = 85.0
MIN_PROBABILITY_MASS_THRESHOLD = 0.15

ABSOLUTE_CONSTRAINTS = {
    "ph_min": 4.5,
    "ph_max": 8.8,
    "temp_min": -5,
    "temp_max": 50
}

# ============================================================================
# GLOBAL MODEL STATE
# ============================================================================

model = None
scaler = None
label_encoder = None
feature_cols = None
model_info = None

# ============================================================================
# MODEL LOADING
# ============================================================================

def _validate_file(filepath: Path) -> Tuple[bool, str]:
    if not filepath.exists():
        return False, f"File not found: {filepath}"
    
    file_size = filepath.stat().st_size
    
    if file_size == 0:
        return False, f"File is empty (0 bytes): {filepath}"
    
    if file_size < 100:
        return False, f"File too small ({file_size} bytes), likely corrupted: {filepath}"
    
    return True, ""


def _load_pickle(filename: str):
    path = MODEL_DIR / filename
    
    is_valid, error_msg = _validate_file(path)
    if not is_valid:
        raise FileNotFoundError(error_msg)
    
    try:
        with open(path, 'rb') as f:
            obj = pickle.load(f)
        return obj
    except Exception as pickle_error:
        try:
            import joblib
            obj = joblib.load(path)
            return obj
        except ImportError:
            error_msg = (
                f"Failed to load {filename}. "
                f"Pickle error: {pickle_error}. "
                f"Joblib not available as fallback. "
                f"Install joblib: pip install joblib"
            )
            raise RuntimeError(error_msg)
        except Exception as joblib_error:
            error_msg = (
                f"Failed to load {filename} with both pickle and joblib. "
                f"Pickle error: {pickle_error}. "
                f"Joblib error: {joblib_error}. "
                f"File may be corrupted or in wrong format."
            )
            raise RuntimeError(error_msg)


def load_model_artifacts():
    global model, scaler, label_encoder, feature_cols, model_info
    
    try:
        if not MODEL_DIR.exists():
            return False
        
        # Load model
        try:
            model = _load_pickle("crop_model.pkl")
        except Exception:
            return False
        
        # Load scaler
        try:
            scaler = _load_pickle("scaler2.pkl")
            
            from sklearn.preprocessing import StandardScaler
            
            if isinstance(scaler, np.ndarray):
                return False
            
            elif not isinstance(scaler, StandardScaler):
                return False

        except Exception:
            return False
        
        # Load label encoder
        try:
            label_encoder = _load_pickle("label_encoder.pkl")
            
            if hasattr(label_encoder, 'classes_'):
                pass
            elif isinstance(label_encoder, (list, np.ndarray)):
                class ArrayLabelEncoder:
                    def __init__(self, classes):
                        self.classes_ = np.array(classes)
                    
                    def inverse_transform(self, y):
                        return [self.classes_[int(i)] for i in y]
                
                label_encoder = ArrayLabelEncoder(label_encoder)
            else:
                return False
                
        except Exception:
            return False
        
        # Load model info
        info_path = MODEL_DIR / "model_info.json"
        
        is_valid, error_msg = _validate_file(info_path)
        if not is_valid:
            model_info = {
                "model_type": "Unknown",
                "version": "Unknown",
                "features": []
            }
        else:
            try:
                with open(info_path, 'r', encoding='utf-8') as f:
                    model_info = json.load(f)
            except Exception:
                model_info = {
                    "model_type": "Unknown",
                    "version": "Unknown",
                    "features": []
                }
        
        # Recover feature columns
        feature_cols = model_info.get('features', [])
        
        if not feature_cols or feature_cols is None:
            if hasattr(scaler, 'feature_names_in_'):
                feature_cols = list(scaler.feature_names_in_)
            elif hasattr(scaler, 'n_features_in_'):
                n_features = scaler.n_features_in_
                feature_cols = [f"feature_{i}" for i in range(n_features)]
            else:
                return False
        
        return True
        
    except Exception:
        return False


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class CropRecommendationRequest(BaseModel):
    N: float = Field(..., ge=0, le=200, description="Nitrogen content (kg/ha)")
    P: float = Field(..., ge=0, le=200, description="Phosphorus content (kg/ha)")
    K: float = Field(..., ge=0, le=200, description="Potassium content (kg/ha)")
    temperature: float = Field(..., ge=-10, le=50, description="Temperature (°C)")
    humidity: float = Field(..., ge=0, le=100, description="Humidity (%)")
    ph: float = Field(..., ge=0, le=14, description="pH value")
    rainfall: float = Field(..., ge=0, le=5000, description="Rainfall (mm)")


class CropRecommendation(BaseModel):
    crop: str
    confidence: float
    suitability: str


class RecommendationMetadata(BaseModel):
    model_type: str
    model_version: str
    api_version: str
    testing_mode: bool
    rice_penalty_applied: bool
    rice_penalty_factors: List[str]
    rice_penalty_multiplier: float
    soft_penalties_applied: int
    crops_boosted: int
    absolute_violations_blocked: int
    raw_diversity_score: float
    final_diversity_score: float
    total_features_used: int
    probability_collapse_prevented: bool
    timestamp: str


class RecommendationContext(BaseModel):
    rainfall_mm: float
    effective_water_mm: float
    ph: float
    temperature: float
    humidity: float
    n: float
    k: float
    rice_penalty_triggered: bool
    rice_penalty_reason: Optional[str]


class CropRecommendationResponse(BaseModel):
    primary_recommendation: CropRecommendation
    alternative_recommendations: List[CropRecommendation]
    input_parameters: Dict
    metadata: RecommendationMetadata
    context: RecommendationContext


# ============================================================================
# FEATURE ENGINEERING
# ============================================================================

def engineer_features(n: float, p: float, k: float, 
                     temperature: float, humidity: float, 
                     ph: float, rainfall: float) -> pd.DataFrame:
    df = pd.DataFrame([{
        'n': n,
        'p': p,
        'k': k,
        'temperature': temperature,
        'humidity': humidity,
        'ph': ph,
        'rainfall': rainfall
    }])
    
    # NPK FEATURES
    df['npk_total'] = df['n'] + df['p'] + df['k']
    df['n_to_p_ratio'] = df['n'] / (df['p'] + EPSILON)
    df['n_to_k_ratio'] = df['n'] / (df['k'] + EPSILON)
    df['p_to_k_ratio'] = df['p'] / (df['k'] + EPSILON)
    
    npk_mean = df[['n', 'p', 'k']].mean(axis=1)
    df['npk_balance'] = (
        abs(df['n'] - npk_mean) + 
        abs(df['p'] - npk_mean) + 
        abs(df['k'] - npk_mean)
    ) / (npk_mean + EPSILON)
    
    # CLIMATE BASE FEATURES
    df['moisture_index'] = df['rainfall'] * (df['humidity'] / 100)
    df['heat_stress'] = df['temperature'] * (100 - df['humidity']) / 100
    df['gdd_proxy'] = df['temperature'] * (df['humidity'] / 100)
    
    # RAINFALL CATEGORIES
    df['is_low_rainfall'] = (df['rainfall'] < 600).astype(int)
    df['is_high_rainfall'] = (df['rainfall'] > 1500).astype(int)
    df['is_very_high_rainfall'] = (df['rainfall'] > 2500).astype(int)
    
    # TEMPERATURE CATEGORIES
    df['is_cool'] = (df['temperature'] < 18).astype(int)
    df['is_hot'] = (df['temperature'] > 28).astype(int)
    df['is_very_hot'] = (df['temperature'] > 32).astype(int)
    
    # CLIMATE SQUARED FEATURES
    df['temperature_squared'] = df['temperature'] ** 2
    df['rainfall_squared'] = df['rainfall'] ** 2
    
    # pH BASE FEATURES
    df['ph_deviation'] = abs(df['ph'] - 6.5)
    df['is_acidic'] = (df['ph'] < 6.5).astype(int)
    df['is_alkaline'] = (df['ph'] > 7.5).astype(int)
    
    # pH GRANULAR CATEGORIES
    df['is_very_acidic'] = (df['ph'] < 5.5).astype(int)
    df['is_very_alkaline'] = (df['ph'] > 8.0).astype(int)
    df['is_extreme_acidic'] = (df['ph'] < 5.0).astype(int)
    
    # pH ADVANCED FEATURES
    df['ph_deviation_squared'] = df['ph_deviation'] ** 2
    df['ph_n_interaction'] = df['ph'] * df['n']
    df['ph_p_interaction'] = df['ph'] * df['p']
    
    return df


def get_suitability(confidence: float, warnings: bool = False) -> str:
    if warnings:
        max_rating = min(confidence, MAX_CONFIDENCE_WITH_WARNINGS)
    else:
        max_rating = confidence
    
    if max_rating >= 70:
        return "Highly Suitable"
    elif max_rating >= 50:
        return "Moderately Suitable"
    elif max_rating >= 30:
        return "Marginally Suitable"
    else:
        return "Not Suitable"


# ============================================================================
# PREDICTION ENGINE
# ============================================================================

def predict_top_k_crops(N: float, P: float, K: float,
                       temperature: float, humidity: float,
                       ph: float, rainfall: float,
                       k: int = TOP_K_RECOMMENDATIONS) -> Dict:
    if model is None:
        return {
            'error': 'Model not loaded',
            'violations': ['System error: Model artifacts not available']
        }
    
    if feature_cols is None or len(feature_cols) == 0:
        return {
            'error': 'Model configuration error',
            'violations': ['System error: Feature columns not available. Please retrain the model.']
        }
    
    # Validate absolute constraints
    violations = []
    if ph < ABSOLUTE_CONSTRAINTS['ph_min']:
        violations.append(f"pH too low: {ph:.2f} < {ABSOLUTE_CONSTRAINTS['ph_min']}")
    if ph > ABSOLUTE_CONSTRAINTS['ph_max']:
        violations.append(f"pH too high: {ph:.2f} > {ABSOLUTE_CONSTRAINTS['ph_max']}")
    if temperature < ABSOLUTE_CONSTRAINTS['temp_min']:
        violations.append(f"Temperature too low: {temperature:.1f}°C < {ABSOLUTE_CONSTRAINTS['temp_min']}°C")
    if temperature > ABSOLUTE_CONSTRAINTS['temp_max']:
        violations.append(f"Temperature too high: {temperature:.1f}°C > {ABSOLUTE_CONSTRAINTS['temp_max']}°C")
    
    if violations:
        return {'error': 'Environmental constraints violated', 'violations': violations}
    
    # Engineer features
    engineered_df = engineer_features(N, P, K, temperature, humidity, ph, rainfall)
    
    # Verify features
    missing_features = set(feature_cols) - set(engineered_df.columns)
    if missing_features:
        return {
            'error': 'Feature engineering error',
            'violations': [f'Missing features: {missing_features}']
        }
    
    # Select features
    X = engineered_df[feature_cols]
    
    # Scale features
    X_scaled = scaler.transform(X)
    
    # Get raw probabilities
    raw_probs = model.predict_proba(X_scaled)[0]
    
    # Apply rice-specific penalties
    rice_penalty_applied = False
    rice_penalty_reasons = []
    rice_penalty_multiplier = 1.0
    
    rice_idx = None
    for idx, crop in enumerate(label_encoder.classes_):
        if crop.lower() == 'rice':
            rice_idx = idx
            break
    
    effective_water = rainfall * humidity / 100
    
    if rice_idx is not None:
        if rainfall < RICE_PENALTY_WATER_THRESHOLD:
            rice_penalty_applied = True
            rice_penalty_multiplier = RICE_PENALTY_BASE
            rice_penalty_reasons.append(f"Low rainfall ({rainfall:.0f} < {RICE_PENALTY_WATER_THRESHOLD}mm)")
        
        if rainfall > RICE_PENALTY_EXCESSIVE_WATER_THRESHOLD:
            rice_penalty_applied = True
            rice_penalty_multiplier = min(rice_penalty_multiplier, RICE_PENALTY_BASE)
            rice_penalty_reasons.append(f"Excessive rainfall ({rainfall:.0f} > {RICE_PENALTY_EXCESSIVE_WATER_THRESHOLD}mm)")
        
        if humidity < RICE_PENALTY_LOW_HUMIDITY_THRESHOLD:
            rice_penalty_applied = True
            rice_penalty_multiplier *= 0.9
            rice_penalty_reasons.append(f"Low humidity ({humidity:.0f}% < {RICE_PENALTY_LOW_HUMIDITY_THRESHOLD}%)")
        
        if K < RICE_PENALTY_LOW_K_THRESHOLD or K > RICE_PENALTY_HIGH_K_THRESHOLD:
            rice_penalty_applied = True
            rice_penalty_multiplier *= 0.95
            rice_penalty_reasons.append(f"Potassium outside optimal range ({K:.0f})")
        
        if N > RICE_PENALTY_HIGH_N_THRESHOLD:
            rice_penalty_applied = True
            rice_penalty_multiplier *= 0.95
            rice_penalty_reasons.append(f"High nitrogen ({N:.0f} > {RICE_PENALTY_HIGH_N_THRESHOLD})")
        
        if temperature < RICE_PENALTY_COOL_TEMP_THRESHOLD:
            rice_penalty_applied = True
            rice_penalty_multiplier *= 0.9
            rice_penalty_reasons.append(f"Cool temperature ({temperature:.1f}°C < {RICE_PENALTY_COOL_TEMP_THRESHOLD}°C)")
        
        if rice_penalty_applied:
            raw_probs[rice_idx] *= rice_penalty_multiplier
    
    # Apply soft penalties
    adjusted_probs = raw_probs.copy()
    soft_penalties_applied = 0
    
    # Rainfed crop penalties
    for crop_name, min_rainfall in RAINFED_CROP_WATER_MIN.items():
        if rainfall < min_rainfall:
            for idx, crop in enumerate(label_encoder.classes_):
                if crop.lower() == crop_name.lower():
                    adjusted_probs[idx] *= 0.9
                    soft_penalties_applied += 1
    
    # pH penalties
    for sensitivity_type, config in PH_SENSITIVE_CROPS.items():
        for crop_name in config['crops']:
            for idx, crop in enumerate(label_encoder.classes_):
                if crop.lower() == crop_name.lower():
                    if 'acid' in sensitivity_type and ph < config['threshold']:
                        adjusted_probs[idx] *= config['penalty']
                        soft_penalties_applied += 1
                    elif 'alkaline' in sensitivity_type and ph > config['threshold']:
                        adjusted_probs[idx] *= config['penalty']
                        soft_penalties_applied += 1
    
    # Temperature penalties
    for sensitivity_type, config in TEMPERATURE_SENSITIVE_CROPS.items():
        for crop_name in config['crops']:
            for idx, crop in enumerate(label_encoder.classes_):
                if crop.lower() == crop_name.lower():
                    if sensitivity_type == 'heat_sensitive' and temperature > config['threshold']:
                        adjusted_probs[idx] *= config['penalty']
                        soft_penalties_applied += 1
                    elif sensitivity_type == 'cold_sensitive' and temperature < config['threshold']:
                        adjusted_probs[idx] *= config['penalty']
                        soft_penalties_applied += 1
    
    # Apply crop boosts
    crops_boosted = 0
    for crop_name, boost_config in CROP_BOOST_MULTIPLIERS.items():
        for idx, crop in enumerate(label_encoder.classes_):
            if crop.lower() == crop_name.lower():
                conditions_met = True
                conditions = boost_config['conditions']
                
                if 'temp_range' in conditions:
                    temp_min, temp_max = conditions['temp_range']
                    if not (temp_min <= temperature <= temp_max):
                        conditions_met = False
                
                if 'rainfall_range' in conditions:
                    rain_min, rain_max = conditions['rainfall_range']
                    if not (rain_min <= rainfall <= rain_max):
                        conditions_met = False
                
                if 'n_min' in conditions and N < conditions['n_min']:
                    conditions_met = False
                if 'k_min' in conditions and K < conditions['k_min']:
                    conditions_met = False
                if 'rainfall_min' in conditions and rainfall < conditions['rainfall_min']:
                    conditions_met = False
                if 'temp_min' in conditions and temperature < conditions['temp_min']:
                    conditions_met = False
                if 'humidity_min' in conditions and humidity < conditions['humidity_min']:
                    conditions_met = False
                
                if 'ph_range' in conditions:
                    ph_min, ph_max = conditions['ph_range']
                    if not (ph_min <= ph <= ph_max):
                        conditions_met = False
                
                if conditions_met:
                    adjusted_probs[idx] *= boost_config['boost']
                    crops_boosted += 1
    
    # Cap boosted probabilities
    adjusted_probs = np.minimum(adjusted_probs, MAX_BOOSTED_PROBABILITY)
    
    # Normalize probabilities
    prob_sum = adjusted_probs.sum()
    if prob_sum > EPSILON:
        adjusted_probs = adjusted_probs / prob_sum
    else:
        adjusted_probs = np.ones_like(adjusted_probs) / len(adjusted_probs)
    
    # Calculate diversity scores
    raw_diversity_score = entropy(raw_probs + EPSILON)
    final_diversity_score = entropy(adjusted_probs + EPSILON)
    
    # Check for probability collapse
    top_1_prob = adjusted_probs.max()
    probability_collapse_prevented = top_1_prob < 0.9
    
    # Get top-k recommendations
    top_k_indices = adjusted_probs.argsort()[-k:][::-1]
    
    recommendations = []
    absolute_violations_blocked = 0
    
    for idx in top_k_indices:
        crop_name = label_encoder.classes_[idx]
        confidence = float(adjusted_probs[idx] * 100)
        
        has_warnings = False
        suitability = get_suitability(confidence, has_warnings)
        
        recommendations.append(
            CropRecommendation(
                crop=crop_name,
                confidence=round(confidence, 2),
                suitability=suitability
            )
        )
    
    return {
        'recommendations': recommendations,
        'metadata': {
            'rice_penalty_applied': rice_penalty_applied,
            'rice_penalty_factors': rice_penalty_reasons,
            'rice_penalty_multiplier': rice_penalty_multiplier,
            'soft_penalties_applied': soft_penalties_applied,
            'crops_boosted': crops_boosted,
            'absolute_violations_blocked': absolute_violations_blocked,
            'raw_diversity_score': raw_diversity_score,
            'final_diversity_score': final_diversity_score,
            'probability_collapse_prevented': probability_collapse_prevented
        },
        'context': {
            'rainfall_mm': rainfall,
            'effective_water_mm': effective_water,
            'ph': ph,
            'temperature': temperature,
            'humidity': humidity,
            'n': N,
            'k': K,
            'rice_penalty_triggered': rice_penalty_applied,
            'rice_penalty_reason': ' | '.join(rice_penalty_reasons) if rice_penalty_reasons else None
        }
    }

# ============================================================================
# API ENDPOINTS
# ============================================================================

@router.post("/recommend", response_model=CropRecommendationResponse)
async def recommend_crop(request: CropRecommendationRequest):
    try:
        result = predict_top_k_crops(
            request.N, request.P, request.K,
            request.temperature, request.humidity,
            request.ph, request.rainfall
        )
        
        if 'error' in result:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": result['error'],
                    "violations": result.get('violations', [])
                }
            )
        
        metadata = RecommendationMetadata(
            model_type=model_info.get('model_type', 'Unknown'),
            model_version=model_info.get('version', 'Unknown'),
            api_version="6.0-NO-LOGGING",
            testing_mode=True,
            rice_penalty_applied=result['metadata']['rice_penalty_applied'],
            rice_penalty_factors=result['metadata']['rice_penalty_factors'],
            rice_penalty_multiplier=result['metadata']['rice_penalty_multiplier'],
            soft_penalties_applied=result['metadata']['soft_penalties_applied'],
            crops_boosted=result['metadata']['crops_boosted'],
            absolute_violations_blocked=result['metadata']['absolute_violations_blocked'],
            raw_diversity_score=result['metadata']['raw_diversity_score'],
            final_diversity_score=result['metadata']['final_diversity_score'],
            total_features_used=len(feature_cols) if feature_cols else 0,
            probability_collapse_prevented=result['metadata']['probability_collapse_prevented'],
            timestamp=datetime.now().isoformat()
        )
        
        context = RecommendationContext(
            rainfall_mm=result['context']['rainfall_mm'],
            effective_water_mm=result['context']['effective_water_mm'],
            ph=result['context']['ph'],
            temperature=result['context']['temperature'],
            humidity=result['context']['humidity'],
            n=result['context']['n'],
            k=result['context']['k'],
            rice_penalty_triggered=result['context']['rice_penalty_triggered'],
            rice_penalty_reason=result['context']['rice_penalty_reason']
        )
        
        return CropRecommendationResponse(
            primary_recommendation=result['recommendations'][0],
            alternative_recommendations=result['recommendations'][1:],
            input_parameters=request.dict(),
            metadata=metadata,
            context=context
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    status = "healthy" if model is not None else "unhealthy"
    
    diagnostics = {
        "status": status,
        "timestamp": datetime.now().isoformat(),
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None,
        "label_encoder_loaded": label_encoder is not None,
        "feature_cols_loaded": feature_cols is not None and len(feature_cols) > 0,
        "model_info_loaded": model_info is not None,
        "api_version": "6.0-NO-LOGGING",
        "testing_mode": True
    }
    
    if model is not None and model_info is not None:
        diagnostics.update({
            "model_type": model_info.get('model_type', 'Unknown'),
            "model_version": model_info.get('version', 'Unknown'),
            "features": len(feature_cols) if feature_cols else 0,
            "crops": len(label_encoder.classes_) if label_encoder else 0,
            "balanced_dataset": model_info.get('balanced', False),
            "samples_per_class": model_info.get('samples_per_class', 'Unknown'),
            "model_accuracy": {
                "train": model_info.get('accuracy', {}).get('train', None),
                "test": model_info.get('accuracy', {}).get('test', None),
                "gap": model_info.get('accuracy', {}).get('gap', None)
            }
        })
    
    return diagnostics


@router.get("/info")
async def get_model_info():
    if model is None:
        raise HTTPException(
            status_code=500,
            detail="Model not loaded. Please run training script first."
        )
    
    return {
        "model_type": model_info.get('model_type', 'Unknown'),
        "model_version": model_info.get('version', 'Unknown'),
        "api_version": "6.0-NO-LOGGING",
        "testing_mode": True,
        "trained_date": model_info.get('trained_date', 'Unknown'),
        "num_features": len(feature_cols) if feature_cols else 0,
        "num_classes": len(label_encoder.classes_) if label_encoder else 0,
        "classes": sorted(label_encoder.classes_.tolist()) if label_encoder else [],
        "features": feature_cols if feature_cols else [],
        "balanced_dataset": model_info.get('balanced', False),
        "samples_per_class": model_info.get('samples_per_class', 'Unknown'),
        "accuracy": model_info.get('accuracy', {}),
        "data_sources": model_info.get('data_sources', {}),
        "hyperparameters": model_info.get('hyperparameters', {})
    }


@router.get("/crops")
async def list_crops():
    if model is None or label_encoder is None:
        raise HTTPException(
            status_code=500,
            detail="Model not loaded"
        )
    
    return {
        "crops": sorted(label_encoder.classes_.tolist()),
        "total": len(label_encoder.classes_),
        "balanced": model_info.get('balanced', False) if model_info else False
    }

# ============================================================================
# STARTUP
# ============================================================================

load_model_artifacts()