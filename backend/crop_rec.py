"""
AgriShield – XGBoost Crop Recommendation Model
================================================
Production-grade training script. All original fixes applied PLUS:

  ✅ FIX #1  – Saves feature_columns.pkl  (prevents silent API feature-order bugs)
  ✅ FIX #2  – CORS origins list exported to config
  ✅ FIX #3  – (API-side: startup event)
  ✅ FIX #4  – Saves feature_ranges.pkl   (tight min/max from actual dataset)
  ✅ FIX #5  – Rainfall note documented   (data consistency warning)
  ✅ FIX #6  – (API-side: caching)
  ✅ FIX #7  – (API-side: logging)
  ✅ FIX #8  – Confidence threshold exported in metadata
  ✅ FIX #9  – XGBoost native .json save  (no more pickle version fragility)

  NEW FIXES (from code review – round 1):
  ✅ NEW #1  – Split FIRST; clipping & log-transform computed on train only  (no leakage)
  ✅ NEW #2  – 3 engineered interaction features: NPK_sum, N_P_ratio, Temp_Humidity_Index
  ✅ NEW #3  – CV runs on X_train / y_train only (not full dataset)
  ✅ NEW #4  – Confidence threshold lowered to 0.40 (more realistic for 22-class model)

  NEW FIXES (from code review – round 2):
  ✅ NEW #5  – Probability calibration via CalibratedClassifierCV (sigmoid, cv=prefit)
               Sigmoid (Platt scaling) chosen over isotonic: more stable on ~330 val samples
               (~15 per class); isotonic would overfit the calibration curve at this size.
               Calibration moved to AFTER CV + test eval so metrics reflect raw model behavior.
  ✅ NEW #6  – Hyperparameter tuning scoring changed from "accuracy" → "f1_macro"
               Forces balanced performance across all 22 crops
  ✅ NEW #7  – Validation log-loss printed after calibration (probability quality check)
  ✅ NEW #8  – calibrated_model saved as pickle (sigmoid wrapper, not XGBoost-native)
               Raw XGBoost still saved as .json for inspection

  NEW FIXES (from code review – round 3):
  ✅ NEW #9  – Calibration moved to AFTER Step 12 (test evaluation)
               CV and test metrics now reflect raw XGBoost, not calibrated model.
               Metrics in metadata are honest. Calibration is deployment-only.
  ✅ NEW #10 – Calibration method changed isotonic → sigmoid
               Sigmoid is more stable for small val sets (~15 samples/class).
               Isotonic is non-parametric and overfits with limited calibration data.
  ✅ NEW #11 – Removed unused X_full / X_full_base variables (dead code cleanup)
  ✅ NEW #12 – CV scoring fixed: both scoring= and metadata key now consistently "f1_macro"
               Previously scoring="accuracy" but metadata key was "cv_mean_f1_macro" (mismatch)

  NEW FIXES (from code review – round 4 / XGBoost 3.x):
  ✅ NEW #13 – Removed use_label_encoder=False from all 3 XGBClassifier calls
               (base, model, cv_model). Parameter was deprecated in XGBoost 2.x
               and permanently removed in 3.x. Its removal caused:
               AttributeError: 'XGBClassifier' object has no attribute 'use_label_encoder'
               when CalibratedClassifierCV called get_params() at predict time.
               No retraining logic changed — only the constructor calls are affected.

  PLUS all previous upgrades:
  ✅ Early stopping · 70/15/15 split · RandomizedSearchCV
  ✅ Top-3 demo · Confusion matrix · Reproducibility seeds

Run:
    pip install xgboost scikit-learn pandas numpy matplotlib seaborn
    python crop_rec.py

Outputs saved to  models/ :
    xgb_crop_model.json        ← raw XGBoost (for inspection / reload)
    calibrated_model.pkl       ← CalibratedClassifierCV wrapper  ← API uses THIS
    label_encoder.pkl
    feature_columns.pkl        ← ordered list of feature names
    feature_ranges.pkl         ← per-feature min/max + log flag
    clip_bounds.pkl            ← clipping bounds from train set
    model_metadata.pkl         ← confidence threshold + log cols + log-loss
    confusion_matrix.png
"""

