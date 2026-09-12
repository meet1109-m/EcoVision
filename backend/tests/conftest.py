import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure tests use an isolated in-memory SQLite database
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.database import Base, get_db
from app.main import app
from app.models.plant import Plant
from app.models.process_unit import ProcessUnit
from app.models.equipment import Equipment
from app.models.user import User
from app.services.auth_service import hash_password, create_access_token

TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def seed_base_entities(db_session):
    plant = Plant(
        id="PLANT-A",
        name="Test Chemical Plant A",
        location="Sector 1",
        industry_type="Petrochemical & Refining",
        production_capacity="500 tonnes/month",
        is_active=True,
    )
    db_session.add(plant)

    unit = ProcessUnit(
        id="RX-01",
        plant_id="PLANT-A",
        name="Reactor Unit 01",
        unit_type="Reactor",
    )
    db_session.add(unit)

    equipment = Equipment(
        id="RX-01-EQ795",
        plant_id="PLANT-A",
        process_unit_id="RX-01",
        equipment_type="Reactor",
        process_type="gas_processing",
        equipment_age_years=5.0,
        maintenance_status="ok",
    )
    db_session.add(equipment)

    user = User(
        email="testoperator@ecoleak.io",
        hashed_password=hash_password("password123"),
        full_name="Test Operator",
        role="operator",
        plant_id="PLANT-A",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    return {
        "plant": plant,
        "unit": unit,
        "equipment": equipment,
        "user": user,
    }


@pytest.fixture(scope="function")
def auth_headers(seed_base_entities):
    user = seed_base_entities["user"]
    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return {"Authorization": f"Bearer {token}"}
