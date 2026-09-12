def test_plants_crud_and_summary(client, seed_base_entities):
    # List plants
    resp = client.get("/plants")
    assert resp.status_code == 200
    plants = resp.json()
    assert len(plants) >= 1
    assert plants[0]["id"] == "PLANT-A"

    # Create new plant
    new_plant = {
        "id": "PLANT-D",
        "name": "Eco Refine Facility D",
        "location": "Sector 4",
        "industry_type": "Petrochemical",
        "production_capacity": "800 tonnes/month",
        "is_active": True,
    }
    create_resp = client.post("/plants", json=new_plant)
    assert create_resp.status_code == 201
    assert create_resp.json()["id"] == "PLANT-D"

    # Get single plant
    get_resp = client.get("/plants/PLANT-D")
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "Eco Refine Facility D"

    # Get plant summary
    summary_resp = client.get("/plants/PLANT-A/summary")
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert summary["plant_id"] == "PLANT-A"
    assert "total_equipment" in summary
    assert "active_hotspots" in summary


def test_equipment_endpoints(client, seed_base_entities):
    # List equipment
    resp = client.get("/equipment?plant_id=PLANT-A")
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) >= 1
    assert items[0]["id"] == "RX-01-EQ795"

    # Get equipment detail
    detail_resp = client.get("/equipment/RX-01-EQ795")
    assert detail_resp.status_code == 200
    assert detail_resp.json()["equipment_type"] == "Reactor"

    # Patch equipment
    patch_resp = client.patch(
        "/equipment/RX-01-EQ795",
        json={"maintenance_status": "due_soon", "equipment_age_years": 5.5},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["maintenance_status"] == "due_soon"

    # Telemetry endpoint
    telemetry_resp = client.get("/equipment/RX-01-EQ795/telemetry")
    assert telemetry_resp.status_code == 200
    assert isinstance(telemetry_resp.json(), list)