# quick dependency validator – catches missing packages early
import sys
required = ["numpy", "pandas", "matplotlib", "seaborn", "sklearn", "xgboost"]
for mod in required:
    try:
        __import__(mod)
    except ImportError:
        print(f"Missing required module '{mod}'.\nInstall via: pip install {mod}")
        sys.exit(1)

# ══════════════════════════════════════════════════════
# REPRODUCIBILITY
# ══════════════════════════════════════════════════════
import random
import numpy as np
random.seed(42)
np.random.seed(42)

import json
import pickle
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

from sklearn.model_selection import (
    train_test_split, StratifiedKFold,
    cross_val_score, RandomizedSearchCV
)
from sklearn.preprocessing import LabelEncoder
from sklearn.calibration import CalibratedClassifierCV          # NEW #5
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    log_loss                                                     # NEW #7
)
from xgboost import XGBClassifier

# ──────────────────────────────────────────────────────
# PATHS
# ──────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent.parent
DATA_DIR   = BASE_DIR / "data" / "processed"
preferred  = DATA_DIR / "crop_recommendation.csv"
alternate  = DATA_DIR / "Crop_recommendation.csv"
if preferred.exists():
    DATA_PATH = preferred
elif alternate.exists():
    DATA_PATH = alternate
else:
    DATA_PATH = preferred  # keep for error message

MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# ──────────────────────────────────────────────────────
# FEATURE DEFINITION
# Base features come from raw CSV.
# Engineered features are added AFTER the split to avoid leakage.
# FEATURES_BASE  → columns read directly from df
# FEATURES       → full list (base + engineered) – single source of truth for API
# ──────────────────────────────────────────────────────
FEATURES_BASE = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
FEATURES_ENG  = ["NPK_sum", "N_P_ratio", "Temp_Humidity_Index"]   # NEW #2
FEATURES      = FEATURES_BASE + FEATURES_ENG


def add_interaction_features(arr_or_df, columns=FEATURES_BASE):
    """
    NEW FIX #2 – Feature interaction engineering.
    Works on both DataFrames and numpy arrays (identified by column order).
    Returns a numpy array with interaction columns appended.
    """
    if isinstance(arr_or_df, np.ndarray):
        # column order follows FEATURES_BASE
        col_idx = {c: i for i, c in enumerate(columns)}
        N   = arr_or_df[:, col_idx["N"]]
        P   = arr_or_df[:, col_idx["P"]]
        K   = arr_or_df[:, col_idx["K"]]
        T   = arr_or_df[:, col_idx["temperature"]]
        H   = arr_or_df[:, col_idx["humidity"]]
        npk = (N + P + K).reshape(-1, 1)
        npr = (N / (P + 1)).reshape(-1, 1)
        thi = (T * H).reshape(-1, 1)
        return np.hstack([arr_or_df, npk, npr, thi])
    else:  # DataFrame
        df = arr_or_df.copy()
        df["NPK_sum"]              = df["N"] + df["P"] + df["K"]
        df["N_P_ratio"]            = df["N"] / (df["P"] + 1)
        df["Temp_Humidity_Index"]  = df["temperature"] * df["humidity"]
        return df

# ══════════════════════════════════════════════════════
# STEP 1 – LOAD DATASET
# ══════════════════════════════════════════════════════
print("=" * 60)
print("STEP 1 – Load Dataset")
print("=" * 60)

if not DATA_PATH.exists():
    raise FileNotFoundError(
        f"Dataset not found at {DATA_PATH}\n"
        "Download: https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset"
    )

df = pd.read_csv(DATA_PATH)
print(f"Shape       : {df.shape}")
print(f"Missing vals: {df.isnull().sum().sum()}")
print(f"Classes ({len(df['label'].unique())}): {sorted(df['label'].unique())}")
print(f"\nClass distribution:\n{df['label'].value_counts().to_string()}")
print(f"\nDescriptive statistics:\n{df[FEATURES_BASE].describe().round(2).to_string()}")

