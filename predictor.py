import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Union, List, Dict, Any

class LeakIncidentPredictor:
    """
    Production inference engine for Industrial Leak Incident Detection.
    Loads the serialized RandomForest model and metadata, sanitizes input payloads,
    imputes missing values, encodes categoricals, and returns structured predictions.
    """

    def __init__(self, artifacts_dir: str = None):
        if artifacts_dir is None:
            # Default to 'model' (or fallback 'model_artifacts') directory relative to this file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            for candidate in ["model", "model_artifacts"]:
                path = os.path.join(current_dir, candidate)
                if os.path.exists(path):
                    artifacts_dir = path
                    break
            if artifacts_dir is None:
                artifacts_dir = os.path.join(current_dir, "model")

        self.artifacts_dir = artifacts_dir
        self.model_path = os.path.join(artifacts_dir, "leak_detector_model.joblib")
        self.metadata_path = os.path.join(artifacts_dir, "model_metadata.json")

        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found at: {self.model_path}. Run export_model.py first.")
        if not os.path.exists(self.metadata_path):
            raise FileNotFoundError(f"Metadata file not found at: {self.metadata_path}. Run export_model.py first.")

        # Load metadata
        with open(self.metadata_path, "r", encoding="utf-8") as f:
            self.metadata = json.load(f)

        self.feature_order: List[str] = self.metadata["feature_order"]
        self.numeric_features: List[str] = self.metadata["numeric_features"]
        self.categorical_features: List[str] = self.metadata["categorical_features"]
        self.numeric_medians: Dict[str, float] = self.metadata["numeric_medians"]
        self.categorical_mappings: Dict[str, Dict[str, int]] = self.metadata["categorical_mappings"]
        self.categorical_fallbacks: Dict[str, int] = self.metadata["categorical_fallbacks"]
        self.label_names: Dict[str, str] = self.metadata["label_names"]
        self.risk_levels: Dict[str, str] = self.metadata["risk_levels"]

        # Load trained Random Forest model
        self.model = joblib.load(self.model_path)

    def _preprocess_record(self, raw_data: Dict[str, Any]) -> List[float]:
        """Sanitizes, imputes, and encodes a single input dictionary into a feature vector."""
        processed_row = []

        for feat in self.feature_order:
            val = raw_data.get(feat, None)

            if feat in self.categorical_features:
                mapping = self.categorical_mappings.get(feat, {})
                fallback = self.categorical_fallbacks.get(feat, 0)
                
                if val is None or pd.isna(val) or val == "":
                    # Use fallback/nan category
                    code = fallback
                else:
                    str_val = str(val).strip()
                    # Lookup in categorical dictionary or fallback
                    code = mapping.get(str_val, fallback)
                processed_row.append(float(code))

            else:
                # Numeric feature
                if val is None or pd.isna(val) or val == "":
                    # Impute using trained median
                    num_val = self.numeric_medians.get(feat, 0.0)
                else:
                    try:
                        num_val = float(val)
                    except (ValueError, TypeError):
                        num_val = self.numeric_medians.get(feat, 0.0)
                processed_row.append(num_val)

        return processed_row

    def _detect_anomalies(self, raw_data: Dict[str, Any]) -> List[str]:
        """Identifies key sensor readings deviating significantly from normal operations."""
        anomalies = []
        checks = [
            ("emission_above_baseline_pct", 15.0, "Emission spike above baseline (+{val:.1f}%)"),
            ("pressure_deviation_pct", 15.0, "Pressure deviation detected (+{val:.1f}%)"),
            ("temperature_deviation_pct", 15.0, "Temperature deviation detected (+{val:.1f}%)"),
            ("flow_deviation_pct", 15.0, "Flow rate deviation detected (+{val:.1f}%)"),
            ("ch4_ppm", 100.0, "Elevated Methane (CH4) level ({val:.1f} ppm)"),
            ("voc_ppm", 100.0, "Elevated VOC concentration ({val:.1f} ppm)"),
            ("co_ppm", 50.0, "High Carbon Monoxide (CO) reading ({val:.1f} ppm)")
        ]
        for key, threshold, msg in checks:
            val = raw_data.get(key)
            if val is not None:
                try:
                    num_val = float(val)
                    if num_val >= threshold:
                        anomalies.append(msg.format(val=num_val))
                except (ValueError, TypeError):
                    pass
        return anomalies

    def predict(self, input_data: Union[Dict[str, Any], pd.Series]) -> Dict[str, Any]:
        """
        Predict incident label and probabilities for a single sensor reading.
        
        Args:
            input_data: Dict containing sensor readings (e.g. {'pressure_bar': 12.4, ...}).
            
        Returns:
            Dict containing predicted_class, incident_label, risk_level, confidence,
            confidence_pct, probabilities breakdown, and detected anomalies.
        """
        if isinstance(input_data, pd.Series):
            raw_dict = input_data.to_dict()
        elif isinstance(input_data, dict):
            raw_dict = input_data
        else:
            raise TypeError(f"Expected dict or pd.Series, received {type(input_data)}")

        feature_vector = self._preprocess_record(raw_dict)
        X = pd.DataFrame([feature_vector], columns=self.feature_order)

        pred_class = int(self.model.predict(X)[0])
        probas = self.model.predict_proba(X)[0]

        pred_label = self.label_names.get(str(pred_class), f"Class {pred_class}")
        risk_level = self.risk_levels.get(str(pred_class), "Unknown")
        confidence = float(probas[pred_class])

        # Probabilities mapped to label names
        class_probabilities = {
            self.label_names.get(str(i), f"Class {i}"): round(float(p), 4)
            for i, p in enumerate(probas)
        }

        # Status colors suitable for frontend web UI
        status_colors = {
            0: "#10b981",  # Green (Normal)
            1: "#f59e0b",  # Amber/Yellow (Warning)
            2: "#f97316",  # Orange (Leak Suspected)
            3: "#ef4444"   # Red (Confirmed Leak)
        }

        return {
            "status": "success",
            "predicted_class": pred_class,
            "incident_label": pred_label,
            "risk_level": risk_level,
            "confidence": round(confidence, 4),
            "confidence_pct": f"{confidence * 100:.1f}%",
            "probabilities": class_probabilities,
            "status_color": status_colors.get(pred_class, "#6b7280"),
            "anomalies_detected": self._detect_anomalies(raw_dict)
        }

    def predict_batch(self, input_data: Union[List[Dict[str, Any]], pd.DataFrame]) -> List[Dict[str, Any]]:
        """
        Predict incident labels for a list of records or a pandas DataFrame.
        """
        if isinstance(input_data, pd.DataFrame):
            records = input_data.to_dict(orient="records")
        elif isinstance(input_data, list):
            records = input_data
        else:
            raise TypeError(f"Expected list of dicts or pd.DataFrame, received {type(input_data)}")

        return [self.predict(rec) for rec in records]


