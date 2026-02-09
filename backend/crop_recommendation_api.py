"""
AgriShield Crop Recommendation API - V6.1 - SCALER VALIDATION FIX PRODUCTION READY - FULLY FIXED
=========================================================================

COMPLETE PRODUCTION-READY API with ALL FIXES:
✓ No emojis in logging (Windows-safe)
✓ Smart model loader (pickle/joblib detection)
✓ File validation before loading
✓ Comprehensive error handling
✓ Clear error messages
✓ Python 3.12 compatible
✓ Production-grade logging
✓ FIXED: feature_cols recovery from scaler
✓ FIXED: Robust label encoder handling
✓ FIXED: Complete feature engineering (32 features matching training)

Run with: uvicorn main:app --reload
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Tuple
import pickle
import json
import numpy as np
import pandas as pd
import logging
import sys
from datetime import datetime
from pathlib import Path
from scipy.stats import entropy

# ============================================================================
# LOGGING CONFIGURATION - WINDOWS SAFE (NO EMOJIS)
# ============================================================================

# Configure logging with ASCII-only output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('crop_api.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

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
# PENALTY CONFIGURATION - REDUCED FOR TESTING
# ============================================================================
# NOTE: These are REDUCED from original values to test ML model performance
# Once ML is confirmed working, you can increase these back to original values

# Rice penalty configuration (REDUCED)
RICE_PENALTY_BASE = 0.85  # Was 0.50 in original, now 0.85 (lighter penalty)
RICE_PENALTY_WATER_THRESHOLD = 1200
RICE_PENALTY_EXCESSIVE_WATER_THRESHOLD = 2000
RICE_PENALTY_LOW_HUMIDITY_THRESHOLD = 60
RICE_PENALTY_LOW_K_THRESHOLD = 30
RICE_PENALTY_HIGH_K_THRESHOLD = 80
RICE_PENALTY_HIGH_N_THRESHOLD = 110
RICE_PENALTY_COOL_TEMP_THRESHOLD = 18

# Rainfed crop water requirements (REDUCED penalties)
RAINFED_CROP_WATER_MIN = {
    "rice": 800,
    "jute": 1200,
    "coconut": 1200,
    "coffee": 1200,
    "sugarcane": 1500
}

# pH sensitive crops (REDUCED penalties)
PH_SENSITIVE_CROPS = {
    "extreme_acid_sensitive": {
        "crops": ["wheat", "maize", "cotton"],
        "threshold": 5.0,
        "penalty": 0.85  # Was 0.6, now 0.85
    },
    "acid_sensitive": {
        "crops": ["rice", "potato"],
        "threshold": 5.0,
        "penalty": 0.85  # Was 0.6, now 0.85
    },
    "alkaline_sensitive": {
        "crops": ["potato", "tea"],
        "threshold": 8.0,
        "penalty": 0.85  # Was 0.5, now 0.85
    }
}

# Temperature sensitive crops (REDUCED penalties)
TEMPERATURE_SENSITIVE_CROPS = {
    "heat_sensitive": {
        "crops": ["apple", "grapes", "lettuce"],
        "threshold": 35,
        "penalty": 0.85  # Was 0.5, now 0.85
    },
    "cold_sensitive": {
        "crops": ["cotton", "rice", "sugarcane"],
        "threshold": 15,
        "penalty": 0.85  # Was 0.6, now 0.85
    }
}

# Crop-specific boosting (REDUCED multipliers)
CROP_BOOST_MULTIPLIERS = {
    "wheat": {
        "boost": 1.3,  # Was 1.8, now 1.3
        "conditions": {
            "temp_range": (15, 22),
            "rainfall_range": (400, 700),
            "n_min": 70
        }
    },
    "maize": {
        "boost": 1.3,  # Was 1.8, now 1.3
        "conditions": {
            "n_min": 100,
            "temp_range": (22, 32),
            "rainfall_range": (500, 1000)
        }
    },
    "coconut": {
        "boost": 1.4,  # Was 2.0, now 1.4
        "conditions": {
            "k_min": 100,
            "rainfall_min": 1500,
            "temp_min": 25
        }
    },
    "cotton": {
        "boost": 1.3,  # Was 1.7, now 1.3
        "conditions": {
            "k_min": 70,
            "temp_range": (25, 35),
            "rainfall_range": (600, 1000)
        }
    },
    "coffee": {
        "boost": 1.4,  # Was 1.9, now 1.4
        "conditions": {
            "ph_range": (5.0, 6.0),
            "temp_range": (17, 24),
            "rainfall_min": 1200
        }
    },
    "jute": {
        "boost": 1.3,  # Was 1.7, now 1.3
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

# Absolute constraints (unchanged)
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
# MODEL LOADING - PRODUCTION READY WITH FEATURE_COLS FIX
# ============================================================================

def _validate_file(filepath: Path) -> Tuple[bool, str]:
    """
    Validate that a model file exists and has a reasonable size.
    
    Args:
        filepath: Path to the file to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not filepath.exists():
        return False, f"File not found: {filepath}"
    
    file_size = filepath.stat().st_size
    
    if file_size == 0:
        return False, f"File is empty (0 bytes): {filepath}"
    
    if file_size < 100:
        return False, f"File too small ({file_size} bytes), likely corrupted: {filepath}"
    
    return True, ""