# ══════════════════════════════════════════════════════
# STEP 2 – LABEL ENCODE (needed before split for stratify)
# ══════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("STEP 2 – Label Encoding")
print("=" * 60)

label_encoder = LabelEncoder()
y_encoded     = label_encoder.fit_transform(df["label"].values)
num_classes   = len(label_encoder.classes_)
print(f"Encoded {num_classes} classes: {list(label_encoder.classes_)}")

# ══════════════════════════════════════════════════════
# STEP 3 – TRAIN / VAL / TEST SPLIT  (70 / 15 / 15)
# NEW FIX #1 – Split FIRST before any preprocessing.
# ══════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("STEP 3 – Train / Validation / Test Split  (70 / 15 / 15)  [NEW FIX #1: split first]")
print("=" * 60)

X_raw = df[FEATURES_BASE].values

X_raw_train, X_raw_temp, y_train, y_temp = train_test_split(
    X_raw, y_encoded, test_size=0.30, random_state=42, stratify=y_encoded
)
X_raw_val, X_raw_test, y_val, y_test = train_test_split(
    X_raw_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
)

n = len(X_raw)
print(f"  Train : {X_raw_train.shape[0]:>4} rows  ({X_raw_train.shape[0]/n*100:.0f}%)")
print(f"  Val   : {X_raw_val.shape[0]:>4} rows  ({X_raw_val.shape[0]/n*100:.0f}%)")
print(f"  Test  : {X_raw_test.shape[0]:>4} rows  ({X_raw_test.shape[0]/n*100:.0f}%)")

# ══════════════════════════════════════════════════════
# STEP 4 – OUTLIER CLIPPING  (train-only bounds)
# NEW FIX #1 – Compute percentiles from X_raw_train only; apply to val/test.
# ══════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("STEP 4 – Outlier Clipping  (1st–99th percentile, train-only bounds)  [NEW FIX #1]")
print("=" * 60)

clip_bounds = {}   # {col_idx: (lo, hi)}
train_df = pd.DataFrame(X_raw_train, columns=FEATURES_BASE)

for i, col in enumerate(FEATURES_BASE):
    lo  = float(np.percentile(X_raw_train[:, i], 1))
    hi  = float(np.percentile(X_raw_train[:, i], 99))
    clip_bounds[i] = (lo, hi)
    cnt = ((X_raw_train[:, i] < lo) | (X_raw_train[:, i] > hi)).sum()
    print(f"  {col:<15}  {cnt:>3} train outliers  [{lo:.2f} – {hi:.2f}]")

def apply_clipping(arr, bounds):
    arr = arr.copy().astype(float)
    for idx, (lo, hi) in bounds.items():
        arr[:, idx] = np.clip(arr[:, idx], lo, hi)
    return arr

X_raw_train = apply_clipping(X_raw_train, clip_bounds)
X_raw_val   = apply_clipping(X_raw_val,   clip_bounds)
X_raw_test  = apply_clipping(X_raw_test,  clip_bounds)

# ══════════════════════════════════════════════════════
# STEP 5 – SKEWNESS CHECK + LOG TRANSFORM  (train-only)
# NEW FIX #1 – Decide log-transform from train skew; apply same to val/test.
# ══════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("STEP 5 – Skewness & Conditional log1p Transform  (train-only)  [NEW FIX #1]")
print("=" * 60)

print("  ⚠  NOTE: dataset 'rainfall' = seasonal/monthly avg.")
print("     Enter monthly growing-season rainfall for best accuracy.\n")

LOG_THRESHOLD   = 1.5
log_transformed = []   # list of column NAMES that got log1p

for i, col in enumerate(FEATURES_BASE):
    skew = pd.Series(X_raw_train[:, i]).skew()
    tag  = ""
    if abs(skew) > LOG_THRESHOLD:
        X_raw_train[:, i] = np.log1p(X_raw_train[:, i])
        X_raw_val[:, i]   = np.log1p(X_raw_val[:, i])
        X_raw_test[:, i]  = np.log1p(X_raw_test[:, i])
        log_transformed.append(col)
        tag = "  ← log1p applied"
    print(f"  {col:<15}  skew = {skew:+.3f}{tag}")