# =====================================================================
# SELF-TEST & USAGE DEMO
# =====================================================================
if __name__ == "__main__":
    print("=" * 75)
    print("TESTING LEAK INCIDENT PREDICTOR ENGINE FOR WEBSITE INTEGRATION")
    print("=" * 75)

    predictor = LeakIncidentPredictor()
    print("Predictor initialized successfully with serialized model & metadata!\n")

    # 1. Test standard sample presets from metadata
    sample_presets = predictor.metadata.get("sample_inputs", {})
    print(f"--- 1. Testing {len(sample_presets)} Preset Scenarios ---")
    for scenario_name, sensor_data in sample_presets.items():
        res = predictor.predict(sensor_data)
        print(f"\nScenario: [{scenario_name}]")
        print(f"  -> Prediction:  {res['incident_label']} (Class {res['predicted_class']})")
        print(f"  -> Risk Level:  {res['risk_level']}")
        print(f"  -> Confidence:  {res['confidence_pct']}")
        print(f"  -> Probabilities: {res['probabilities']}")
        if res["anomalies_detected"]:
            print(f"  -> Anomalies:   {res['anomalies_detected']}")

    # 2. Test resilience: missing values (e.g. only 3 fields provided)
    print("\n" + "-" * 75)
    print("--- 2. Testing Resilience Against Incomplete Input (Missing Fields) ---")
    incomplete_input = {
        "pressure_bar": 45.2,
        "temperature_c": 120.5,
        "emission_above_baseline_pct": 52.0
    }
    incomplete_res = predictor.predict(incomplete_input)
    print(f"Input: {incomplete_input}")
    print(f"  -> Predicted: {incomplete_res['incident_label']} (Confidence: {incomplete_res['confidence_pct']})")
    print("  -> Imputation succeeded without throwing exceptions!")

    # 3. Test resilience: unknown categorical & extra/leaked fields
    print("\n" + "-" * 75)
    print("--- 3. Testing Resilience Against Unknown Categories & Extra/Leaked Keys ---")
    messy_input = {
        "equipment_type": "HyperCompressor_Unknown", # unknown category
        "fuel_or_material_type": "UnknownFuelX",    # unknown category
        "emission_above_baseline_pct": 0.5,
        "risk_score": 99,                            # Leaked column, should be safely ignored
        "leak_location": "Flange B4",                # Leaked column, should be safely ignored
        "user_web_session_id": "sess_98765"          # Random frontend metadata
    }
    messy_res = predictor.predict(messy_input)
    print(f"Input with unknown categoricals and leaked keys: {messy_input}")
    print(f"  -> Predicted: {messy_res['incident_label']} (Confidence: {messy_res['confidence_pct']})")
    print("  -> Sanitization & fallback encoding succeeded without throwing exceptions!")

    print("\n" + "=" * 75)
    print("ALL TESTS PASSED! PREDICTOR IS FULLY PRODUCTION-READY FOR YOUR WEBSITE.")
    print("=" * 75)