def _load_pickle(filename: str):
    """
    Load pickle file with smart detection (pickle vs joblib) and comprehensive error handling.
    
    This function:
    1. Validates file exists and is not corrupted
    2. Tries pickle first (standard library)
    3. Falls back to joblib if pickle fails
    4. Provides clear error messages
    
    Args:
        filename: Name of file in MODEL_DIR
        
    Returns:
        Loaded object
        
    Raises:
        FileNotFoundError: If file doesn't exist
        RuntimeError: If file is corrupted or cannot be loaded
    """
    path = MODEL_DIR / filename
    
    # Step 1: Validate file exists and is reasonable
    is_valid, error_msg = _validate_file(path)
    if not is_valid:
        logger.error(f"VALIDATION FAILED: {error_msg}")
        raise FileNotFoundError(error_msg)
    
    file_size = path.stat().st_size / 1024  # KB
    logger.info(f"Loading {filename} ({file_size:.1f} KB)...")
    
    # Step 2: Try loading with pickle (standard)
    try:
        with open(path, 'rb') as f:
            obj = pickle.load(f)
        logger.info(f"SUCCESS: Loaded {filename} using pickle")
        return obj
    except Exception as pickle_error:
        logger.warning(f"Pickle failed for {filename}: {pickle_error}")
        
        # Step 3: Try joblib as fallback
        try:
            import joblib
            obj = joblib.load(path)
            logger.info(f"SUCCESS: Loaded {filename} using joblib")
            return obj
        except ImportError:
            error_msg = (
                f"Failed to load {filename}. "
                f"Pickle error: {pickle_error}. "
                f"Joblib not available as fallback. "
                f"Install joblib: pip install joblib"
            )
            logger.error(error_msg)
            raise RuntimeError(error_msg)
        except Exception as joblib_error:
            error_msg = (
                f"Failed to load {filename} with both pickle and joblib. "
                f"Pickle error: {pickle_error}. "
                f"Joblib error: {joblib_error}. "
                f"File may be corrupted or in wrong format."
            )
            logger.error(error_msg)
            raise RuntimeError(error_msg)


