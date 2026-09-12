from datetime import datetime, timezone
import pytest
from app.models.plant import Plant
from app.models.process_unit import ProcessUnit
from app.models.equipment import Equipment
from app.models.process_reading import ProcessReading
from app.models.prediction import Prediction
from app.models.incident import Incident
from app.models.hotspot import Hotspot
from app.models.recommendation import Recommendation
from app.models.action import Action
from app.models.simulation import Simulation
from app.models.user import User
from scripts.seed_csv import seed_database


def test_all_11_database_models_relational_integrity(db_session):
    """Verify schema constraints, primary keys, and foreign keys across all 11 tables."""
    # 1. Plant
    plant = Plant(
        id="PLANT-TEST",
        name="Test Refinery Plant",
        location="Sector-9",
        industry_type="Refining",
        production_capacity="1000 t/m",
        is_active=True,
    )
    db_session.add(plant)
    db_session.commit()

    # 2. User
    user = User(
        email="test_user@ecovision.io",
        hashed_password="hashed_secret",
        full_name="Test Operator",
        role="operator",
        plant_id="PLANT-TEST",
    )
    db_session.add(user)
    db_session.commit()

    # 3. Process Unit
    unit = ProcessUnit(
        id="UNIT-TEST",
        plant_id="PLANT-TEST",
        name="Distillation Unit",
        unit_type="Separation",
        description="Atmospheric distillation tower",
    )
    db_session.add(unit)
    db_session.commit()

    # 4. Equipment
    eq = Equipment(
        id="EQ-TEST-01",
        process_unit_id="UNIT-TEST",
        plant_id="PLANT-TEST",
        equipment_type="Separator",
        process_type="refining",
        equipment_age_years=8.5,
        maintenance_status="ok",
    )
    db_session.add(eq)
    db_session.commit()

    # 5. Process Reading
    reading = ProcessReading(
        timestamp=datetime.now(timezone.utc),
        plant_id="PLANT-TEST",
        process_unit_id="UNIT-TEST",
        equipment_id="EQ-TEST-01",
        equipment_type="Separator",
        process_type="refining",
        temperature_c=140.0,
        pressure_bar=8.5,
        flow_rate=110.0,
        production_rate=80.0,
        operating_hours=12000.0,
        equipment_age_years=8.5,
        maintenance_due=False,
        co2_ppm=2200.0,
        co_ppm=14.0,
        nox_ppm=35.0,
        so2_ppm=18.0,
        voc_ppm=25.0,
        ch4_ppm=12.0,
        pm25_mg_m3=10.0,
        fuel_or_material_type="crude_oil",
        ambient_temperature_c=28.0,
        humidity_pct=45.0,
        wind_speed_m_s=3.0,
        shift="Morning",
        maintenance_status="ok",
        pressure_deviation_pct=2.0,
        flow_deviation_pct=-1.5,
        temperature_deviation_pct=0.5,
        emission_above_baseline_pct=4.0,
        rolling_mean=8.5,
        rolling_std=0.2,
        incident_label=0,
        risk_class="normal",
        risk_score=15.0,
    )
    db_session.add(reading)
    db_session.commit()

    # 6. Prediction
    pred = Prediction(
        reading_id=reading.id,
        plant_id="PLANT-TEST",
        equipment_id="EQ-TEST-01",
        incident_prediction=0,
        incident_probability=0.05,
        predicted_risk_score=15.0,
        predicted_risk_class="normal",
        predicted_leak_severity="none",
        predicted_leak_location="Separator_sensor",
        confidence=0.95,
        feature_importance=[{"feature": "co2_ppm", "importance": 12.0}],
        model_version="xgb-incident-v1.0",
    )
    db_session.add(pred)
    db_session.commit()

    # 7. Incident
    incident = Incident(
        plant_id="PLANT-TEST",
        equipment_id="EQ-TEST-01",
        reading_id=reading.id,
        prediction_id=pred.id,
        incident_label=1,
        risk_class="warning",
        risk_score=45.0,
        leak_severity="low",
        leak_location="flange_seal",
        confirmed_by="sensor",
        status="OPEN",
    )
    db_session.add(incident)
    db_session.commit()

    # 8. Hotspot
    hotspot = Hotspot(
        id="HS-TEST-01",
        plant_id="PLANT-TEST",
        equipment_id="EQ-TEST-01",
        equipment_name="Separator",
        risk_score=75.0,
        status="HIGH",
        probability=68.0,
        emission=95.0,
        probable_cause="Seal leakage",
        detected_signals=["Pressure loss"],
        recommended_action="Tighten seal",
    )
    db_session.add(hotspot)
    db_session.commit()

    # 9. Recommendation
    rec = Recommendation(
        id="REC-TEST-01",
        plant_id="PLANT-TEST",
        equipment_id="EQ-TEST-01",
        title="Flange Seal Replacement",
        description="Replace worn mechanical seals",
        co2_reduction=25.0,
        cost_reduction=12.0,
        environmental=88.0,
        economic=80.0,
        circularity=75.0,
        feasibility=95.0,
        priority="HIGH",
    )
    db_session.add(rec)
    db_session.commit()

    # 10. Action
    action = Action(
        id="ACT-TEST-01",
        plant_id="PLANT-TEST",
        equipment_id="EQ-TEST-01",
        recommendation_id="REC-TEST-01",
        assigned_to_user_id=user.id,
        title="Schedule Seal Replacement",
        priority="HIGH",
        impact=30.0,
        estimated_cost=1500.0,
        feasibility=90.0,
        status="PENDING",
        description="Inspect and swap seal",
    )
    db_session.add(action)
    db_session.commit()

    # 11. Simulation
    sim = Simulation(
        plant_id="PLANT-TEST",
        user_id=user.id,
        name="Decarbonization Scenario A",
        production_rate=85.0,
        temperature=140.0,
        pressure=8.5,
        renewable_energy=40.0,
        recycled_material=30.0,
        waste_recovery=50.0,
        current_co2e=1200.0,
        optimized_co2e=850.0,
        co2_reduction=350.0,
        co2_reduction_percent=29.2,
        current_risk=75.0,
        optimized_risk=45.0,
        risk_reduction=30.0,
        waste_reduction=25.0,
        energy_reduction=20.0,
        estimated_cost_saving=14000.0,
        annual_reduction=127.7,
        annual_saving=5110000.0,
    )
    db_session.add(sim)
    db_session.commit()

    # Assertions
    assert db_session.query(Plant).count() >= 1
    assert db_session.query(User).count() >= 1
    assert db_session.query(ProcessUnit).count() >= 1
    assert db_session.query(Equipment).count() >= 1
    assert db_session.query(ProcessReading).count() >= 1
    assert db_session.query(Prediction).count() >= 1
    assert db_session.query(Incident).count() >= 1
    assert db_session.query(Hotspot).count() >= 1
    assert db_session.query(Recommendation).count() >= 1
    assert db_session.query(Action).count() >= 1
    assert db_session.query(Simulation).count() >= 1


