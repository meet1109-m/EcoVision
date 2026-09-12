def test_process_readings_ingestion_and_pagination(client, seed_base_entities):
    payload = {
        "timestamp": "2026-01-20T13:45:00",
        "plant_id": "PLANT-A",
        "process_unit_id": "RX-01",
        "equipment_id": "RX-01-EQ795",
        "equipment_type": "Reactor",
        "process_type": "gas_processing",
        "temperature_c": 186.5,
        "pressure_bar": 14.12,
        "flow_rate": 129.2,
        "production_rate": 78.25,
        "operating_hours": 44397.0,
        "equipment_age_years": 21.6,
        "maintenance_due": False,
        "co2_ppm": 4400.5,
        "co_ppm": 18.37,
        "nox_ppm": 52.95,
        "so2_ppm": 22.53,
        "voc_ppm": 7.37,
        "ch4_ppm": 1.94,
        "pm25_mg_m3": 13.46,
        "fuel_or_material_type": "naphtha",
        "ambient_temperature_c": 39.1,
        "humidity_pct": 53.6,
        "wind_speed_m_s": 2.0,
        "shift": "Night",
        "maintenance_status": "ok",
        "pressure_deviation_pct": 0.86,
        "flow_deviation_pct": -13.86,
        "temperature_deviation_pct": 3.59,
        "emission_above_baseline_pct": 15.0,
        "rolling_mean": 13.078,
        "rolling_std": 0.931,
        "incident_label": 0,
        "risk_class": "normal",
        "risk_score": 7.0,
        "leak_location": "none",
        "leak_severity": "none",
        "confirmed_by": "sensor",
    }

    # Ingest reading
    resp = client.post("/readings", json=payload)
    assert resp.status_code == 201
    reading_id = resp.json()["id"]
    assert reading_id is not None

    # Query readings list
    list_resp = client.get("/readings?plant_id=PLANT-A&size=10")
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    assert list_data["total"] >= 1
    assert len(list_data["items"]) >= 1
    assert list_data["items"][0]["equipment_id"] == "RX-01-EQ795"

    # Get single reading detail
    detail_resp = client.get(f"/readings/{reading_id}")
    assert detail_resp.status_code == 200
    assert detail_resp.json()["temperature_c"] == 186.5
