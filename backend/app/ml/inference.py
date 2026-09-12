"""
ML Inference Engine for Industrial Telemetry Prediction.

Loads the serialized XGBoost pipeline and runs high-performance inference
with probability estimation, severity classification, and feature contribution.
"""
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional

import joblib
import numpy as np

from app.ml.feature_pipeline import prepare_input_dataframe

logger = logging.getLogger(__name__)

CURRENT_DIR = Path(__file__).resolve().parent
MODEL_PATH = CURRENT_DIR / "model_pipeline.joblib"
METADATA_PATH = CURRENT_DIR / "model_metadata.json"


class LeakPredictor:
    """Singleton predictor loading the trained pipeline and metadata."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LeakPredictor, cls).__new__(cls)
            cls._instance._pipeline = None
            cls._instance._metadata = None
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        if MODEL_PATH.exists():
            try:
                self._pipeline = joblib.load(MODEL_PATH)
                logger.info(f"Loaded ML model pipeline from {MODEL_PATH}")
            except Exception as e:
                logger.error(f"Error loading model pipeline from {MODEL_PATH}: {e}")
                self._pipeline = None
        else:
            logger.warning(f"Model file not found at {MODEL_PATH}. Prediction service will use fallback heuristic.")

        if METADATA_PATH.exists():
            try:
                with open(METADATA_PATH, "r", encoding="utf-8") as f:
                    self._metadata = json.load(f)
            except Exception as e:
                logger.error(f"Error loading metadata from {METADATA_PATH}: {e}")
                self._metadata = None

    @property
    def is_loaded(self) -> bool:
        return self._pipeline is not None

    @property
    def metadata(self) -> Dict[str, Any]:
        return self._metadata or {}

    @property
    def model_version(self) -> str:
        if self._metadata:
            return self._metadata.get("model_version", "xgb-incident-v1.0")
        return "xgb-incident-v1.0"

    def predict(self, feature_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs ML model inference on an input feature dictionary.
        Returns detailed predictions and probabilities.
        """
        df_input = prepare_input_dataframe(feature_data)

        if not self.is_loaded:
            # Fallback heuristic if model file is not present
            return self._fallback_prediction(feature_data)

        # 1. Model inference
        pred_array = self._pipeline.predict(df_input)
        proba_array = self._pipeline.predict_proba(df_input)[0]

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
        # Weighted expectation of class base scores
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