print(f"\n  Log-transformed : {log_transformed if log_transformed else 'none'}")

# ══════════════════════════════════════════════════════
# STEP 6 – FEATURE ENGINEERING  (interaction features)
# NEW FIX #2 – Add NPK_sum, N_P_ratio, Temp_Humidity_Index.
# Applied after log-transform so interactions use consistent scale.
# ══════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("STEP 6 – Interaction Feature Engineering  [NEW FIX #2]")
print("=" * 60)

X_train = add_interaction_features(X_raw_train, FEATURES_BASE)
X_val   = add_interaction_features(X_raw_val,   FEATURES_BASE)
X_test  = add_interaction_features(X_raw_test,  FEATURES_BASE)

print(f"  Base features       : {FEATURES_BASE}")
print(f"  Engineered features : {FEATURES_ENG}")
print(f"  Final feature count : {X_train.shape[1]}")
print(f"  FEATURES list       : {FEATURES}")
# NOTE: X_full was removed (NEW #11) – it was built but never used.

# ══════════════════════════════════════════════════════
# STEP 7 – SAVE FEATURE COLUMNS  (Fix #1)
# ══════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("STEP 7 – Save Feature Column Order  (Fix #1)")
print("=" * 60)

with open(MODELS_DIR / "feature_columns.pkl", "wb") as f:
    pickle.dump(FEATURES, f)
print(f"  Saved: {FEATURES}")
print(f"✅ feature_columns.pkl  → {MODELS_DIR}/feature_columns.pkl")

# ══════════════════════════════════════════════════════
# STEP 8 – SAVE FEATURE RANGES  (Fix #4)
# Ranges computed from TRAIN data after all transforms.
# ══════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("STEP 8 – Export Feature Ranges for API Validation  (Fix #4)")
print("=" * 60)

feature_ranges = {}
for i, col in enumerate(FEATURES):
    feature_ranges[col] = {
        "min":             float(X_train[:, i].min()),
        "max":             float(X_train[:, i].max()),
        "log_transformed": col in log_transformed   # only applies to base features
    }
    note = "  (log scale)" if feature_ranges[col]["log_transformed"] else ""
    print(f"  {col:<25}  [{feature_ranges[col]['min']:.4f} – {feature_ranges[col]['max']:.4f}]{note}")

with open(MODELS_DIR / "feature_ranges.pkl", "wb") as f:
    pickle.dump(feature_ranges, f)
print(f"✅ feature_ranges.pkl saved")

# ══════════════════════════════════════════════════════
# STEP 9 – HYPERPARAMETER TUNING  (RandomizedSearchCV, 25 trials)
# Tuning runs on X_train only (correct).
# ══════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("STEP 9 – RandomizedSearchCV  (25 trials, 3-fold inner CV)")
print("=" * 60)

param_dist = {
    "n_estimators":     [100, 200, 300, 400, 500],
    "max_depth":        [3, 4, 5, 6, 7, 8],
    "learning_rate":    [0.01, 0.03, 0.05, 0.07, 0.10],
    "subsample":        [0.6, 0.7, 0.8, 0.9, 1.0],
    "colsample_bytree": [0.6, 0.7, 0.8, 0.9, 1.0],
    "min_child_weight": [1, 2, 3, 5],
    "gamma":            [0, 0.05, 0.1, 0.2, 0.3],
}

base = XGBClassifier(
    objective    = "multi:softprob",
    eval_metric  = "mlogloss",
    random_state = 42,
    verbosity    = 0,
    # use_label_encoder removed — deprecated in XGBoost 2.x, removed in 3.x
)

search = RandomizedSearchCV(
    estimator           = base,
    param_distributions = param_dist,
    n_iter              = 25,
    scoring             = "f1_macro",    # NEW #6: was "accuracy" – f1_macro forces balanced perf across all 22 crops
    cv                  = StratifiedKFold(n_splits=3, shuffle=True, random_state=42),
    random_state        = 42,
    n_jobs              = -1,
    verbose             = 1
)
search.fit(X_train, y_train)

