def test_simulation_run_and_save(client, seed_base_entities, auth_headers):
    # 1. Run simulation calculation
    sim_input = {
        "productionRate": 85.0,
        "temperature": 185.0,
        "pressure": 8.4,
        "renewableEnergy": 25.0,
        "recycledMaterial": 35.0,
        "wasteRecovery": 45.0,
        "sourcingDistance": 50.0,
        "alternativeId": "alt-bio",
    }
    run_resp = client.post("/simulation/run", json=sim_input)
    assert run_resp.status_code == 200
    res = run_resp.json()
    assert res["currentCO2e"] == 1240.0
    assert res["optimizedCO2e"] < 1240.0
    assert res["co2Reduction"] > 0
    assert res["annualSaving"] > 0

    # 2. Save simulation scenario
    save_payload = {
        "name": "Q1 Decarbonization Trial",
        "plant_id": "PLANT-A",
        "input": sim_input,
        "result": res,
    }
    save_resp = client.post("/simulation/save", json=save_payload, headers=auth_headers)
    assert save_resp.status_code == 201
    save_data = save_resp.json()
    assert save_data["id"] is not None
    assert save_data["name"] == "Q1 Decarbonization Trial"

    # 3. Retrieve simulation history
    history_resp = client.get("/simulation/history")
    assert history_resp.status_code == 200
    history = history_resp.json()
    assert len(history) >= 1
    assert history[0]["name"] == "Q1 Decarbonization Trial"
