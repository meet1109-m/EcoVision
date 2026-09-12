"""
Industrial Leakage Model Training Pipeline.

Trains, evaluates, and exports the production XGBoost classifier on chronological
splits of the industrial leak telemetry dataset. Enforces zero target leakage.
"""
import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    classification_report,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from xgboost import XGBClassifier

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Ground truth target columns to strictly forbid from input features
TARGET_COLUMNS = [
    "incident_label",
    "risk_class",
    "risk_score",
    "leak_location",
    "leak_severity",
    "confirmed_by",
]

CATEGORICAL_FEATURES = [
    "equipment_type",
    "process_type",
    "fuel_or_material_type",
    "shift",
    "maintenance_status",
]

NUMERICAL_FEATURES = [
    "temperature_c",
    "pressure_bar",
    "flow_rate",
    "production_rate",
    "operating_hours",
    "equipment_age_years",
    "maintenance_due",
    "co2_ppm",
    "co_ppm",
    "nox_ppm",
    "so2_ppm",
    "voc_ppm",
    "ch4_ppm",
    "pm25_mg_m3",
    "ambient_temperature_c",
    "humidity_pct",
    "wind_speed_m_s",
    "pressure_deviation_pct",
    "flow_deviation_pct",
    "temperature_deviation_pct",
    "emission_above_baseline_pct",
    "rolling_mean",
    "rolling_std",
]

FEATURE_COLUMNS = CATEGORICAL_FEATURES + NUMERICAL_FEATURES

DEFAULT_DATASET_PATHS = [
    Path(__file__).resolve().parents[3] / "industrial_leak_training_v2.csv",
    Path("industrial_leak_training_v2.csv"),
    Path("../industrial_leak_training_v2.csv"),
]


def load_dataset(dataset_path: str = None) -> pd.DataFrame:
    """Load the dataset and sort chronologically."""
    if dataset_path and os.path.exists(dataset_path):
        target_path = Path(dataset_path)
    else:
        target_path = None
        for p in DEFAULT_DATASET_PATHS:
            if p.exists():
                target_path = p
                break
        if not target_path:
            raise FileNotFoundError(f"Could not find industrial_leak_training_v2.csv in search paths: {DEFAULT_DATASET_PATHS}")

    logger.info(f"Loading dataset from: {target_path}")
    df = pd.read_csv(target_path)
    
    # Process timestamp and sort chronologically
    df["dt"] = pd.to_datetime(df["timestamp"])
    df_sorted = df.sort_values("dt").reset_index(drop=True)
    
    # Cast boolean/binary fields
    if "maintenance_due" in df_sorted.columns:
        df_sorted["maintenance_due"] = df_sorted["maintenance_due"].astype(float)
        
    logger.info(f"Loaded {len(df_sorted)} rows spanning {df_sorted['dt'].min()} to {df_sorted['dt'].max()}")
    return df_sorted


def build_preprocessor() -> ColumnTransformer:
    """Build column transformer for numerical and categorical features."""
    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERICAL_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES),
        ]
    )