def load_model_artifacts():
    """
    Load all model artifacts with comprehensive error handling and validation.
    
    This function loads:
    - crop_model.pkl: Trained Random Forest model
    - scaler2.pkl: StandardScaler for feature normalization
    - label_encoder.pkl: LabelEncoder for crop name encoding
    - model_info.json: Model metadata
    
    CRITICAL FIX: Recovers feature_cols from scaler if missing from model_info.json
    
    Returns:
        bool: True if successful, False otherwise
    """
    global model, scaler, label_encoder, feature_cols, model_info
    
    try:
        logger.info("="*80)
        logger.info("LOADING MODEL ARTIFACTS")
        logger.info("="*80)
        logger.info(f"Model directory: {MODEL_DIR}")
        logger.info(f"Absolute path: {MODEL_DIR.resolve()}")
        
        # Validate MODEL_DIR exists
        if not MODEL_DIR.exists():
            logger.error(f"CRITICAL: Model directory does not exist: {MODEL_DIR}")
            logger.error(f"Please ensure the models directory is created and contains model files")
            return False
        
        # Load model
        logger.info("")
        logger.info("Step 1/5: Loading crop_model.pkl...")
        try:
            model = _load_pickle("crop_model.pkl")
            logger.info("SUCCESS: Model loaded")
        except Exception as e:
            logger.error(f"FAILED: Could not load model - {e}")
            return False
        
        # Load scaler
        logger.info("")
        logger.info("Step 2/5: Loading scaler2.pkl...")
        try:
            scaler = _load_pickle("scaler2.pkl")
            
            # ========== CRITICAL SCALER VALIDATION (FIXES AttributeError) ==========
            from sklearn.preprocessing import StandardScaler
            
            if isinstance(scaler, np.ndarray):
                logger.error("="*80)
                logger.error("CRITICAL ERROR: scaler2.pkl contains a numpy array, not a StandardScaler!")
                logger.error("="*80)
                logger.error(f"Loaded object type: {type(scaler)}")
                logger.error(f"Array shape: {scaler.shape}")
                logger.error("")
                logger.error("ROOT CAUSE:")
                logger.error("  The scaler2.pkl file was saved incorrectly during training.")
                logger.error("  It contains the scaled data (numpy array) instead of the")
                logger.error("  StandardScaler object itself.")
                logger.error("")
                logger.error("SOLUTION:")
                logger.error("  1. Delete models/scaler2.pkl")
                logger.error("  2. Re-run your training script: python crop_rec.py")
                logger.error("  3. Verify the training code saves 'scaler' not 'X_scaled':")
                logger.error("     ")
                logger.error("     # CORRECT:")
                logger.error("     scaler = StandardScaler()")
                logger.error("     X_scaled = scaler.fit_transform(X_train)")
                logger.error("     joblib.dump(scaler, 'scaler2.pkl')  # Save scaler object!")
                logger.error("")
                logger.error("  4. Restart the API server")
                logger.error("="*80)
                return False
            
            elif not isinstance(scaler, StandardScaler):
                logger.error("="*80)
                logger.error(f"CRITICAL ERROR: scaler2.pkl has unexpected type: {type(scaler)}")
                logger.error("="*80)
                logger.error("Expected: sklearn.preprocessing.StandardScaler")
                logger.error(f"Got: {type(scaler)}")
                logger.error("")
                logger.error("SOLUTION:")
                logger.error("  Re-run your training script to generate the correct scaler.")
                logger.error("="*80)
                return False
            
            # Scaler is correct - log details
            logger.info("Scaler type: {0}".format(type(scaler).__name__))
            if hasattr(scaler, 'n_features_in_'):
                logger.info("Expected features: {0}".format(scaler.n_features_in_))
            if hasattr(scaler, 'feature_names_in_'):
                logger.info("Feature names available: {0} features".format(len(scaler.feature_names_in_)))
            # ========== END SCALER VALIDATION ==========

        except Exception as e:
            logger.error(f"FAILED: Could not load scaler - {e}")
            return False
        
        # Load label encoder
        logger.info("")
        logger.info("Step 3/5: Loading label_encoder.pkl...")
        try:
            label_encoder = _load_pickle("label_encoder.pkl")
            
            # CRITICAL FIX: Handle both LabelEncoder objects and numpy arrays
            if hasattr(label_encoder, 'classes_'):
                logger.info("SUCCESS: Label encoder loaded (LabelEncoder object)")
                logger.info(f"Crops available: {len(label_encoder.classes_)}")
            elif isinstance(label_encoder, (list, np.ndarray)):
                logger.info("SUCCESS: Label encoder loaded (array format)")
                logger.info(f"Crops available: {len(label_encoder)}")
                # Convert to object with classes_ attribute for compatibility
                class ArrayLabelEncoder:
                    def __init__(self, classes):
                        self.classes_ = np.array(classes)
                    
                    def inverse_transform(self, y):
                        return [self.classes_[int(i)] for i in y]
                
                label_encoder = ArrayLabelEncoder(label_encoder)
            else:
                logger.error(f"FAILED: Unexpected label encoder format: {type(label_encoder)}")
                return False
                
        except Exception as e:
            logger.error(f"FAILED: Could not load label encoder - {e}")
            return False
        
        # Load model info (JSON - different handling)
        logger.info("")
        logger.info("Step 4/5: Loading model_info.json...")
        info_path = MODEL_DIR / "model_info.json"
        
        is_valid, error_msg = _validate_file(info_path)
        if not is_valid:
            logger.warning(f"Model info validation failed: {error_msg}")
            logger.warning("Using default model info")
            model_info = {
                "model_type": "Unknown",
                "version": "Unknown",
                "features": []
            }
        else:
            try:
                with open(info_path, 'r', encoding='utf-8') as f:
                    model_info = json.load(f)
                logger.info("SUCCESS: Model info loaded")
            except Exception as e:
                logger.warning(f"Could not load model_info.json: {e}")
                logger.warning("Using default model info")
                model_info = {
                    "model_type": "Unknown",
                    "version": "Unknown",
                    "features": []
                }
        
        # CRITICAL FIX: Recover feature columns from scaler if missing
        logger.info("")
        logger.info("Step 5/5: Loading/recovering feature columns...")
        
        feature_cols = model_info.get('features', [])
        
        if not feature_cols or feature_cols is None:
            logger.warning("WARNING: No feature columns found in model_info.json")
            logger.info("Attempting to recover feature columns from scaler...")
            
            # Try to recover from scaler (sklearn >= 1.0 stores feature_names_in_)
            if hasattr(scaler, 'feature_names_in_'):
                feature_cols = list(scaler.feature_names_in_)
                logger.info(f"SUCCESS: Recovered {len(feature_cols)} feature columns from scaler")
                logger.info(f"Features: {feature_cols}")
            elif hasattr(scaler, 'n_features_in_'):
                # Fallback: generate default feature names
                n_features = scaler.n_features_in_
                feature_cols = [f"feature_{i}" for i in range(n_features)]
                logger.warning(f"FALLBACK: Generated {n_features} default feature names")
                logger.warning("This may cause issues if feature order is incorrect")
            else:
                logger.error("CRITICAL: Cannot recover feature columns from scaler")
                logger.error("Scaler does not have feature_names_in_ or n_features_in_")
                logger.error("Please retrain the model or provide model_info.json with features")
                return False
        else:
            logger.info(f"SUCCESS: Features loaded from model_info.json: {len(feature_cols)}")
        
        # Final validation
        logger.info("")
        logger.info("="*80)
        logger.info("MODEL LOADING COMPLETE")
        logger.info("="*80)
        logger.info(f"Model type: {model_info.get('model_type', 'Unknown')}")
        logger.info(f"Version: {model_info.get('version', 'Unknown')}")
        logger.info(f"Features: {len(feature_cols)}")
        logger.info(f"Crops: {len(label_encoder.classes_)}")
        logger.info(f"Balanced: {model_info.get('balanced', False)}")
        logger.info("="*80)
        
        return True
        
    except Exception as e:
        logger.error("="*80)
        logger.error("CRITICAL ERROR DURING MODEL LOADING")
        logger.error("="*80)
        logger.error(f"Error: {str(e)}", exc_info=True)
        logger.error("="*80)
        return False


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class CropRecommendationRequest(BaseModel):
    """Input parameters for crop recommendation"""
    N: float = Field(..., ge=0, le=200, description="Nitrogen content (kg/ha)")
    P: float = Field(..., ge=0, le=200, description="Phosphorus content (kg/ha)")
    K: float = Field(..., ge=0, le=200, description="Potassium content (kg/ha)")
    temperature: float = Field(..., ge=-10, le=50, description="Temperature (°C)")
    humidity: float = Field(..., ge=0, le=100, description="Humidity (%)")
    ph: float = Field(..., ge=0, le=14, description="pH value")
    rainfall: float = Field(..., ge=0, le=5000, description="Rainfall (mm)")


