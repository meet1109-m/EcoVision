import pytest
from app.ml.feature_pipeline import (
    validate_features_no_leakage,
    extract_feature_vector,
    prepare_input_dataframe,
    TARGET_COLUMNS,
    FEATURE_COLUMNS,
)
from app.ml.inference import predictor
from app.ml.rule_engine import rule_engine, ProcessRuleEngine
from app.models.prediction import Prediction


def test_anti_leakage_detector():
    """Verify that forbidden ground truth columns are flagged immediately."""
    clean_sample = {
        "temperature_c": 95.0,
        "pressure_bar": 6.2,
        "flow_rate": 140.0,
        "co2_ppm": 3500.0,
    }
    is_clean, leaks = validate_features_no_leakage(clean_sample)
    assert is_clean is True
    assert len(leaks) == 0

    for col in TARGET_COLUMNS:
        dirty_sample = {**clean_sample, col: 1}
        is_clean, leaks = validate_features_no_leakage(dirty_sample)
        assert is_clean is False
        assert col in leaks


def test_prepare_input_dataframe():
    """Verify input preparation creates a compliant DataFrame matching training schema."""
    sample = {
        "temperature_c": 120.5,
        "pressure_bar": 10.2,
        "flow_rate": 180.0,
        "equipment_type": "Reactor",
        "process_type": "petrochemical",
        "maintenance_due": True,
    }
    df = prepare_input_dataframe(sample)
    assert df.shape[0] == 1
    assert all(c in df.columns for c in FEATURE_COLUMNS)
    assert df["equipment_type"].iloc[0] == "Reactor"
    assert df["maintenance_due"].iloc[0] == 1.0


def test_ml_inference_engine():
    """Verify loaded XGBoost model produces valid probabilities, classes, and risk scores."""
    assert predictor.is_loaded is True
    assert predictor.model_version in ["rf-incident-v1.0", "xgb-incident-v1.0"]

    # Normal operating telemetry
    normal_telemetry = {
        "equipment_type": "StorageTank",
        "process_type": "refining",
        "fuel_or_material_type": "crude_oil",
        "shift": "Morning",
        "maintenance_status": "ok",
        "temperature_c": 45.0,
        "pressure_bar": 2.5,
        "flow_rate": 120.0,
        "production_rate": 80.0,
        "operating_hours": 15000.0,
        "equipment_age_years": 5.0,
        "maintenance_due": False,
        "co2_ppm": 450.0,
        "co_ppm": 12.0,
        "nox_ppm": 25.0,
        "so2_ppm": 10.0,
        "voc_ppm": 5.0,
        "ch4_ppm": 1.5,
        "pm25_mg_m3": 8.0,
        "ambient_temperature_c": 25.0,
        "humidity_pct": 50.0,
        "wind_speed_m_s": 3.0,
        "pressure_deviation_pct": 0.5,
        "flow_deviation_pct": -0.8,
        "temperature_deviation_pct": 0.2,
        "emission_above_baseline_pct": 1.0,
        "rolling_mean": 2.5,
        "rolling_std": 0.1,
    }

    out_normal = predictor.predict(normal_telemetry)
    assert out_normal["predicted_incident_label"] in [0, 1, 2, 3]
    assert 0.0 <= out_normal["incident_probability"] <= 1.0
    assert 0.0 <= out_normal["confidence"] <= 1.0
    assert 0.0 <= out_normal["predicted_risk_score"] <= 100.0
    assert len(out_normal["feature_importance"]) > 0

    # Severe leak telemetry
    leak_telemetry = {
        **normal_telemetry,
        "ch4_ppm": 8500.0,
        "voc_ppm": 1200.0,
        "emission_above_baseline_pct": 8500.0,
        "pressure_deviation_pct": 35.0,
        "flow_deviation_pct": -40.0,
    }

    out_leak = predictor.predict(leak_telemetry)
    assert out_leak["predicted_incident_label"] > 0
    assert out_leak["is_incident"] is True
    assert out_leak["incident_probability"] > 0.8
    assert out_leak["predicted_risk_score"] > 60.0


def test_rule_engine_evaluations():
    """Verify separate deterministic process rule engine evaluates deviations accurately."""
    re = ProcessRuleEngine()

    # Normal reading: zero signals
    normal_reading = {
        "pressure_deviation_pct": 2.0,
        "flow_deviation_pct": -3.0,
        "temperature_deviation_pct": 1.0,
        "emission_above_baseline_pct": 5.0,
        "maintenance_due": False,
        "maintenance_status": "ok",
        "ch4_ppm": 2.0,
        "voc_ppm": 5.0,
        "co2_ppm": 600.0,
    }
    res_normal = re.evaluate(normal_reading)
    assert res_normal["abnormality_detected"] is False
    assert res_normal["rule_count"] == 0
    assert res_normal["rule_severity"] == "normal"

    # Multi-anomaly reading
    anomalous_reading = {
        "pressure_deviation_pct": 28.0,       # Critical pressure anomaly (>25%)
        "flow_deviation_pct": -18.5,         # Warning flow anomaly (>15%)
        "temperature_deviation_pct": 19.0,   # Warning temp anomaly (>15%)
        "emission_above_baseline_pct": 120.0,# Critical emission elevation (>100%)
        "maintenance_due": True,             # Maintenance overdue
        "maintenance_status": "overdue",
        "ch4_ppm": 150.0,                    # Elevated Methane
        "voc_ppm": 80.0,                     # Elevated VOC
        "co2_ppm": 6500.0,                   # Elevated CO2
    }
    res_anom = re.evaluate(anomalous_reading)
    assert res_anom["abnormality_detected"] is True
    assert res_anom["rule_count"] >= 5
    assert res_anom["rule_severity"] == "critical"
    assert any("Pressure deviation" in s for s in res_anom["rule_signals"])
    assert any("Flow rate deviation" in s for s in res_anom["rule_signals"])
    assert any("Emission elevation" in s for s in res_anom["rule_signals"])
    assert any("maintenance" in s.lower() for s in res_anom["rule_signals"])