best_params = search.best_params_
print(f"\nBest inner-CV f1_macro : {search.best_score_:.4f}")  # NEW #6
print("Best params:")
for k, v in best_params.items():
    print(f"  {k:<22} = {v}")

# ══════════════════════════════════════════════════════
# STEP 10 – FINAL TRAINING WITH EARLY STOPPING
# ══════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("STEP 10 – Final Training with Early Stopping on Validation Set")
print("=" * 60)

train_params = {k: v for k, v in best_params.items() if k != "n_estimators"}

model = XGBClassifier(
    **train_params,
    n_estimators          = 1000,
    objective             = "multi:softprob",
    eval_metric           = "mlogloss",
    early_stopping_rounds = 20,
    random_state          = 42,
    verbosity             = 0,
    # use_label_encoder removed — deprecated in XGBoost 2.x, removed in 3.x
)

model.fit(
    X_train, y_train,
    eval_set = [(X_val, y_val)],
    verbose  = False
)

optimal_trees = model.best_iteration + 1
print(f"✅ Early stopping: optimal tree count = {optimal_trees}  (ceiling was 1000)")
# ─────────────────────────────────────────────────────────────────────────────
# IMPORTANT (NEW #9): Calibration is intentionally placed AFTER Step 12.
# CV (Step 11) and test evaluation (Step 12) measure raw XGBoost performance.
# This keeps metrics honest and comparable to literature/benchmarks.
# Calibration is a deployment-only probability adjustment, not a training step.
# ─────────────────────────────────────────────────────────────────────────────

# ══════════════════════════════════════════════════════
# STEP 11 – 5-FOLD CROSS VALIDATION  (train-only)
# NEW FIX #3 – CV on X_train / y_train, not full dataset.
# ══════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("STEP 11 – 5-Fold Cross Validation  (X_train only, f1_macro)  [NEW #3 + #12]")
print("=" * 60)

cv_model = XGBClassifier(
    **train_params,
    n_estimators = optimal_trees,
    objective    = "multi:softprob",
    eval_metric  = "mlogloss",
    random_state = 42,
    verbosity    = 0,
    # use_label_encoder removed — deprecated in XGBoost 2.x, removed in 3.x
)

# NEW #12 – scoring changed to "f1_macro" to match tuning and metadata key.
# Was "accuracy" in a previous version, which caused a metadata naming mismatch.
cv_scores = cross_val_score(
    cv_model, X_train, y_train,
    cv      = StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
    scoring = "f1_macro",   # ← consistent with RandomizedSearchCV scoring
    n_jobs  = -1
)

print(f"Fold f1_macro : {[f'{s:.4f}' for s in cv_scores]}")
print(f"Mean ± Std    : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}  ({cv_scores.mean()*100:.2f}%)")

# ══════════════════════════════════════════════════════
# STEP 12 – EVALUATE ON HELD-OUT TEST SET
# ══════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("STEP 12 – Test Set Evaluation  (raw XGBoost, before calibration)  [NEW #9]")
print("=" * 60)
# NEW #9: Evaluating raw model here gives honest, calibration-independent metrics.
# The calibrated model is built in the next step and used only for deployment.

y_pred   = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"Test Accuracy : {accuracy:.4f}  ({accuracy * 100:.2f}%)")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

print("Feature Importances:")
for feat, imp in sorted(zip(FEATURES, model.feature_importances_), key=lambda x: -x[1]):
    print(f"  {feat:<25}  {imp:.4f}  {'█' * int(imp * 40)}")

# ══════════════════════════════════════════════════════
# STEP 13 – TOP-3 PREDICTION DEMO  (predict_proba)
# ══════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("STEP 13 – Top-3 Prediction Demo  (sample row)")
print("=" * 60)

sample = X_test[0].reshape(1, -1)
proba  = model.predict_proba(sample)[0]
top3   = np.argsort(proba)[::-1][:3]