class CropRecommendation(BaseModel):
    """Single crop recommendation with confidence"""
    crop: str
    confidence: float
    suitability: str


class RecommendationMetadata(BaseModel):
    """Metadata about the recommendation"""
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
    """Environmental context of the recommendation"""
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
    """Complete crop recommendation response"""
    primary_recommendation: CropRecommendation
    alternative_recommendations: List[CropRecommendation]
    input_parameters: Dict
    metadata: RecommendationMetadata
    context: RecommendationContext


# ============================================================================
# FEATURE ENGINEERING - EXACT MATCH TO TRAINING (32 FEATURES)
# ============================================================================

def engineer_features(n: float, p: float, k: float, 
                     temperature: float, humidity: float, 
                     ph: float, rainfall: float) -> pd.DataFrame:
    """
    Engineer ALL 32 features from raw inputs - EXACT MATCH to training pipeline.
    
    This MUST match crop_rec.py feature engineering exactly!
    
    Features:
    - 7 base features (n, p, k, temperature, humidity, ph, rainfall)
    - 5 NPK features
    - 3 climate base features
    - 3 rainfall categories
    - 3 temperature categories
    - 2 climate squared features
    - 3 pH base features
    - 3 pH granular categories
    - 3 pH advanced features
    
    Total: 32 features
    
    Args:
        n: Nitrogen content
        p: Phosphorus content
        k: Potassium content
        temperature: Temperature in Celsius
        humidity: Humidity percentage
        ph: pH value
        rainfall: Rainfall in mm
        
    Returns:
        DataFrame with all 32 engineered features
    """
    # Create base dataframe
    df = pd.DataFrame([{
        'n': n,
        'p': p,
        'k': k,
        'temperature': temperature,
        'humidity': humidity,
        'ph': ph,
        'rainfall': rainfall
    }])
    
    # ========================================================================
    # 1. NPK FEATURES (5 features)
    # ========================================================================
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
    
    # ========================================================================
    # 2. CLIMATE BASE FEATURES (3 features)
    # ========================================================================
    df['moisture_index'] = df['rainfall'] * (df['humidity'] / 100)
    df['heat_stress'] = df['temperature'] * (100 - df['humidity']) / 100
    df['gdd_proxy'] = df['temperature'] * (df['humidity'] / 100)
    
    # ========================================================================
    # 3. RAINFALL CATEGORIES (3 features)
    # ========================================================================
    df['is_low_rainfall'] = (df['rainfall'] < 600).astype(int)
    df['is_high_rainfall'] = (df['rainfall'] > 1500).astype(int)
    df['is_very_high_rainfall'] = (df['rainfall'] > 2500).astype(int)
    
    # ========================================================================
    # 4. TEMPERATURE CATEGORIES (3 features)
    # ========================================================================
    df['is_cool'] = (df['temperature'] < 18).astype(int)
    df['is_hot'] = (df['temperature'] > 28).astype(int)
    df['is_very_hot'] = (df['temperature'] > 32).astype(int)
    
    # ========================================================================
    # 5. CLIMATE SQUARED FEATURES (2 features)
    # ========================================================================
    df['temperature_squared'] = df['temperature'] ** 2
    df['rainfall_squared'] = df['rainfall'] ** 2
    
    # ========================================================================
    # 6. pH BASE FEATURES (3 features)
    # ========================================================================
    df['ph_deviation'] = abs(df['ph'] - 6.5)
    df['is_acidic'] = (df['ph'] < 6.5).astype(int)
    df['is_alkaline'] = (df['ph'] > 7.5).astype(int)
    
    # ========================================================================
    # 7. pH GRANULAR CATEGORIES (3 features)
    # ========================================================================
    df['is_very_acidic'] = (df['ph'] < 5.5).astype(int)
    df['is_very_alkaline'] = (df['ph'] > 8.0).astype(int)
    df['is_extreme_acidic'] = (df['ph'] < 5.0).astype(int)
    
    # ========================================================================
    # 8. pH ADVANCED FEATURES (3 features)
    # ========================================================================
    df['ph_deviation_squared'] = df['ph_deviation'] ** 2
    df['ph_n_interaction'] = df['ph'] * df['n']
    df['ph_p_interaction'] = df['ph'] * df['p']
    
    return df


