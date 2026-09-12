def test_user_registration_and_login(client):
    # 1. Register new user
    reg_payload = {
        "email": "engineer@ecoleak.io",
        "password": "SecurePassword123!",
        "full_name": "Senior Plant Engineer",
        "role": "engineer",
        "plant_id": None,
    }
    reg_resp = client.post("/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201
    user_data = reg_resp.json()
    assert user_data["email"] == "engineer@ecoleak.io"
    assert user_data["role"] == "engineer"
    assert "id" in user_data

    # 2. Login with correct credentials
    login_resp = client.post(
        "/auth/login",
        json={"email": "engineer@ecoleak.io", "password": "SecurePassword123!"},
    )
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    token = token_data["access_token"]

    # 3. Access protected /auth/me with Bearer token
    me_resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == "engineer@ecoleak.io"

    # 4. Login with wrong password
    bad_login = client.post(
        "/auth/login",
        json={"email": "engineer@ecoleak.io", "password": "WrongPassword!"},
    )
    assert bad_login.status_code == 401