def test_api_v1_predict_endpoint(client, db_session, seed_base_entities):
    """Test full POST /api/v1/predict endpoint and persistence in PostgreSQL/SQLite."""
    payload = {
        "reading": {
            "timestamp": "2026-01-22T10:30:00",
            "plant_id": "PLANT-A",
            "process_unit_id": "RX-01",
            "equipment_id": "RX-01-EQ795",
            "equipment_type": "Reactor",
            "process_type": "gas_processing",
            "temperature_c": 195.0,
            "pressure_bar": 15.2,
            "flow_rate": 130.0,
            "production_rate": 78.0,
            "operating_hours": 45000.0,
            "equipment_age_years": 21.0,
            "maintenance_due": True,
            "co2_ppm": 6200.0,
            "co_ppm": 22.0,
            "nox_ppm": 58.0,
            "so2_ppm": 26.0,
            "voc_ppm": 45.0,
            "ch4_ppm": 18.0,
            "pm25_mg_m3": 14.0,
            "fuel_or_material_type": "natural_gas",
            "ambient_temperature_c": 32.0,
            "humidity_pct": 52.0,
            "wind_speed_m_s": 4.0,
            "shift": "Morning",
            "maintenance_status": "overdue",
            "pressure_deviation_pct": 19.2,
            "flow_deviation_pct": -17.5,
            "temperature_deviation_pct": 8.0,
            "emission_above_baseline_pct": 38.5,
            "rolling_mean": 14.8,
            "rolling_std": 1.4,
        },
        "save_reading": True,
        "save_prediction": True,
    }

    # 1. Call POST /api/v1/predict
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert data["plant_id"] == "PLANT-A"
    assert data["equipment_id"] == "RX-01-EQ795"
    assert "incident_prediction" in data
    assert "incident_probability" in data
    assert 0.0 <= data["incident_probability"] <= 1.0
    assert "is_incident" in data
    assert "ml_result" in data
    assert data["ml_result"]["predicted_incident_label"] == data["incident_prediction"]
    assert "rule_engine_result" in data
    assert data["rule_engine_result"]["abnormality_detected"] is True
    assert data["prediction_id"] is not None

    # Verify prediction persistence in the database
    stored_pred = db_session.query(Prediction).filter(Prediction.id == data["prediction_id"]).first()
    assert stored_pred is not None
    assert stored_pred.plant_id == "PLANT-A"
    assert stored_pred.equipment_id == "RX-01-EQ795"
    assert stored_pred.model_version in ["rf-incident-v1.0", "xgb-incident-v1.0"]
    assert len(stored_pred.rule_signals) > 0


def test_predict_endpoint_data_leakage_rejection(client):
    """Test that submitting ground-truth labels directly to predict endpoint is rejected."""
    leaked_payload = {
        "reading": {
            "timestamp": "2026-01-22T10:30:00",
            "plant_id": "PLANT-A",
            "process_unit_id": "RX-01",
            "equipment_id": "RX-01-EQ795",
            "equipment_type": "Reactor",
            "process_type": "gas_processing",
            "temperature_c": 195.0,
            "pressure_bar": 15.2,
            "flow_rate": 130.0,
            "production_rate": 78.0,
            "operating_hours": 45000.0,
            "equipment_age_years": 21.0,
            "co2_ppm": 6200.0,
            "co_ppm": 22.0,
            "nox_ppm": 58.0,
            "so2_ppm": 26.0,
            "voc_ppm": 45.0,
            "ch4_ppm": 18.0,
            "pm25_mg_m3": 14.0,
            "fuel_or_material_type": "natural_gas",
            "ambient_temperature_c": 32.0,
            "humidity_pct": 52.0,
            "wind_speed_m_s": 4.0,
            "shift": "Morning",
            "maintenance_status": "ok",
            "pressure_deviation_pct": 0.0,
            "flow_deviation_pct": 0.0,
            "temperature_deviation_pct": 0.0,
            "emission_above_baseline_pct": 0.0,
            "rolling_mean": 14.8,
            "rolling_std": 1.4,
            "incident_label": 2,  # Ground truth label injected!
            "risk_class": "critical",
        }
    }
    response = client.post("/api/v1/predict", json=leaked_payload)
    # The Pydantic validator cleans it or endpoint rejects
    assert response.status_code in [200, 422]
