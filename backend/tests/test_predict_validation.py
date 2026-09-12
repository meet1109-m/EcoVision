from app.ml.feature_pipeline import validate_features_no_leakage, TARGET_COLUMNS, FEATURE_COLUMNS


def test_data_leakage_detector_unit():
    # Clean input
    clean_data = {
        "temperature_c": 185.0,
        "pressure_bar": 12.0,
        "co2_ppm": 4500.0,
        "flow_rate": 120.0,
    }
    is_clean, leaks = validate_features_no_leakage(clean_data)
    assert is_clean is True
    assert leaks == []

    # Leaked input
    leaked_data = {
        "temperature_c": 185.0,
        "incident_label": 1,
        "risk_class": "critical",
        "risk_score": 85.0,
    }
    is_clean, leaks = validate_features_no_leakage(leaked_data)
    assert is_clean is False
    assert "incident_label" in leaks
    assert "risk_class" in leaks
    assert "risk_score" in leaks


def test_predict_endpoint_valid_payload(client, seed_base_entities):
    valid_payload = {
        "reading": {
            "timestamp": "2026-01-20T13:45:00",
            "plant_id": "PLANT-A",
            "process_unit_id": "RX-01",
            "equipment_id": "RX-01-EQ795",
            "equipment_type": "Reactor",
            "process_type": "gas_processing",
            "temperature_c": 190.5,
            "pressure_bar": 14.8,
            "flow_rate": 135.0,
            "production_rate": 80.0,
            "operating_hours": 44000.0,
            "equipment_age_years": 21.0,
            "maintenance_due": False,
            "co2_ppm": 5500.0,
            "co_ppm": 19.0,
            "nox_ppm": 54.0,
            "so2_ppm": 24.0,
            "voc_ppm": 15.0,
            "ch4_ppm": 4.0,
            "pm25_mg_m3": 12.0,
            "fuel_or_material_type": "naphtha",
            "ambient_temperature_c": 35.0,
            "humidity_pct": 55.0,
            "wind_speed_m_s": 3.5,
            "shift": "Afternoon",
            "maintenance_status": "ok",
            "pressure_deviation_pct": 18.5,
            "flow_deviation_pct": -16.2,
            "temperature_deviation_pct": 4.1,
            "emission_above_baseline_pct": 32.0,
            "rolling_mean": 13.5,
            "rolling_std": 1.2,
        },
        "save_reading": True,
        "save_prediction": True,
    }

    resp = client.post("/predict", json=valid_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["plant_id"] == "PLANT-A"
    assert data["equipment_id"] == "RX-01-EQ795"
    assert data["predicted_risk_score"] > 0
    assert "predicted_risk_class" in data
    assert "confidence" in data
    assert len(data["rule_signals"]) >= 1
    assert len(data["feature_importance"]) >= 1
    assert data["prediction_id"] is not None
