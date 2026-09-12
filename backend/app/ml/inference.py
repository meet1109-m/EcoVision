"""
ML Inference Engine for Industrial Telemetry Prediction.

Loads the production Random Forest incident detection model and metadata
to run high-performance inference with probability estimation, severity classification,
dynamic risk scoring, and feature explainability.
"""
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional

import warnings
import joblib
import numpy as np
import pandas as pd
from sklearn.exceptions import InconsistentVersionWarning

warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

logger = logging.getLogger(__name__)

CURRENT_DIR = Path(__file__).resolve().parent


def _clean_str(s: Any) -> str:
    """Normalize string for robust categorical lookup (handles case, spaces, underscores)."""
    return str(s).strip().lower().replace("_", "").replace(" ", "").replace("-", "")


class LeakPredictor:
    """Singleton predictor loading the trained leak detection model and metadata."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LeakPredictor, cls).__new__(cls)
            cls._instance._model = None
            cls._instance._metadata = None
            cls._instance._cat_lookup = {}
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        # Search candidate model paths
        model_candidates = [
            CURRENT_DIR / "leak_detector_model.joblib",
            CURRENT_DIR.parents[1] / "model" / "leak_detector_model.joblib",
            CURRENT_DIR / "model_pipeline.joblib",
            Path("model") / "leak_detector_model.joblib",
        ]

        model_path = None
        for p in model_candidates:
            if p.exists():
                model_path = p
                break

        if model_path:
            try:
                self._model = joblib.load(model_path)
                logger.info(f"Loaded ML model from {model_path}")
            except Exception as e:
                logger.error(f"Error loading model from {model_path}: {e}")
                self._model = None
        else:
            logger.warning(f"No model file found in search paths. Using fallback heuristic.")
            self._model = None

        # Search candidate metadata paths
        meta_candidates = [
            CURRENT_DIR / "model_metadata.json",
            CURRENT_DIR.parents[1] / "model" / "model_metadata.json",
            Path("model") / "model_metadata.json",
        ]

        meta_path = None
        for p in meta_candidates:
            if p.exists():
                meta_path = p
                break

        if meta_path:
            try:
                with open(meta_path, "r", encoding="utf-8") as f:
                    self._metadata = json.load(f)
                logger.info(f"Loaded ML metadata from {meta_path}")
                self._build_cat_lookup()
            except Exception as e:
                logger.error(f"Error loading metadata from {meta_path}: {e}")
                self._metadata = None
        else:
            self._metadata = None

    def _build_cat_lookup(self):
        """Constructs case-insensitive and alias-aware dictionary for categorical encodings."""
        self._cat_lookup = {}
        if not self._metadata or "categorical_mappings" not in self._metadata:
            return

        for col, mapping in self._metadata["categorical_mappings"].items():
            col_lookup = {}
            for val, code in mapping.items():
                col_lookup[_clean_str(val)] = int(code)

            # Common aliases
            if col == "maintenance_status":
                normal_code = mapping.get("Normal", 0)
                col_lookup["ok"] = normal_code
                col_lookup["good"] = normal_code
                col_lookup["pass"] = normal_code

            self._cat_lookup[col] = col_lookup

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    @property
    def metadata(self) -> Dict[str, Any]:
        return self._metadata or {}

    @property
    def model_version(self) -> str:
        if self._metadata:
            return self._metadata.get("model_version", "rf-incident-v1.0")
        return "rf-incident-v1.0"

    def _preprocess_input(self, feature_data: Dict[str, Any]) -> pd.DataFrame:
        """Preprocesses dictionary into feature vector matching model schema."""
        feature_order = self._metadata.get("feature_order", [])
        numeric_medians = self._metadata.get("numeric_medians", {})
        categorical_features = self._metadata.get("categorical_features", [])
        categorical_fallbacks = self._metadata.get("categorical_fallbacks", {})

        row = []
        for col in feature_order:
            val = feature_data.get(col, None)

            if col in categorical_features:
                fallback = categorical_fallbacks.get(col, 0)
                if val is None or pd.isna(val) or val == "":
                    code = fallback
                else:
                    clean_val = _clean_str(val)
                    lookup = self._cat_lookup.get(col, {})
                    code = lookup.get(clean_val, fallback)
                row.append(float(code))
            else:
                if val is None or pd.isna(val) or val == "":
                    num_val = numeric_medians.get(col, 0.0)
                else:
                    try:
                        num_val = float(val)
                    except (ValueError, TypeError):
                        num_val = numeric_medians.get(col, 0.0)
                row.append(num_val)

        return pd.DataFrame([row], columns=feature_order)

    def predict(self, feature_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs ML model inference on an input feature dictionary.
        Returns detailed predictions, probabilities, and risk metrics.
        """
        if not self.is_loaded:
            return self._fallback_prediction(feature_data)

        # 1. Feature Preprocessing
        if self._metadata and "feature_order" in self._metadata:
            df_input = self._preprocess_input(feature_data)
        else:
            from app.ml.feature_pipeline import prepare_input_dataframe
            df_input = prepare_input_dataframe(feature_data)

        # 2. Model Inference
        pred_array = self._model.predict(df_input)
        proba_array = self._model.predict_proba(df_input)[0]

        predicted_label = int(pred_array[0])
        class_mapping = {
            0: {"name": "normal", "severity": "none", "base_score": 10.0},
            1: {"name": "warning", "severity": "low", "base_score": 40.0},
            2: {"name": "leak_suspected", "severity": "medium", "base_score": 75.0},
            3: {"name": "critical", "severity": "critical", "base_score": 95.0},
        }

        class_info = class_mapping.get(predicted_label, class_mapping[0])

        # Probabilities
        class_probs = {str(i): round(float(proba_array[i]), 4) for i in range(len(proba_array))}

        # Incident probability: sum of all non-zero incident classes (1, 2, 3)
        incident_prob = round(float(1.0 - proba_array[0]), 4)
        if incident_prob < 0.0:
            incident_prob = 0.0

        # Confidence: probability of the predicted class
        confidence = round(float(proba_array[predicted_label]), 4)

        # Dynamic continuous risk score in [0.0, 100.0] based on probability distribution
        expected_risk_score = (
            proba_array[0] * 8.0
            + (proba_array[1] if len(proba_array) > 1 else 0) * 45.0
            + (proba_array[2] if len(proba_array) > 2 else 0) * 78.0
            + (proba_array[3] if len(proba_array) > 3 else 0) * 98.0
        )
        predicted_risk_score = round(float(np.clip(expected_risk_score, 0.0, 100.0)), 2)

        # Feature importance list from model metadata
        top_features = []
        if self._metadata and "top_features" in self._metadata:
            top_features = self._metadata["top_features"][:8]

        return {
            "predicted_incident_label": predicted_label,
            "is_incident": predicted_label > 0,
            "incident_probability": incident_prob,
            "class_probabilities": class_probs,
            "confidence": confidence,
            "predicted_risk_class": class_info["name"],
            "predicted_leak_severity": class_info["severity"],
            "predicted_risk_score": predicted_risk_score,
            "feature_importance": top_features,
            "model_version": self.model_version,
        }

    def _fallback_prediction(self, feature_data: Dict[str, Any]) -> Dict[str, Any]:
        """Baseline heuristic fallback if model artifact is unavailable."""
        emission = float(feature_data.get("emission_above_baseline_pct", 0.0))
        ch4 = float(feature_data.get("ch4_ppm", 0.0))
        voc = float(feature_data.get("voc_ppm", 0.0))

        if emission > 1000.0 or ch4 > 500.0 or voc > 200.0:
            pred_label = 3
            prob = 0.98
            risk_class = "critical"
            severity = "critical"
            score = 92.0
        elif emission > 100.0 or ch4 > 50.0 or voc > 50.0:
            pred_label = 2
            prob = 0.85
            risk_class = "leak_suspected"
            severity = "medium"
            score = 75.0
        elif emission > 25.0 or ch4 > 10.0:
            pred_label = 1
            prob = 0.65
            risk_class = "warning"
            severity = "low"
            score = 45.0
        else:
            pred_label = 0
            prob = 0.05
            risk_class = "normal"
            severity = "none"
            score = 12.0

        return {
            "predicted_incident_label": pred_label,
            "is_incident": pred_label > 0,
            "incident_probability": prob,
            "class_probabilities": {"0": round(1.0 - prob, 4), "1": prob},
            "confidence": 0.90,
            "predicted_risk_class": risk_class,
            "predicted_leak_severity": severity,
            "predicted_risk_score": score,
            "feature_importance": [
                {"feature": "emission_above_baseline_pct", "importance": 45.0},
                {"feature": "ch4_ppm", "importance": 25.0},
                {"feature": "voc_ppm", "importance": 15.0},
            ],
            "model_version": "heuristic-fallback-v1.0",
        }


# Singleton instance accessor
predictor = LeakPredictor()
