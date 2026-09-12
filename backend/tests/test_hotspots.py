def test_hotspots_crud(client, seed_base_entities):
    hotspot_data = {
        "id": "hotspot-test-01",
        "plant_id": "PLANT-A",
        "equipment_id": "RX-01-EQ795",
        "equipment": "Reactor",
        "riskScore": 88.5,
        "status": "CRITICAL",
        "probability": 82.0,
        "emission": 150.0,
        "probableCause": "Exceeded safe pressure envelope",
        "detectedSignals": ["Pressure surge", "Seal wear anomaly"],
        "recommendedAction": "Isolate feed line and conduct ultrasonic inspection",
        "is_active": True,
    }

    # Create hotspot
    create_resp = client.post("/hotspots", json=hotspot_data)
    assert create_resp.status_code == 201
    assert create_resp.json()["id"] == "hotspot-test-01"

    # List hotspots
    list_resp = client.get("/hotspots?plant_id=PLANT-A")
    assert list_resp.status_code == 200
    hotspots = list_resp.json()
    assert len(hotspots) >= 1
    assert hotspots[0]["riskScore"] == 88.5

    # Get single hotspot
    get_resp = client.get("/hotspots/hotspot-test-01")
    assert get_resp.status_code == 200
    assert get_resp.json()["equipment"] == "Reactor"

    # Patch hotspot
    patch_resp = client.patch(
        "/hotspots/hotspot-test-01",
        json={"status": "MEDIUM", "riskScore": 55.0},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "MEDIUM"