def train_and_evaluate(
    df: pd.DataFrame,
    test_ratio: float = 0.2,
    output_dir: str = None,
) -> Tuple[Pipeline, Dict[str, Any]]:
    """
    Splits data chronologically, fits the XGBoost pipeline, computes metrics,
    and returns the fitted pipeline and evaluation metadata.
    """
    split_idx = int(len(df) * (1.0 - test_ratio))
    train_df = df.iloc[:split_idx].copy()
    test_df = df.iloc[split_idx:].copy()

    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df["incident_label"]
    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df["incident_label"]

    y_test_binary = (y_test > 0).astype(int)

    logger.info(f"Chronological split: Train={len(train_df)} ({train_df['dt'].min()} to {train_df['dt'].max()}), Test={len(test_df)} ({test_df['dt'].min()} to {test_df['dt'].max()})")

    preprocessor = build_preprocessor()
    
    xgb_clf = XGBClassifier(
        n_estimators=150,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric="mlogloss",
        n_jobs=-1,
    )

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", xgb_clf),
    ])

    logger.info("Fitting XGBoost pipeline...")
    pipeline.fit(X_train, y_train)

    logger.info("Evaluating on chronological holdout test set...")
    preds = pipeline.predict(X_test)
    probas = pipeline.predict_proba(X_test)

    # Multiclass metrics
    acc = float(accuracy_score(y_test, preds))
    prec_weighted = float(precision_score(y_test, preds, average="weighted", zero_division=0))
    rec_weighted = float(recall_score(y_test, preds, average="weighted", zero_division=0))
    f1_weighted = float(f1_score(y_test, preds, average="weighted", zero_division=0))
    roc_auc_ovr = float(roc_auc_score(y_test, probas, multi_class="ovr"))
    cm = confusion_matrix(y_test, preds).tolist()

    # Binary incident detection metrics (incident_label > 0 vs == 0)
    preds_binary = (preds > 0).astype(int)
    incident_proba = 1.0 - probas[:, 0]  # Sum of classes 1, 2, 3
    acc_binary = float(accuracy_score(y_test_binary, preds_binary))
    prec_binary = float(precision_score(y_test_binary, preds_binary, zero_division=0))
    rec_binary = float(recall_score(y_test_binary, preds_binary, zero_division=0))
    f1_binary = float(f1_score(y_test_binary, preds_binary, zero_division=0))
    roc_auc_binary = float(roc_auc_score(y_test_binary, incident_proba))
    pr_auc_binary = float(average_precision_score(y_test_binary, incident_proba))

    # Feature importances extraction
    preprocessor_fitted = pipeline.named_steps["preprocessor"]
    cat_feature_names = preprocessor_fitted.named_transformers_["cat"].get_feature_names_out(CATEGORICAL_FEATURES).tolist()
    all_feature_names = NUMERICAL_FEATURES + cat_feature_names
    
    raw_importances = pipeline.named_steps["classifier"].feature_importances_
    feature_importance_list = [
        {"feature": name, "importance": round(float(imp) * 100.0, 4)}
        for name, imp in sorted(zip(all_feature_names, raw_importances), key=lambda x: x[1], reverse=True)
    ]

    metadata = {
        "model_type": "XGBoostClassifier",
        "model_version": "xgb-incident-v1.0",
        "split_strategy": "chronological",
        "train_samples": len(train_df),
        "test_samples": len(test_df),
        "train_time_range": [str(train_df["dt"].min()), str(train_df["dt"].max())],
        "test_time_range": [str(test_df["dt"].min()), str(test_df["dt"].max())],
        "classes": [0, 1, 2, 3],
        "class_mapping": {
            0: {"name": "normal", "severity": "none", "base_score": 10.0},
            1: {"name": "warning", "severity": "low", "base_score": 40.0},
            2: {"name": "leak_suspected", "severity": "medium", "base_score": 75.0},
            3: {"name": "critical", "severity": "critical", "base_score": 95.0},
        },
        "multiclass_metrics": {
            "accuracy": round(acc, 4),
            "precision_weighted": round(prec_weighted, 4),
            "recall_weighted": round(rec_weighted, 4),
            "f1_weighted": round(f1_weighted, 4),
            "roc_auc_ovr": round(roc_auc_ovr, 4),
            "confusion_matrix": cm,
        },
        "binary_metrics": {
            "accuracy": round(acc_binary, 4),
            "precision": round(prec_binary, 4),
            "recall": round(rec_binary, 4),
            "f1": round(f1_binary, 4),
            "roc_auc": round(roc_auc_binary, 4),
            "pr_auc": round(pr_auc_binary, 4),
        },
        "top_features": feature_importance_list[:10],
        "numerical_features": NUMERICAL_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "forbidden_leak_columns": TARGET_COLUMNS,
    }

    if output_dir:
        out_path = Path(output_dir)
        out_path.mkdir(parents=True, exist_ok=True)
        model_file = out_path / "model_pipeline.joblib"
        metadata_file = out_path / "model_metadata.json"

        logger.info(f"Saving model pipeline to {model_file}...")
        joblib.dump(pipeline, model_file)

        logger.info(f"Saving metadata to {metadata_file}...")
        with open(metadata_file, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

    return pipeline, metadata


if __name__ == "__main__":
    current_dir = Path(__file__).resolve().parent
    df_data = load_dataset()
    pipe, meta = train_and_evaluate(df_data, output_dir=str(current_dir))
    print("\n--- Training & Evaluation Complete ---")
    print("Multiclass Metrics:", json.dumps(meta["multiclass_metrics"], indent=2))
    print("Binary Metrics:", json.dumps(meta["binary_metrics"], indent=2))