def test_emissions_aggregation_endpoints(client, seed_base_entities, db_session):
    """Test SQL aggregation APIs for emission summaries, breakdowns, and time trends."""
    # Seed a couple readings with different equipment
    for i in range(5):
        reading = ProcessReading(
            timestamp=datetime.now(timezone.utc),
            plant_id="PLANT-A",
            process_unit_id="RX-01",
            equipment_id="RX-01-EQ795",
            equipment_type="Reactor" if i % 2 == 0 else "Separator",
            process_type="gas_processing",
            temperature_c=180.0 + i,
            pressure_bar=12.0,
            flow_rate=120.0,
            production_rate=80.0,
            operating_hours=40000.0,
            equipment_age_years=15.0,
            maintenance_due=False,
            co2_ppm=3000.0 + (i * 500.0),
            co_ppm=15.0,
            nox_ppm=40.0,
            so2_ppm=20.0,
            voc_ppm=30.0,
            ch4_ppm=10.0,
            pm25_mg_m3=12.0,
            fuel_or_material_type="naphtha",
            ambient_temperature_c=30.0,
            humidity_pct=50.0,
            wind_speed_m_s=3.0,
            shift="Morning",
            maintenance_status="ok",
            pressure_deviation_pct=0.0,
            flow_deviation_pct=0.0,
            temperature_deviation_pct=0.0,
            emission_above_baseline_pct=10.0,
            rolling_mean=12.0,
            rolling_std=0.5,
            incident_label=1 if i == 0 else 0,
            risk_class="warning" if i == 0 else "normal",
            risk_score=45.0 if i == 0 else 15.0,
        )
        db_session.add(reading)
    db_session.commit()

    # 1. Summary
    resp_sum = client.get("/api/v1/emissions/summary?plant_id=PLANT-A")
    assert resp_sum.status_code == 200
    data_sum = resp_sum.json()
    assert data_sum["total_readings"] >= 5
    assert data_sum["avg_co2_ppm"] > 0
    assert data_sum["incident_count"] >= 1

    # 2. Breakdown
    resp_bd = client.get("/api/v1/emissions/breakdown?plant_id=PLANT-A")
    assert resp_bd.status_code == 200
    data_bd = resp_bd.json()
    assert len(data_bd["by_equipment"]) >= 1
    assert "scope_breakdown" in data_bd

    # 3. Trend
    resp_tr = client.get("/api/v1/emissions/trend?plant_id=PLANT-A&limit=10")
    assert resp_tr.status_code == 200
    data_tr = resp_tr.json()
    assert len(data_tr["data"]) >= 1


def test_action_crud_and_status_persistence(client, seed_base_entities):
    """Test creating, patching status to COMPLETED, and deleting actions."""
    action_payload = {
        "id": "act-persist-99",
        "plant_id": "PLANT-A",
        "equipment_id": "RX-01-EQ795",
        "title": "Clean catalytic converter",
        "priority": "HIGH",
        "impact": 28.0,
        "estimatedCost": 2200.0,
        "feasibility": 90.0,
        "status": "PENDING",
        "description": "Routine catalyst cleaning",
    }

    # Create
    resp_create = client.post("/api/v1/actions", json=action_payload)
    assert resp_create.status_code == 201

    # Status update
    resp_patch = client.patch(
        "/api/v1/actions/act-persist-99",
        json={"status": "COMPLETED"},
    )
    assert resp_patch.status_code == 200
    assert resp_patch.json()["status"] == "COMPLETED"

    # Query
    resp_get = client.get("/api/v1/actions/act-persist-99")
    assert resp_get.status_code == 200
    assert resp_get.json()["status"] == "COMPLETED"

    # Delete
    resp_del = client.delete("/api/v1/actions/act-persist-99")
    assert resp_del.status_code == 204
