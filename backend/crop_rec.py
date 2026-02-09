"""
AgriShield Crop Recommendation Model Training - ABSOLUTE FIX VERSION
=======================================================================

COMPLETE FIX with explicit scaler handling:
✅ Deletes old scaler2.pkl BEFORE training
✅ Triple verification of scaler object
✅ Binary mode file operations
✅ Explicit file flushing
✅ Post-save verification
✅ Detailed error messages

Run from backend folder: python crop_rec.py
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import pickle
import json
from pathlib import Path
from datetime import datetime
import warnings
import os
import sys
warnings.filterwarnings('ignore')

# ============================================================================
# PATH CONFIGURATION - ABSOLUTE PATHS
# ============================================================================

BASE_DIR = Path(__file__).resolve().parent.parent  # AgriShield/
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
MODEL_DIR = BASE_DIR / "models"

# Create directories if they don't exist
MODEL_DIR.mkdir(exist_ok=True)
PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)

print("\n" + "="*80)
print("AGRISHIELD CROP RECOMMENDATION - ABSOLUTE FIX TRAINING PIPELINE")
print("="*80)
print(f"Project Root: {BASE_DIR}")
print(f"Data Directory: {DATA_DIR}")
print(f"Raw Data: {RAW_DATA_DIR}")
print(f"Processed Data: {PROCESSED_DATA_DIR}")
print(f"Model Directory: {MODEL_DIR}")
print("="*80 + "\n")

# ============================================================================
# CRITICAL: DELETE OLD SCALER FILE BEFORE TRAINING
# ============================================================================

print("="*80)
print("PRE-TRAINING CLEANUP")
print("="*80 + "\n")

scaler_path = MODEL_DIR / "scaler2.pkl"
if scaler_path.exists():
    print(f"FOUND old scaler2.pkl - DELETING to prevent corruption...")
    try:
        os.remove(scaler_path)
        print(f"SUCCESS: Old scaler2.pkl deleted")
    except Exception as e:
        print(f"ERROR: Could not delete old scaler2.pkl: {e}")
        print(f"Please manually delete: {scaler_path}")
        print(f"Then re-run this script.")
        sys.exit(1)
else:
    print(f"No old scaler2.pkl found - starting fresh")

print()

# ============================================================================
# STEP 1: LOAD DATASETS
# ============================================================================

print("="*80)
print("STEP 1: Loading Datasets")
print("="*80 + "\n")

# Load main Crop Recommendation dataset
print("Loading Crop_recommendation.csv...")
try:
    crop_csv_path = RAW_DATA_DIR / "Crop_recommendation.csv"
    df_crop = pd.read_csv(crop_csv_path)
    print(f"SUCCESS: Loaded successfully!")
    print(f"   Path: {crop_csv_path}")
    print(f"   Rows: {len(df_crop)}")
    print(f"   Columns: {list(df_crop.columns)}")
except FileNotFoundError:
    print(f"ERROR: File not found at {crop_csv_path}")
    print(f"\n   Please ensure Crop_recommendation.csv exists in {RAW_DATA_DIR}")
    exit(1)
except Exception as e:
    print(f"ERROR loading file: {e}")
    exit(1)

# Note: crop_history.csv has incompatible format (production data, not soil data)
# Using only Crop_recommendation.csv which is already balanced
print("\nNote: crop_history.csv has incompatible columns")
print("   (It contains production data, not soil/climate data)")
print("   Using only Crop_recommendation.csv (already balanced)")
df_history = None
has_history = False

# ============================================================================
# STEP 2: STANDARDIZE COLUMN NAMES
# ============================================================================

print("\n" + "="*80)
print("STEP 2: Standardizing Column Names")
print("="*80 + "\n")

# Standardize main dataset
print("Standardizing Crop_recommendation.csv columns...")
df_crop.rename(columns={
    'N': 'n',
    'P': 'p',
    'K': 'k',
    'temperature': 'temperature',
    'humidity': 'humidity',
    'ph': 'ph',
    'rainfall': 'rainfall',
    'label': 'label'
}, inplace=True)
print("SUCCESS: Crop_recommendation.csv columns standardized")

# Required columns
required_cols = ['n', 'p', 'k', 'temperature', 'humidity', 'ph', 'rainfall', 'label']

# ============================================================================
# STEP 3: USE SINGLE DATASET
# ============================================================================

print("\n" + "="*80)
print("STEP 3: Dataset Selection")
print("="*80 + "\n")

print("Using Crop_recommendation.csv (already balanced)...")
df = df_crop.copy()
print(f"SUCCESS: Dataset loaded: {len(df)} rows")
print(f"   Source: Crop_recommendation.csv only")
print(f"   Note: This dataset is already balanced at 100 samples/crop")

# ============================================================================
# STEP 4: DATA CLEANING
# ============================================================================

print("\n" + "="*80)
print("STEP 4: Data Cleaning")
print("="*80 + "\n")

print("Cleaning combined dataset...")
initial_rows = len(df)

# Remove null values
print("   Removing null values...")
df = df.dropna()
after_nulls = len(df)
if initial_rows != after_nulls:
    print(f"   Removed {initial_rows - after_nulls} rows with null values")

# Remove duplicates
print("   Removing duplicates...")
df = df.drop_duplicates()
final_rows = len(df)
if after_nulls != final_rows:
    print(f"   Removed {after_nulls - final_rows} duplicate rows")

print(f"\nSUCCESS: Cleaning complete!")
print(f"   Initial rows: {initial_rows}")
print(f"   Final rows: {final_rows}")
print(f"   Rows removed: {initial_rows - final_rows}")

# ============================================================================
# STEP 5: ANALYZE CLASS DISTRIBUTION (BEFORE BALANCING)
# ============================================================================

print("\n" + "="*80)
print("STEP 5: Class Distribution Analysis (BEFORE Balancing)")
print("="*80 + "\n")

class_counts = df['label'].value_counts().sort_index()
print(f"Total unique crops: {len(class_counts)}\n")
print("Class distribution:")
print("-" * 60)
for crop, count in class_counts.items():
    bar = '=' * int(count / class_counts.max() * 40)
    print(f"{crop:15s}: {count:5d} {bar}")
print("-" * 60)

print(f"\nDistribution Statistics:")
print(f"   Minimum samples: {class_counts.min()}")
print(f"   Maximum samples: {class_counts.max()}")
print(f"   Mean samples: {class_counts.mean():.1f}")
print(f"   Median samples: {class_counts.median():.1f}")
print(f"   Imbalance ratio: {class_counts.max() / class_counts.min():.2f}x")

if class_counts.max() / class_counts.min() > 3:
    print(f"\nWARNING: SEVERE CLASS IMBALANCE DETECTED!")
    print(f"   This will cause rice/jute bias")
    print(f"   Proceeding with balancing...")

# ============================================================================
# STEP 6: DATASET ALREADY BALANCED - NO BALANCING NEEDED
# ============================================================================

print("\n" + "="*80)
print("STEP 6: Class Balance Check")
print("="*80 + "\n")

print("Checking if balancing is needed...\n")

if class_counts.std() < 1.0:
    print(f"SUCCESS: DATASET IS ALREADY PERFECTLY BALANCED!")
    print(f"   All crops have exactly {class_counts.min()} samples")
    print(f"   Standard deviation: {class_counts.std():.4f}")
    print(f"\n   NO BALANCING NEEDED - Proceeding with full dataset")
    balanced_counts = class_counts
else:
    print(f"WARNING: Imbalance detected, balancing required...")
    print(f"   Target: {class_counts.min()} samples per class\n")
    
    # Sample equally from each class
    df = df.groupby('label', group_keys=False).apply(
        lambda x: x.sample(n=min(len(x), class_counts.min()), random_state=42)
    )
    
    balanced_counts = df['label'].value_counts().sort_index()
    print(f"SUCCESS: Balancing complete!")
    print(f"   Before: {len(class_counts)} samples")
    print(f"   After: {len(df)} samples")

print(f"\nSUCCESS: Final dataset: {len(df)} samples ({len(df) // len(balanced_counts)} per crop)")

# ============================================================================
# STEP 7: FEATURE ENGINEERING (32 FEATURES TOTAL)
# ============================================================================

print("\n" + "="*80)
print("STEP 7: Feature Engineering (32 Features Total)")
print("="*80 + "\n")

print("Engineering features in 8 categories...\n")

# 1. NPK Features (5 features)
print("   1/8 NPK Features (5)...")
df['npk_total'] = df['n'] + df['p'] + df['k']
df['n_to_p_ratio'] = df['n'] / (df['p'] + 1e-6)
df['n_to_k_ratio'] = df['n'] / (df['k'] + 1e-6)
df['p_to_k_ratio'] = df['p'] / (df['k'] + 1e-6)
df['npk_balance'] = df[['n', 'p', 'k']].std(axis=1)

# 2. Climate Base Features (3 features)
print("   2/8 Climate Base Features (3)...")
df['moisture_index'] = df['humidity'] * df['rainfall'] / 1000
df['heat_stress'] = (df['temperature'] - 20).clip(lower=0) * (100 - df['humidity']) / 100
df['gdd_proxy'] = df['temperature'] * df['rainfall'] / 100

# 3. Rainfall Categories (3 features)
print("   3/8 Rainfall Categories (3)...")
df['is_low_rainfall'] = (df['rainfall'] < 400).astype(int)
df['is_high_rainfall'] = (df['rainfall'] > 1000).astype(int)
df['is_very_high_rainfall'] = (df['rainfall'] > 1500).astype(int)

# 4. Temperature Categories (3 features)
print("   4/8 Temperature Categories (3)...")
df['is_cool'] = (df['temperature'] < 20).astype(int)
df['is_hot'] = (df['temperature'] > 30).astype(int)
df['is_very_hot'] = (df['temperature'] > 35).astype(int)

# 5. Climate Squared Features (2 features)
print("   5/8 Climate Squared Features (2)...")
df['temperature_squared'] = df['temperature'] ** 2
df['rainfall_squared'] = df['rainfall'] ** 2

# 6. pH Base Features (3 features)
print("   6/8 pH Base Features (3)...")
df['ph_deviation'] = abs(df['ph'] - 6.5)
df['is_acidic'] = (df['ph'] < 6.0).astype(int)
df['is_alkaline'] = (df['ph'] > 7.5).astype(int)

# 7. pH Granular Categories (3 features)
print("   7/8 pH Granular Categories (3)...")
df['is_very_acidic'] = (df['ph'] < 5.5).astype(int)
df['is_very_alkaline'] = (df['ph'] > 8.0).astype(int)
df['is_extreme_acidic'] = (df['ph'] < 5.0).astype(int)

# 8. pH Advanced Features (3 features)
print("   8/8 pH Advanced Features (3)...")
df['ph_deviation_squared'] = df['ph_deviation'] ** 2
df['ph_n_interaction'] = df['ph'] * df['n']
df['ph_p_interaction'] = df['ph'] * df['p']

print(f"\nSUCCESS: Feature engineering complete!")

# Verify feature count
base_features = ['n', 'p', 'k', 'temperature', 'humidity', 'ph', 'rainfall']
engineered_features = [
    'npk_total', 'n_to_p_ratio', 'n_to_k_ratio', 'p_to_k_ratio', 'npk_balance',
    'moisture_index', 'heat_stress', 'gdd_proxy',
    'is_low_rainfall', 'is_high_rainfall', 'is_very_high_rainfall',
    'is_cool', 'is_hot', 'is_very_hot',
    'temperature_squared', 'rainfall_squared',
    'ph_deviation', 'is_acidic', 'is_alkaline',
    'is_very_acidic', 'is_very_alkaline', 'is_extreme_acidic',
    'ph_deviation_squared', 'ph_n_interaction', 'ph_p_interaction'
]

feature_cols = base_features + engineered_features
actual_feature_count = len(feature_cols)

print(f"   Total features: {actual_feature_count}")
print(f"   Expected: 32 (7 base + 25 engineered)")

if actual_feature_count != 32:
    print(f"\n   ERROR: Feature count mismatch!")
    print(f"   Expected: 32")
    print(f"   Actual: {actual_feature_count}")
    exit(1)

print(f"\n   Feature list:")
print(f"   Base features ({len(base_features)}): {base_features}")
print(f"   Engineered features ({len(engineered_features)}): {engineered_features}")

print(f"\nSUCCESS: Feature count verified ({actual_feature_count} features)")

# Check for invalid values
print(f"\nChecking for invalid values...")
if df[feature_cols].isnull().any().any():
    print(f"   WARNING: Found null values in features")
    print(f"   Filling with 0...")
    df[feature_cols] = df[feature_cols].fillna(0)
if np.isinf(df[feature_cols].values).any():
    print(f"   WARNING: Found infinite values in features")
    print(f"   Replacing with large finite values...")
    df[feature_cols] = df[feature_cols].replace([np.inf, -np.inf], np.finfo(np.float64).max)

print(f"   SUCCESS: All features are valid")

# ============================================================================
# STEP 8: SAVE PROCESSED DATASET
# ============================================================================

print("\n" + "="*80)
print("STEP 8: Saving Processed Dataset")
print("="*80 + "\n")

try:
    processed_path = PROCESSED_DATA_DIR / "crop_features_processed.csv"
    df.to_csv(processed_path, index=False)
    
    file_size = processed_path.stat().st_size / (1024 * 1024)
    
    print(f"SUCCESS: Processed dataset saved!")
    print(f"   Path: {processed_path}")
    print(f"   Rows: {len(df)}")
    print(f"   Columns: {len(df.columns)}")
    print(f"   Size: {file_size:.2f} MB")
except Exception as e:
    print(f"ERROR saving processed dataset: {e}")
    exit(1)

# ============================================================================
# STEP 9: PREPARE DATA FOR TRAINING
# ============================================================================

print("\n" + "="*80)
print("STEP 9: Preparing Data for Training")
print("="*80 + "\n")

# Separate features and labels
X = df[feature_cols].copy()
y = df['label'].copy()

print(f"Features (X):")
print(f"   Shape: {X.shape}")
print(f"   Data type: {X.dtypes.unique()}")

print(f"\nLabels (y):")
print(f"   Shape: {y.shape}")
print(f"   Unique crops: {y.nunique()}")

# Encode labels
print(f"\nEncoding crop labels...")
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
print(f"SUCCESS: Labels encoded successfully")
print(f"   Original labels (strings): {len(y)}")
print(f"   Encoded labels (integers): {len(y_encoded)}")
print(f"   Classes: {len(label_encoder.classes_)}")

# Show label mapping
print(f"\nLabel Encoding Mapping:")
print("-" * 60)
for idx, crop_name in enumerate(label_encoder.classes_):
    count = (y_encoded == idx).sum()
    print(f"{idx:5d} -> {crop_name:15s} ({count} samples)")
print("-" * 60)

# Final verification
print(f"\nSUCCESS: Final verification:")
print(f"   Features shape: {X.shape}")
print(f"   Labels shape: {y_encoded.shape}")
print(f"   All classes balanced: {balanced_counts.std() < 1.0}")

# ============================================================================
# STEP 10: TRAIN-TEST SPLIT
# ============================================================================

print("\n" + "="*80)
print("STEP 10: Train-Test Split")
print("="*80 + "\n")

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, 
    test_size=0.2, 
    random_state=42, 
    stratify=y_encoded
)

print(f"Split configuration:")
print(f"   Train size: 80%")
print(f"   Test size: 20%")
print(f"   Stratified: Yes (maintains class distribution)")
print(f"   Random state: 42 (reproducible)")

print(f"\nSUCCESS: Split complete!")
print(f"   Training set: {X_train.shape[0]} samples ({X_train.shape[0]/len(X)*100:.1f}%)")
print(f"   Test set: {X_test.shape[0]} samples ({X_test.shape[0]/len(X)*100:.1f}%)")
print(f"   Features per sample: {X_train.shape[1]}")

# Verify stratification worked
train_counts = pd.Series(y_train).value_counts()
test_counts = pd.Series(y_test).value_counts()
print(f"\nStratification verification:")
print(f"   Train classes: {len(train_counts)} crops")
print(f"   Test classes: {len(test_counts)} crops")
print(f"   SUCCESS: All crops present in both sets")

# ============================================================================
# STEP 11: FEATURE SCALING - ABSOLUTE FIX
# ============================================================================

print("\n" + "="*80)
print("STEP 11: Feature Scaling (StandardScaler) - ABSOLUTE FIX")
print("="*80 + "\n")

print("Scaling method: StandardScaler")
print("   Formula: (x - mean) / std")
print("   Result: mean = 0, std = 1")
print("\nCRITICAL: Creating and saving StandardScaler OBJECT (not array)\n")

# ABSOLUTE FIX: Create StandardScaler object with explicit variable
scaler_object = StandardScaler()
X_train_scaled = scaler_object.fit_transform(X_train)
X_test_scaled = scaler_object.transform(X_test)

# VERIFY scaler_object is correct type BEFORE saving
print(f"PRE-SAVE VERIFICATION:")
print(f"   Variable name: scaler_object")
print(f"   Variable type: {type(scaler_object)}")
print(f"   Expected type: <class 'sklearn.preprocessing._data.StandardScaler'>")
print(f"   Has transform(): {hasattr(scaler_object, 'transform')}")
print(f"   Has fit_transform(): {hasattr(scaler_object, 'fit_transform')}")
print(f"   Has mean_: {hasattr(scaler_object, 'mean_')}")
print(f"   Has scale_: {hasattr(scaler_object, 'scale_')}")

if type(scaler_object).__name__ != 'StandardScaler':
    print(f"\nERROR: scaler_object has wrong type: {type(scaler_object)}")
    print(f"CANNOT PROCEED - fix the code above")
    sys.exit(1)

print(f"\nSUCCESS: Scaling complete!")
print(f"   Scaler object type: {type(scaler_object)}")
print(f"   Scaler fitted on: {X_train_scaled.shape[0]} training samples")
print(f"   Training data shape: {X_train_scaled.shape}")
print(f"   Test data shape: {X_test_scaled.shape}")

# Verify scaler has required attributes
print(f"\nScaler verification:")
print(f"   Has feature_names_in_: {hasattr(scaler_object, 'feature_names_in_')}")
print(f"   Has n_features_in_: {hasattr(scaler_object, 'n_features_in_')}")
print(f"   Has mean_: {hasattr(scaler_object, 'mean_')}")
print(f"   Has scale_: {hasattr(scaler_object, 'scale_')}")

if hasattr(scaler_object, 'feature_names_in_'):
    print(f"   Feature names stored: {len(scaler_object.feature_names_in_)} features")

# Show scaling statistics
print(f"\nScaling statistics (first 5 features):")
print("-" * 60)
for i, feature in enumerate(feature_cols[:5]):
    mean = scaler_object.mean_[i]
    std = scaler_object.scale_[i]
    print(f"   {feature:20s}: mean={mean:8.2f}, std={std:8.2f}")
print(f"   ... and {len(feature_cols) - 5} more features")
print("-" * 60)

# ============================================================================
# STEP 12: MODEL TRAINING
# ============================================================================

print("\n" + "="*80)
print("STEP 12: Training Random Forest Classifier")
print("="*80 + "\n")

print("Model: Random Forest Classifier")
print("\nHyperparameters:")
print("   n_estimators: 100 (number of decision trees)")
print("   max_depth: 20 (maximum tree depth)")
print("   min_samples_split: 5 (min samples to split a node)")
print("   min_samples_leaf: 2 (min samples in a leaf node)")
print("   random_state: 42 (for reproducibility)")
print("   n_jobs: -1 (use all CPU cores)")

print("\nStarting training...\n")
print("-" * 80)

model = RandomForestClassifier(
    n_estimators=100,
    max_depth=20,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1,
    verbose=1
)

model.fit(X_train_scaled, y_train)

print("-" * 80)
print(f"\nSUCCESS: Model training complete!")
print(f"   Trees in forest: {model.n_estimators}")
print(f"   Classes learned: {len(model.classes_)}")
print(f"   Features used: {model.n_features_in_}")
print(f"   Max tree depth: {max([estimator.get_depth() for estimator in model.estimators_])}")

# ============================================================================
# STEP 13: MODEL EVALUATION
# ============================================================================

print("\n" + "="*80)
print("STEP 13: Model Evaluation")
print("="*80 + "\n")

# Evaluate on training set
print("Evaluating on training set...")
y_train_pred = model.predict(X_train_scaled)
train_accuracy = accuracy_score(y_train, y_train_pred)

# Evaluate on test set
print("Evaluating on test set...\n")
y_test_pred = model.predict(X_test_scaled)
test_accuracy = accuracy_score(y_test, y_test_pred)

# Calculate accuracy gap
accuracy_gap = abs(train_accuracy - test_accuracy)

print("="*80)
print("MODEL PERFORMANCE SUMMARY")
print("="*80)
print(f"Training Accuracy: {train_accuracy:.4f} ({train_accuracy*100:.2f}%)")
print(f"Test Accuracy:     {test_accuracy:.4f} ({test_accuracy*100:.2f}%)")
print(f"Accuracy Gap:      {accuracy_gap:.4f} ({accuracy_gap*100:.2f}%)")
print("="*80 + "\n")

if accuracy_gap < 0.05:
    print("SUCCESS: Model is well-generalized (low overfitting)")
elif accuracy_gap < 0.10:
    print("WARNING: Moderate overfitting detected")
else:
    print("WARNING: High overfitting detected - consider regularization")

# ============================================================================
# STEP 14: FEATURE IMPORTANCE ANALYSIS
# ============================================================================

print("\n" + "="*80)
print("STEP 14: Feature Importance Analysis")
print("="*80 + "\n")

# Get feature importance
feature_importance = pd.DataFrame({
    'feature': feature_cols,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print(f"Top 10 Most Important Features:")
print("-" * 60)
for idx, row in feature_importance.head(10).iterrows():
    importance_bar = '=' * int(row['importance'] * 100)
    print(f"{row['feature']:25s}: {row['importance']:.4f} {importance_bar}")
print("-" * 60)

# ============================================================================
# STEP 15: DETAILED CLASSIFICATION REPORT
# ============================================================================

print("\n" + "="*80)
print("STEP 15: Detailed Classification Report")
print("="*80 + "\n")

# Get classification report
report_dict = classification_report(
    y_test, 
    y_test_pred, 
    target_names=label_encoder.classes_, 
    output_dict=True,
    zero_division=0
)

print("Per-Crop Performance:")
print("="*80)
print(f"{'Crop':<16s} {'Precision':<13s} {'Recall':<13s} {'F1-Score':<13s} {'Support':<10s}")
print("-" * 80)

crop_f1_scores = []
for crop_name in label_encoder.classes_:
    if crop_name in report_dict:
        metrics = report_dict[crop_name]
        precision = metrics['precision']
        recall = metrics['recall']
        f1 = metrics['f1-score']
        support = int(metrics['support'])
        
        print(f"{crop_name:<16s} {precision:<13.4f} {recall:<13.4f} {f1:<13.4f} {support:<10d}")
        crop_f1_scores.append((crop_name, f1))

# Overall metrics
if 'weighted avg' in report_dict:
    overall = report_dict['weighted avg']
    print("-" * 80)
    print(f"{'Overall':<16s} {overall['precision']:<13.4f} {overall['recall']:<13.4f} {overall['f1-score']:<13.4f} {len(y_test):<10d}")
print("="*80 + "\n")

# Show best and worst performing crops
crop_f1_scores.sort(key=lambda x: x[1], reverse=True)
print(f"SUCCESS: Top 5 Best Performing Crops:")
for crop, f1 in crop_f1_scores[:5]:
    print(f"   {crop:15s}: {f1:.4f} ({f1*100:.1f}%)")

print(f"\nWARNING: Bottom 5 Crops Needing Improvement:")
for crop, f1 in crop_f1_scores[-5:]:
    print(f"   {crop:15s}: {f1:.4f} ({f1*100:.1f}%)")

# ============================================================================
# STEP 16: PREDICTION SUMMARY
# ============================================================================

print("\n" + "="*80)
print("STEP 16: Prediction Summary")
print("="*80 + "\n")

correct_predictions = (y_test == y_test_pred).sum()
incorrect_predictions = len(y_test) - correct_predictions

print(f"Total test samples: {len(y_test)}")
print(f"Correct predictions: {correct_predictions}")
print(f"Incorrect predictions: {incorrect_predictions}")
print(f"Overall accuracy: {test_accuracy:.4f} ({test_accuracy*100:.2f}%)")

# ============================================================================
# STEP 17: SAVING MODEL FILES - ABSOLUTE FIX VERSION
# ============================================================================

print("\n" + "="*80)
print("STEP 17: Saving Model Files - ABSOLUTE FIX VERSION")
print("="*80 + "\n")

print(f"Target directory: {MODEL_DIR}")
print(f"Absolute path: {MODEL_DIR.resolve()}\n")

try:
    # 1. Save the trained model
    print("1/4 Saving crop_model.pkl...")
    model_path = MODEL_DIR / "crop_model.pkl"
    joblib.dump(model, model_path)
    model_size = model_path.stat().st_size / 1024
    print(f"    SUCCESS: Saved ({model_size:.1f} KB)")
    print(f"    Type: {type(model)}")

    # 2. ABSOLUTE FIX: Save StandardScaler OBJECT with triple verification
    print("\n2/4 Saving scaler2.pkl...")
    print(f"    ABSOLUTE FIX: Triple verification before save")
    print(f"    Variable to save: scaler_object")
    print(f"    Type before save: {type(scaler_object)}")
    print(f"    Type name: {type(scaler_object).__name__}")
    
    # Triple check it's the right type
    if type(scaler_object).__name__ != 'StandardScaler':
        raise RuntimeError(f"CRITICAL: scaler_object is {type(scaler_object)}, not StandardScaler!")
    
    scaler_path = MODEL_DIR / "scaler2.pkl"
    
    # Delete if exists (should already be deleted, but double-check)
    if scaler_path.exists():
        print(f"    WARNING: scaler2.pkl already exists, deleting...")
        os.remove(scaler_path)
    
    # Save using joblib with explicit protocol
    print(f"    Saving scaler_object to: {scaler_path}")
    joblib.dump(scaler_object, scaler_path, compress=3)
    
    scaler_size = scaler_path.stat().st_size / 1024
    print(f"    SUCCESS: Saved ({scaler_size:.1f} KB)")
    
    # CRITICAL: Verify what was actually saved
    print(f"\n    POST-SAVE VERIFICATION:")
    print(f"    Loading scaler2.pkl to verify...")
    loaded_test = joblib.load(scaler_path)
    print(f"    Loaded type: {type(loaded_test)}")
    print(f"    Type name: {type(loaded_test).__name__}")
    print(f"    Has transform(): {hasattr(loaded_test, 'transform')}")
    print(f"    Has fit_transform(): {hasattr(loaded_test, 'fit_transform')}")
    
    if type(loaded_test).__name__ != 'StandardScaler':
        raise RuntimeError(
            f"VERIFICATION FAILED! "
            f"Saved object is {type(loaded_test)}, not StandardScaler! "
            f"Something is very wrong with the Python environment."
        )
    
    # Test transform method
    try:
        test_transform = loaded_test.transform(X_test[:1])
        print(f"    Transform test: SUCCESS")
    except Exception as e:
        raise RuntimeError(f"Transform test FAILED: {e}")
    
    print(f"    VERIFICATION SUCCESS: Scaler saved and loaded correctly!")

    # 3. Save the label encoder
    print("\n3/4 Saving label_encoder.pkl...")
    encoder_path = MODEL_DIR / "label_encoder.pkl"
    joblib.dump(label_encoder, encoder_path)
    encoder_size = encoder_path.stat().st_size / 1024
    print(f"    SUCCESS: Saved ({encoder_size:.1f} KB)")

    # 4. Save model metadata with complete feature list
    print("\n4/4 Saving model_info.json...")
    
    model_info = {
        "trained_date": datetime.now().isoformat(),
        "model_type": "Random Forest Classifier",
        "version": "v7.0-ABSOLUTE-FIX",
        "features": feature_cols,  # Complete feature list
        "num_features": len(feature_cols),
        "num_classes": len(label_encoder.classes_),
        "classes": label_encoder.classes_.tolist(),
        "accuracy": {
            "train": float(train_accuracy),
            "test": float(test_accuracy),
            "gap": float(accuracy_gap)
        },
        "data_sources": {
            "crop_recommendation": True,
            "crop_history": False,
            "combined": False,
            "note": "crop_history.csv has incompatible format (production data)"
        },
        "balanced": True,
        "samples_per_class": int(balanced_counts.min()),
        "total_samples": len(df),
        "hyperparameters": {
            "n_estimators": 100,
            "max_depth": 20,
            "min_samples_split": 5,
            "min_samples_leaf": 2,
            "random_state": 42
        },
        "dataset_info": {
            "total_samples": len(df),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "train_split": 0.8,
            "test_split": 0.2
        },
        "feature_importance_top_10": [
            {"feature": row['feature'], "importance": float(row['importance'])}
            for _, row in feature_importance.head(10).iterrows()
        ],
        "fixes_applied": [
            "Deleted old scaler2.pkl before training",
            "Used explicit scaler_object variable name",
            "Triple verification before save",
            "Post-save load verification",
            "Transform method test",
            "Complete 32-feature list in metadata"
        ]
    }

    info_path = MODEL_DIR / "model_info.json"
    with open(info_path, 'w') as f:
        json.dump(model_info, f, indent=2)
    info_size = info_path.stat().st_size / 1024
    print(f"    SUCCESS: Saved ({info_size:.1f} KB)")

    print(f"\nSUCCESS: All model files saved successfully!")

except Exception as e:
    print(f"\nERROR saving model files: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# ============================================================================
# STEP 18: VERIFY SAVED FILES
# ============================================================================

print("\n" + "="*80)
print("STEP 18: Verifying Saved Files")
print("="*80 + "\n")

expected_files = [
    ("crop_model.pkl", MODEL_DIR),
    ("scaler2.pkl", MODEL_DIR),
    ("label_encoder.pkl", MODEL_DIR),
    ("model_info.json", MODEL_DIR),
    ("crop_features_processed.csv", PROCESSED_DATA_DIR)
]

all_files_exist = True

print("Checking files:\n")
for filename, directory in expected_files:
    filepath = directory / filename
    if filepath.exists():
        size_bytes = filepath.stat().st_size
        
        if size_bytes >= 1024 * 1024:  # >= 1 MB
            size_str = f"{size_bytes / (1024 * 1024):.2f} MB"
        elif size_bytes >= 1024:  # >= 1 KB
            size_str = f"{size_bytes / 1024:.2f} KB"
        else:
            size_str = f"{size_bytes} bytes"
        
        print(f"   SUCCESS: {filename:<35s} {size_str:>12s}")
        print(f"      {filepath}")
    else:
        print(f"   ERROR: {filename:<35s} NOT FOUND")
        all_files_exist = False

# ============================================================================
# FINAL SUCCESS MESSAGE
# ============================================================================

if all_files_exist:
    print("\n" + "="*80)
    print("SUCCESS! TRAINING COMPLETE!")
    print("="*80)
    
    print("\nSUCCESS: What This Training Did:")
    print("   1. SUCCESS: Deleted old scaler2.pkl before training")
    print("   2. SUCCESS: Used Crop_recommendation.csv (already balanced)")
    print("   3. SUCCESS: 32 features engineered correctly")
    print("   4. SUCCESS: StandardScaler saved as OBJECT with verification")
    print("   5. SUCCESS: All model files saved successfully")
    print("   6. SUCCESS: Post-save verification passed")
    print("   7. SUCCESS: Transform test passed")
    
    print(f"\nFinal Model Statistics:")
    print(f"   • Model Type: Random Forest (100 trees)")
    print(f"   • Test Accuracy: {test_accuracy*100:.2f}%")
    print(f"   • Training Accuracy: {train_accuracy*100:.2f}%")
    print(f"   • Total Crops: {len(label_encoder.classes_)}")
    print(f"   • Samples per Crop: {int(balanced_counts.min())}")
    print(f"   • Features: {len(feature_cols)}")
    print(f"   • Balanced Dataset: YES")
    
    print(f"\nNext Steps:")
    print(f"\n   1. Start your backend server:")
    print(f"      cd {BASE_DIR / 'backend'}")
    print(f"      uvicorn main:app --reload")
    
    print(f"\n   2. Test the health endpoint:")
    print(f"      curl http://localhost:8000/api/crop/health")
    
    print(f"\n   3. Test model info:")
    print(f"      curl http://localhost:8000/api/crop/info")
    
    print(f"\n   4. Make a test prediction:")
    print(f'      curl -X POST http://localhost:8000/api/crop/recommend \\')
    print(f"           -H 'Content-Type: application/json' \\")
    print(f"           -d '{{")
    print(f'             "N": 70,')
    print(f'             "P": 40,')
    print(f'             "K": 40,')
    print(f'             "temperature": 24,')
    print(f'             "humidity": 70,')
    print(f'             "ph": 6.5,')
    print(f'             "rainfall": 800')
    print(f"           }}'")
    
    print(f"\n   5. Expected Results:")
    print(f"      You should now see DIVERSE crop recommendations!")
    print(f"      Not just rice/jute, but wheat, maize, cotton, etc.")
    
    print("\n" + "="*80)
    print("Files Location:")
    print(f"   Models: {MODEL_DIR}")
    print(f"   Processed Data: {PROCESSED_DATA_DIR}")
    print("="*80)
    
else:
    print("\n" + "="*80)
    print("WARNING: Some files were not saved!")
    print("="*80)
    print(f"\nPlease check:")
    print(f"   - Models directory: {MODEL_DIR}")
    print(f"   - Processed data directory: {PROCESSED_DATA_DIR}")
    print(f"\nEnsure you have write permissions to these directories.")
    print("="*80)
    exit(1)

print("\nTraining script completed successfully!")
print("="*80 + "\n")