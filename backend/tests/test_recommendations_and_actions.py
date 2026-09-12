def test_recommendations_and_actions(client, seed_base_entities):
    # 1. Create recommendation
    rec_payload = {
        "id": "rec-test-01",
        "plant_id": "PLANT-A",
        "equipment_id": "RX-01-EQ795",
        "title": "Catalyst Feed Flow Optimization",
        "description": "Adjust catalyst mixture to reduce exothermicity and gas release",
        "co2Reduction": 42.0,
        "costReduction": 15.0,
        "environmental": 90.0,
        "economic": 85.0,
        "circularity": 80.0,
        "feasibility": 92.0,
        "isAIRecommended": True,
        "status": "active",
    }
    rec_resp = client.post("/recommendations", json=rec_payload)
    assert rec_resp.status_code == 201
    assert rec_resp.json()["id"] == "rec-test-01"

    # List recommendations
    rec_list = client.get("/recommendations?plant_id=PLANT-A")
    assert rec_list.status_code == 200
    assert len(rec_list.json()) >= 1

    # 2. Create action
    action_payload = {
        "id": "action-test-01",
        "plant_id": "PLANT-A",
        "equipment_id": "RX-01-EQ795",
        "recommendation_id": "rec-test-01",
        "title": "Recalibrate pressure relief valves",
        "priority": "HIGH",
        "impact": 35.0,
        "estimatedCost": 3200.0,
        "feasibility": 88.0,
        "status": "PENDING",
        "description": "Field inspection and safety recalibration",
    }
    action_resp = client.post("/actions", json=action_payload)
    assert action_resp.status_code == 201
    assert action_resp.json()["id"] == "action-test-01"

    # List actions
    action_list = client.get("/actions?plant_id=PLANT-A")
    assert action_list.status_code == 200
    assert len(action_list.json()) >= 1

    # Update action status (PENDING -> IN_PROGRESS)
    status_resp = client.patch(
        "/actions/action-test-01/status",
        json={"status": "IN_PROGRESS"},
    )
    assert status_resp.status_code == 200
    assert status_resp.json()["status"] == "IN_PROGRESS"
