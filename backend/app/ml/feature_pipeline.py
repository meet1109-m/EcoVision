"""
Feature Pipeline & Data Leakage Prevention Engine.

Guarantees strict separation between:
1. Operational input features observed prior to/during an event.
2. Ground truth target/outcome labels generated post-event.
"""
from typing import Dict, Any, Tuple, List, Union
import logging
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

# Target / Outcome Columns in industrial_leak_training_v2.csv
# THESE MUST NEVER BE USED AS PREDICTOR INPUTS
TARGET_COLUMNS = [
    "incident_label",
    "risk_class",
    "risk_score",
    "leak_location",
    "leak_severity",
    "confirmed_by",
]

# Categorical Features
CATEGORICAL_FEATURES = [
    "equipment_type",
    "process_type",
    "fuel_or_material_type",
    "shift",
    "maintenance_status",
]

# Numerical Features
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


def validate_features_no_leakage(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Scans an input dictionary for presence of ground truth target labels.
    Returns (is_clean, detected_leaks).
    """
    detected_leaks = [t for t in TARGET_COLUMNS if t in data and data[t] is not None]
    if detected_leaks:
        logger.warning(
            f"DATA LEAKAGE DETECTED: Features dictionary contains target labels: {detected_leaks}. "
            "These must be stripped prior to model inference."
        )
        return False, detected_leaks
    return True, []


def extract_feature_vector(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extracts only valid model input features, stripping any target labels.
    """
    clean_features = {}
    for col in FEATURE_COLUMNS:
        if col in data:
            clean_features[col] = data[col]
    return clean_features


def prepare_input_dataframe(data: Union[Dict[str, Any], List[Dict[str, Any]]]) -> pd.DataFrame:
    """
    Converts a single input dictionary or list of feature dictionaries into a
    cleaned pandas DataFrame matching the schema expected by the trained pipeline.
    """
    if isinstance(data, dict):
        records = [extract_feature_vector(data)]
    else:
        records = [extract_feature_vector(r) for r in data]

    df = pd.DataFrame(records)

    # Ensure all required features are present
    for col in NUMERICAL_FEATURES:
        if col not in df.columns:
            df[col] = 0.0
        else:
            if col == "maintenance_due":
                df[col] = df[col].astype(float)
            else:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

    for col in CATEGORICAL_FEATURES:
        if col not in df.columns:
            df[col] = "unknown"
        else:
            df[col] = df[col].astype(str).fillna("unknown")

    # Order columns exactly as during training
    return df[FEATURE_COLUMNS]