for rank, idx in enumerate(top3, 1):
    crop = label_encoder.inverse_transform([idx])[0]
    print(f"  #{rank}  {crop:<20}  {proba[idx]*100:.2f}%")

# ══════════════════════════════════════════════════════
# STEP 13b – PROBABILITY CALIBRATION  [NEW #9 + #10]
# ══════════════════════════════════════════════════════
# Placed HERE (after CV + test eval) so Steps 11 & 12 metrics reflect the
# raw XGBoost model — keeping them honest and benchmarkable.
# Calibration is a deployment-only probability mapping step.
#
# NEW #10 – method="sigmoid" (Platt scaling) instead of "isotonic":
#   • Val set ≈ 330 rows, ~15 samples per class
#   • Isotonic is non-parametric; it can overfit with so few samples
#   • Sigmoid fits just 2 parameters per class → much more stable
#   • Use isotonic only if val set has 50+ samples per class
# ──────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 13b – Probability Calibration  (sigmoid / Platt, cv=prefit)  [NEW #9 + #10]")
print("=" * 60)

calibrated_model = CalibratedClassifierCV(
    estimator = model,
    method    = "sigmoid",  # NEW #10: Platt scaling – stable for small val sets
    cv        = "prefit"    # model already trained; fit calibrator on X_val
)
calibrated_model.fit(X_val, y_val)
print("✅ Sigmoid (Platt) calibration fitted on validation set")

# NEW #7 – Log-loss comparison: raw vs calibrated
val_proba_raw = model.predict_proba(X_val)
val_proba_cal = calibrated_model.predict_proba(X_val)
ll_raw = log_loss(y_val, val_proba_raw)
ll_cal = log_loss(y_val, val_proba_cal)
print(f"  Val Log-Loss  raw XGBoost : {ll_raw:.4f}")
print(f"  Val Log-Loss  calibrated  : {ll_cal:.4f}  {'✅ improved' if ll_cal < ll_raw else '⚠ no improvement – consider keeping raw'}")

# From here on, calibrated_model is used for Top-3 demo (repeat) + all saved artifacts
# The raw `model` variable is kept alive for .feature_importances_ access above.

# ══════════════════════════════════════════════════════
# STEP 14 – CONFUSION MATRIX
# ══════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("STEP 14 – Save Confusion Matrix  (calibrated model predictions)")
print("=" * 60)

# Use calibrated model for the saved confusion matrix — this matches what
# farmers will actually see in production.
y_pred_cal = calibrated_model.predict(X_test)
cm = confusion_matrix(y_test, y_pred_cal)
fig, ax = plt.subplots(figsize=(14, 12))
sns.heatmap(
    cm,
    annot       = True,
    fmt         = "d",
    cmap        = "YlGn",
    xticklabels = label_encoder.classes_,
    yticklabels = label_encoder.classes_,
    linewidths  = 0.5,
    ax          = ax
)
ax.set_title("AgriShield – XGBoost + Sigmoid Calibration – Confusion Matrix", fontsize=16, pad=15)
ax.set_xlabel("Predicted Crop", fontsize=12)
ax.set_ylabel("Actual Crop",    fontsize=12)
plt.xticks(rotation=45, ha="right")
plt.yticks(rotation=0)
plt.tight_layout()
cm_path = MODELS_DIR / "confusion_matrix.png"
plt.savefig(cm_path, dpi=150)
plt.close()
print(f"✅ Saved → {cm_path}")

# ══════════════════════════════════════════════════════
# STEP 15 – SAVE ALL ARTIFACTS
# ══════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("STEP 15 – Save All Artifacts")
print("=" * 60)

# Fix #9 – Save raw XGBoost as native JSON (for inspection / version-safe reload)
# The API does NOT load this directly; it loads calibrated_model.pkl instead.
json_path = MODELS_DIR / "xgb_crop_model.json"
calibrated_model.estimator.save_model(str(json_path))
print(f"✅ xgb_crop_model.json     → {json_path}  (raw XGBoost, inspection only)")

