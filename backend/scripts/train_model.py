"""
MediFlow AI — Model Training Script

Generates synthetic training data and trains the XGBoost triage classifier.
Run with: python -m scripts.train_model
"""

import os
import sys

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ml.triage_model import SYMPTOM_CATEGORIES, TRIAGE_LABELS


def generate_synthetic_data(n_samples: int = 5000, seed: int = 42) -> pd.DataFrame:
    """Generate synthetic patient records for triage model training."""
    rng = np.random.RandomState(seed)

    records = []
    for _ in range(n_samples):
        # Generate random symptom category scores
        features = {}
        for category in SYMPTOM_CATEGORIES:
            features[category] = rng.randint(0, 4)

        features["complaint_length"] = rng.randint(1, 20)
        features["symptoms_length"] = rng.randint(1, 50)

        # Vitals
        features["temperature"] = rng.normal(98.6, 2.0)
        features["heart_rate"] = rng.normal(72, 15)
        features["bp_systolic"] = rng.normal(120, 20)
        features["bp_diastolic"] = rng.normal(80, 12)
        features["respiratory_rate"] = rng.normal(16, 4)
        features["oxygen_saturation"] = rng.normal(98, 3)
        features["pain_scale"] = rng.randint(0, 11)

        # Determine triage level based on features
        triage = _rule_based_label(features)

        features["triage_level"] = triage
        records.append(features)

    return pd.DataFrame(records)


def _rule_based_label(features: dict) -> str:
    """Assign a triage level using a heuristic rule engine (ground truth)."""
    emergency = features.get("emergency_keywords", 0)
    cardiac = features.get("cardiac", 0)
    severe_pain = features.get("pain_severe", 0)
    respiratory = features.get("respiratory", 0)
    neurological = features.get("neurological", 0)
    trauma = features.get("trauma", 0)
    pain_scale = features.get("pain_scale", 3)

    # P1: immediate life-threatening
    if emergency > 0 or (cardiac > 0 and pain_scale >= 9):
        return "P1"

    # P2: emergency
    if cardiac > 0 or severe_pain > 0 or respiratory > 1:
        return "P2"

    # P3: urgent
    if trauma > 0 or neurological > 0 or pain_scale >= 7:
        return "P3"

    # P4: semi-urgent
    total_symptoms = sum(
        features.get(cat, 0) for cat in SYMPTOM_CATEGORIES
        if cat not in ("emergency_keywords", "cardiac", "pain_severe")
    )
    if total_symptoms >= 3 or pain_scale >= 4:
        return "P4"

    # P5: non-urgent
    return "P5"


def train_model(df: pd.DataFrame) -> tuple:
    """Train XGBoost classifier on synthetic data."""
    try:
        import xgboost as xgb
        print("[Train] Using XGBoost classifier")
    except ImportError:
        print("[Train] XGBoost not available, falling back to RandomForest")
        xgb = None

    feature_cols = list(SYMPTOM_CATEGORIES.keys()) + [
        "complaint_length", "symptoms_length",
        "temperature", "heart_rate", "bp_systolic", "bp_diastolic",
        "respiratory_rate", "oxygen_saturation", "pain_scale",
    ]

    X = df[feature_cols].values
    y = df["triage_level"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y,
    )

    print(f"[Train] Training samples: {len(X_train)}, Test samples: {len(X_test)}")
    print(f"[Train] Label distribution:\n{pd.Series(y).value_counts().to_string()}")

    if xgb is not None:
        model = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            objective="multi:softprob",
            num_class=5,
            eval_metric="mlogloss",
            random_state=42,
            use_label_encoder=False,
        )
    else:
        from sklearn.ensemble import RandomForestClassifier
        model = RandomForestClassifier(
            n_estimators=200,
            max_depth=10,
            random_state=42,
            class_weight="balanced",
        )

    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    print(f"\n[Train] Classification Report:")
    print(classification_report(y_test, y_pred, labels=TRIAGE_LABELS))

    return model, feature_cols


def main():
    print("=" * 60)
    print("MediFlow AI — Triage Model Training")
    print("=" * 60)

    # Generate data
    print("\n[1/3] Generating synthetic training data...")
    df = generate_synthetic_data(n_samples=5000)
    data_path = os.path.join("app", "ml", "data", "synthetic_triage.csv")
    os.makedirs(os.path.dirname(data_path), exist_ok=True)
    df.to_csv(data_path, index=False)
    print(f"[1/3] Saved {len(df)} records to {data_path}")

    # Train
    print("\n[2/3] Training triage classifier...")
    model, feature_cols = train_model(df)

    # Save model
    print("\n[3/3] Saving model to disk...")
    model_dir = os.path.join("app", "ml", "models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "triage_xgboost.joblib")
    joblib.dump(model, model_path)
    print(f"[3/3] Model saved to {model_path}")

    print("\n" + "=" * 60)
    print("Training complete! Model ready for inference.")
    print("=" * 60)


if __name__ == "__main__":
    main()