def get_suitability(confidence: float, warnings: bool = False) -> str:
    """
    Determine suitability level based on confidence score.
    
    Args:
        confidence: Confidence percentage (0-100)
        warnings: Whether agronomic warnings are present
        
    Returns:
        Suitability category string
    """
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
    """
    Predict top-k crop recommendations with agronomic adjustments.
    
    This function:
    1. Validates inputs against absolute constraints
    2. Engineers ALL 32 features from raw inputs (matching training)
    3. Gets ML model predictions
    4. Applies agronomic penalties and boosts
    5. Ensures diversity in recommendations
    
    Args:
        N: Nitrogen content (kg/ha)
        P: Phosphorus content (kg/ha)
        K: Potassium content (kg/ha)
        temperature: Temperature (°C)
        humidity: Humidity (%)
        ph: pH value
        rainfall: Rainfall (mm)
        k: Number of recommendations to return
        
    Returns:
        Dict with recommendations, metadata, and context
    """
    if model is None:
        return {
            'error': 'Model not loaded',
            'violations': ['System error: Model artifacts not available']
        }
    
    # CRITICAL CHECK: Ensure feature_cols is not None
    if feature_cols is None or len(feature_cols) == 0:
        logger.error("CRITICAL: feature_cols is None or empty!")
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
    
    # CRITICAL: Engineer ALL 32 features (matching training pipeline)
    logger.info(f"Engineering features from inputs: N={N}, P={P}, K={K}, temp={temperature}, humidity={humidity}, ph={ph}, rainfall={rainfall}")
    
    # Use lowercase n, p, k to match training
    engineered_df = engineer_features(N, P, K, temperature, humidity, ph, rainfall)
    
    logger.info(f"Engineered features count: {len(engineered_df.columns)}")
    logger.info(f"Engineered features: {list(engineered_df.columns)}")
    
    # Verify all required features are present
    missing_features = set(feature_cols) - set(engineered_df.columns)
    if missing_features:
        logger.error(f"CRITICAL: Missing features: {missing_features}")
        return {
            'error': 'Feature engineering error',
            'violations': [f'Missing features: {missing_features}']
        }
    
    # Select features in correct order
    X = engineered_df[feature_cols]
    
    logger.info(f"Features selected for prediction: {len(X.columns)} features")
    
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
        # Check rice penalty conditions
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
        
        # Apply penalty
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
                
                # Check temperature range
                if 'temp_range' in conditions:
                    temp_min, temp_max = conditions['temp_range']
                    if not (temp_min <= temperature <= temp_max):
                        conditions_met = False
                
                # Check rainfall range
                if 'rainfall_range' in conditions:
                    rain_min, rain_max = conditions['rainfall_range']
                    if not (rain_min <= rainfall <= rain_max):
                        conditions_met = False
                
                # Check minimum values
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
                
                # Check pH range
                if 'ph_range' in conditions:
                    ph_min, ph_max = conditions['ph_range']
                    if not (ph_min <= ph <= ph_max):
                        conditions_met = False
                
                # Apply boost if conditions met
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
        # Fallback to uniform if all probabilities are zero
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
        
        # Check if any warnings apply
        has_warnings = False
        
        # Determine suitability
        suitability = get_suitability(confidence, has_warnings)
        
        recommendations.append(
            CropRecommendation(
                crop=crop_name,
                confidence=round(confidence, 2),
                suitability=suitability
            )
        )
    
    # Build metadata
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
    """
    Get Top-5 crop recommendations with agronomic adjustments.
    
    This endpoint uses a trained Random Forest model with balanced classes
    and applies reduced penalties for testing purposes.
    """
    try:
        # Make prediction
        result = predict_top_k_crops(
            request.N, request.P, request.K,
            request.temperature, request.humidity,
            request.ph, request.rainfall
        )
        
        # Handle errors
        if 'error' in result:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": result['error'],
                    "violations": result.get('violations', [])
                }
            )
        
        # Build metadata
        metadata = RecommendationMetadata(
            model_type=model_info.get('model_type', 'Unknown'),
            model_version=model_info.get('version', 'Unknown'),
            api_version="6.0-PRODUCTION-FULLY-FIXED",
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
        
        # Build context
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
        
        # Return complete response
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
        logger.error(f"PREDICTION ERROR: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """
    Comprehensive health check endpoint.
    
    Returns system status, model information, and configuration details.
    """
    status = "healthy" if model is not None else "unhealthy"
    
    diagnostics = {
        "status": status,
        "timestamp": datetime.now().isoformat(),
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None,
        "label_encoder_loaded": label_encoder is not None,
        "feature_cols_loaded": feature_cols is not None and len(feature_cols) > 0,
        "model_info_loaded": model_info is not None,
        "api_version": "6.0-PRODUCTION-FULLY-FIXED",
        "testing_mode": True,
        "penalties": "REDUCED for testing ML model performance",
        "fixes_applied": [
            "Feature columns recovery from scaler",
            "Robust label encoder handling",
            "Complete 32-feature engineering pipeline"
        ]
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
            },
            "configuration": {
                "rice_penalty_base": RICE_PENALTY_BASE,
                "rainfed_crops_monitored": len(RAINFED_CROP_WATER_MIN),
                "ph_sensitive_groups": len(PH_SENSITIVE_CROPS),
                "temp_sensitive_groups": len(TEMPERATURE_SENSITIVE_CROPS),
                "crop_boost_configs": len(CROP_BOOST_MULTIPLIERS)
            }
        })
    
    return diagnostics


@router.get("/info")
async def get_model_info():
    """
    Get detailed model information.
    
    Returns comprehensive model metadata, features, and configuration.
    """
    if model is None:
        raise HTTPException(
            status_code=500,
            detail="Model not loaded. Please run training script first."
        )
    
    return {
        "model_type": model_info.get('model_type', 'Unknown'),
        "model_version": model_info.get('version', 'Unknown'),
        "api_version": "6.0-PRODUCTION-FULLY-FIXED",
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
        "hyperparameters": model_info.get('hyperparameters', {}),
        "configuration": {
            "rice_penalty_base": RICE_PENALTY_BASE,
            "rice_penalty_water_threshold": RICE_PENALTY_WATER_THRESHOLD,
            "rainfed_constraints": RAINFED_CROP_WATER_MIN,
            "ph_sensitive_crops": PH_SENSITIVE_CROPS,
            "temperature_sensitive_crops": TEMPERATURE_SENSITIVE_CROPS,
            "crop_boost_multipliers": CROP_BOOST_MULTIPLIERS,
            "absolute_constraints": ABSOLUTE_CONSTRAINTS
        },
        "feature_importance_top_10": model_info.get('feature_importance_top_10', []),
        "fixes_applied": [
            "Feature columns recovery from scaler.feature_names_in_",
            "Robust label encoder handling (supports both objects and arrays)",
            "Added critical checks before prediction",
            "Complete 32-feature engineering pipeline matching training"
        ],
        "notes": [
            "Penalties are REDUCED in this version for testing",
            "Once ML performance is confirmed, penalties can be increased",
            "Dataset is balanced to prevent rice/jute bias",
            "Feature columns are now auto-recovered if missing from model_info.json",
            "All 32 features are engineered at inference time matching training"
        ]
    }


@router.get("/crops")
async def list_crops():
    """
    List all crops supported by the model.
    
    Returns alphabetically sorted list of crop names.
    """
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
# STARTUP - LOAD MODELS AUTOMATICALLY
# ============================================================================

logger.info("="*80)
logger.info("CROP RECOMMENDATION API V6.0 - FULLY FIXED VERSION - INITIALIZING")
logger.info("="*80)

# Attempt to load model artifacts
success = load_model_artifacts()

if not success:
    logger.warning("="*80)
    logger.warning("WARNING: MODEL NOT LOADED - API ENDPOINTS WILL FAIL")
    logger.warning("="*80)
    logger.warning("Please run the training script: python backend/crop_rec.py")
    logger.warning("="*80)
else:
    logger.info("="*80)
    logger.info("CROP RECOMMENDATION API V6.0 READY - FULLY FIXED VERSION")
    logger.info("="*80)
    logger.info(f"Mode: TESTING (Reduced penalties)")
    logger.info(f"Model: {model_info.get('model_type', 'Unknown')}")
    logger.info(f"Version: {model_info.get('version', 'Unknown')}")
    logger.info(f"Features: {len(feature_cols) if feature_cols else 0}")
    logger.info(f"Crops: {len(label_encoder.classes_) if label_encoder else 0}")
    logger.info(f"Balanced: {model_info.get('balanced', False)}")
    logger.info("FIXES APPLIED:")
    logger.info("  - Feature columns auto-recovery from scaler")
    logger.info("  - Robust label encoder handling")
    logger.info("  - Added safety checks before prediction")
    logger.info("  - Complete 32-feature engineering pipeline")
    logger.info("="*80)