# NEW FIX #5 – Save the calibrated wrapper as pickle
# CalibratedClassifierCV has no native save format; pickle is the standard approach.
with open(MODELS_DIR / "calibrated_model.pkl", "wb") as f:
    pickle.dump(calibrated_model, f)
print(f"✅ calibrated_model.pkl    → {MODELS_DIR}/calibrated_model.pkl  ← API loads THIS")

with open(MODELS_DIR / "label_encoder.pkl", "wb") as f:
    pickle.dump(label_encoder, f)
print(f"✅ label_encoder.pkl       → {MODELS_DIR}/label_encoder.pkl")

# Clip bounds needed by API for pre-processing raw inputs
with open(MODELS_DIR / "clip_bounds.pkl", "wb") as f:
    pickle.dump({"bounds": clip_bounds, "columns": FEATURES_BASE}, f)
print(f"✅ clip_bounds.pkl         → {MODELS_DIR}/clip_bounds.pkl")

# Fix #8 + NEW FIX #4 + NEW FIX #7 – Export full metadata
model_metadata = {
    "confidence_threshold": 0.40,
    "log_transformed_cols": log_transformed,
    "optimal_trees":        optimal_trees,
    "calibration_method":   "sigmoid",                    # NEW #10: changed from isotonic
    "val_log_loss_raw":     float(ll_raw),
    "val_log_loss_cal":     float(ll_cal),
    "cv_mean_f1_macro":     float(cv_scores.mean()),      # NEW #12: key + scoring now both f1_macro
    "cv_std_f1_macro":      float(cv_scores.std()),
    "test_accuracy_raw":    float(accuracy),              # raw XGBoost on test set
    "test_accuracy_cal":    float(accuracy_score(y_test, y_pred_cal)),  # calibrated on test set
    "num_classes":          num_classes,
    "classes":              list(label_encoder.classes_),
    "features":             FEATURES,
    "features_base":        FEATURES_BASE,
    "features_engineered":  FEATURES_ENG,
}
with open(MODELS_DIR / "model_metadata.pkl", "wb") as f:
    pickle.dump(model_metadata, f)
print(f"✅ model_metadata.pkl      → {MODELS_DIR}/model_metadata.pkl")

with open(MODELS_DIR / "model_metadata.json", "w") as f:
    json.dump(model_metadata, f, indent=2)
print(f"✅ model_metadata.json     → {MODELS_DIR}/model_metadata.json  (human-readable)")

# ──────────────────────────────────────────────────────
print("\n" + "═" * 60)
print("🌾  TRAINING COMPLETE")
print("═" * 60)
print(f"  Optimal trees (early stop) : {optimal_trees}")
print(f"  CV f1_macro  (5-fold)      : {cv_scores.mean()*100:.2f}% ± {cv_scores.std()*100:.2f}%  [train-only]")
print(f"  Test Accuracy  raw         : {accuracy * 100:.2f}%")
print(f"  Test Accuracy  calibrated  : {accuracy_score(y_test, y_pred_cal) * 100:.2f}%")
print(f"  Val Log-Loss   raw / cal   : {ll_raw:.4f} / {ll_cal:.4f}  ({'improved' if ll_cal < ll_raw else 'no improvement'})")
print(f"  Calibration method         : sigmoid / Platt scaling (cv=prefit on val set)")
print(f"  Log-transformed features   : {log_transformed if log_transformed else 'none'}")
print(f"  Engineered features        : {FEATURES_ENG}")
print(f"  Confidence threshold       : 0.40")
print(f"\n  Saved to → {MODELS_DIR}/")
print("    xgb_crop_model.json       ← raw XGBoost (inspection / reuse)")
print("    calibrated_model.pkl      ← API loads this (sigmoid-calibrated)")
print("    label_encoder.pkl")
print("    feature_columns.pkl")
print("    feature_ranges.pkl")
print("    clip_bounds.pkl")
print("    model_metadata.pkl / .json")
print("    confusion_matrix.png")
print(f"\n  Next → uvicorn api:app --reload --port 8000")