"""
EcoVision CSV Seed & Ingestion Pipeline.

Streams, validates, cleans, and inserts industrial_leak_training_v2.csv
into PostgreSQL using SQLAlchemy batch insertion with duplicate avoidance.

Usage:
  python scripts/seed_csv.py [--csv-path PATH] [--limit N] [--batch-size B] [--create-tables] [--force]
"""
import os
import sys
import csv
import argparse
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import engine, SessionLocal, Base
from app.models.plant import Plant
from app.models.process_unit import ProcessUnit
from app.models.equipment import Equipment
from app.models.process_reading import ProcessReading
from app.models.user import User
from app.models.hotspot import Hotspot
from app.models.recommendation import Recommendation
from app.models.action import Action
from app.services.auth_service import hash_password

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed")


def parse_args():
    parser = argparse.ArgumentParser(description="Seed EcoVision PostgreSQL database from CSV dataset")
    parser.add_argument(
        "--csv-path",
        type=str,
        default=os.path.join(os.path.dirname(__file__), "..", "..", "industrial_leak_training_v2.csv"),
        help="Path to industrial_leak_training_v2.csv",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit number of process readings to import (default all rows)",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=2000,
        help="Batch size for bulk insertion (default 2000)",
    )
    parser.add_argument(
        "--create-tables",
        action="store_true",
        help="Automatically create tables before seeding if not already created",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force re-import even if records already exist",
    )
    return parser.parse_args()


def safe_float(val: Any, default: float = 0.0) -> float:
    try:
        if val is None or str(val).strip() == "":
            return default
        return float(val)
    except (ValueError, TypeError):
        return default


def safe_int(val: Any, default: int = 0) -> int:
    try:
        if val is None or str(val).strip() == "":
            return default
        return int(float(val))
    except (ValueError, TypeError):
        return default


def clean_row(row: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Validate and clean a single CSV row, converting types safely."""
    try:
        # Timestamp parsing
        raw_ts = str(row.get("timestamp", "")).strip()
        try:
            ts = datetime.strptime(raw_ts, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            try:
                ts = datetime.fromisoformat(raw_ts)
            except Exception:
                ts = datetime.now(timezone.utc)

        # Boolean conversion
        maint_due_raw = str(row.get("maintenance_due", "false")).strip().lower()
        maint_due = maint_due_raw in ("true", "1", "t", "yes")

        return {
            "timestamp": ts,
            "plant_id": str(row.get("plant_id", "PLANT-A")).strip(),
            "process_unit_id": str(row.get("process_unit_id", "UNIT-01")).strip(),
            "equipment_id": str(row.get("equipment_id", "EQ-001")).strip(),
            "equipment_type": str(row.get("equipment_type", "Scrubber")).strip(),
            "process_type": str(row.get("process_type", "Chemical")).strip(),
            "temperature_c": safe_float(row.get("temperature_c"), 150.0),
            "pressure_bar": safe_float(row.get("pressure_bar"), 10.0),
            "flow_rate": safe_float(row.get("flow_rate"), 100.0),
            "production_rate": safe_float(row.get("production_rate"), 50.0),
            "operating_hours": safe_float(row.get("operating_hours"), 1000.0),
            "equipment_age_years": safe_float(row.get("equipment_age_years"), 5.0),
            "maintenance_due": maint_due,
            "co2_ppm": safe_float(row.get("co2_ppm"), 400.0),
            "co_ppm": safe_float(row.get("co_ppm"), 5.0),
            "nox_ppm": safe_float(row.get("nox_ppm"), 30.0),
            "so2_ppm": safe_float(row.get("so2_ppm"), 20.0),
            "voc_ppm": safe_float(row.get("voc_ppm"), 10.0),
            "ch4_ppm": safe_float(row.get("ch4_ppm"), 10.0),
            "pm25_mg_m3": safe_float(row.get("pm25_mg_m3"), 15.0),
            "fuel_or_material_type": str(row.get("fuel_or_material_type", "NaturalGas")).strip(),
            "ambient_temperature_c": safe_float(row.get("ambient_temperature_c"), 25.0),
            "humidity_pct": safe_float(row.get("humidity_pct"), 50.0),
            "wind_speed_m_s": safe_float(row.get("wind_speed_m_s"), 3.0),
            "shift": str(row.get("shift", "Day")).strip(),
            "maintenance_status": str(row.get("maintenance_status", "Normal")).strip(),
            "pressure_deviation_pct": safe_float(row.get("pressure_deviation_pct"), 0.0),
            "flow_deviation_pct": safe_float(row.get("flow_deviation_pct"), 0.0),
            "temperature_deviation_pct": safe_float(row.get("temperature_deviation_pct"), 0.0),
            "emission_above_baseline_pct": safe_float(row.get("emission_above_baseline_pct"), 0.0),
            "rolling_mean": safe_float(row.get("rolling_mean"), 100.0),
            "rolling_std": safe_float(row.get("rolling_std"), 0.0),
            "incident_label": safe_int(row.get("incident_label"), 0),
            "risk_class": str(row.get("risk_class", "normal")).strip(),
            "risk_score": safe_float(row.get("risk_score"), 0.0),
            "leak_location": str(row.get("leak_location", "none")).strip(),
            "leak_severity": str(row.get("leak_severity", "none")).strip(),
            "confirmed_by": str(row.get("confirmed_by", "sensor")).strip(),
            "created_at": datetime.now(timezone.utc),
        }
    except Exception as err:
        logger.warning(f"Skipping invalid row: {err}")
        return None


def resolve_csv_path(user_path: Optional[str]) -> str:
    candidates = [
        user_path,
        os.path.join(os.path.dirname(__file__), "..", "..", "model_data", "industrial_leak_training_50k.csv"),
        os.path.join(os.getcwd(), "model_data", "industrial_leak_training_50k.csv"),
        os.path.join(os.path.dirname(__file__), "..", "..", "industrial_leak_training_v2.csv"),
        os.path.join(os.getcwd(), "industrial_leak_training_v2.csv"),
    ]
    for c in candidates:
        if c and os.path.exists(c):
            return os.path.realpath(c)
    raise FileNotFoundError(f"Could not locate training dataset CSV in candidates: {candidates}")


def seed_database(csv_path: str, limit: Optional[int] = None, batch_size: int = 2000, force: bool = False):
    csv_path = resolve_csv_path(csv_path)
    logger.info(f"Connecting to database and reading dataset: {csv_path}")
    db = SessionLocal()

    total_rows = 0
    successfully_inserted = 0
    skipped_rows = 0
    error_count = 0

    try:
        # 1. System Users Seeding (Idempotent)
        admin = db.query(User).filter(User.email == "admin@ecovision.io").first()
        if not admin:
            admin = User(
                email="admin@ecovision.io",
                hashed_password=hash_password("adminpassword123"),
                full_name="EcoVision Administrator",
                role="admin",
                is_active=True,
            )
            db.add(admin)

        operator = db.query(User).filter(User.email == "operator@ecovision.io").first()
        if not operator:
            operator = User(
                email="operator@ecovision.io",
                hashed_password=hash_password("operatorpassword123"),
                full_name="Plant Lead Operator",
                role="operator",
                plant_id="PLANT-A",
                is_active=True,
            )
            db.add(operator)
        db.commit()

        # 2. Extract and Upsert Plants, Process Units, and Equipment Hierarchy
        unique_plants = {}
        unique_units = {}
        unique_equipment = {}

        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                p_id = row["plant_id"]
                if p_id not in unique_plants:
                    unique_plants[p_id] = {
                        "id": p_id,
                        "name": f"Industrial Facility {p_id}",
                        "location": f"Sector-{p_id[-1]}",
                        "industry_type": "Petrochemical & Refining",
                        "production_capacity": "500 tonnes/month",
                    }

                u_id = row["process_unit_id"]
                if u_id not in unique_units:
                    unique_units[u_id] = {
                        "id": u_id,
                        "plant_id": p_id,
                        "name": f"Process Unit {u_id}",
                        "unit_type": row.get("process_type", "Processing"),
                        "description": f"Automated processing unit {u_id} in {p_id}",
                    }

                eq_id = row["equipment_id"]
                if eq_id not in unique_equipment:
                    unique_equipment[eq_id] = {
                        "id": eq_id,
                        "process_unit_id": u_id,
                        "plant_id": p_id,
                        "equipment_type": row["equipment_type"],
                        "process_type": str(row.get("process_type", "Processing")).strip(),
                        "equipment_age_years": safe_float(row.get("equipment_age_years"), 5.0),
                        "maintenance_status": str(row.get("maintenance_status", "Normal")).strip(),
                    }

        # Ensure demo plants exist
        demo_plants = {
            "PLANT-A": {"id": "PLANT-A", "name": "GreenTech Chemicals Plant Alpha", "location": "Bhiwadi Industrial Zone, Rajasthan", "industry_type": "Chemicals", "production_capacity": "120 tonnes/day"},
            "PLANT-B": {"id": "PLANT-B", "name": "FutureChem Industries - Unit 4", "location": "Dahej Petrochemical Corridor, Gujarat", "industry_type": "Chemicals", "production_capacity": "250 tonnes/day"},
            "DEMO001": {"id": "DEMO001", "name": "GreenTech Chemicals Plant Alpha", "location": "Bhiwadi Industrial Zone, Rajasthan", "industry_type": "Chemicals", "production_capacity": "120 tonnes/day"},
            "DEMO002": {"id": "DEMO002", "name": "FutureChem Industries - Unit 4", "location": "Dahej Petrochemical Corridor, Gujarat", "industry_type": "Chemicals", "production_capacity": "250 tonnes/day"},
        }
        for dp_id, dp_data in demo_plants.items():
            if dp_id not in unique_plants:
                unique_plants[dp_id] = dp_data

        logger.info(f"Hierarchy discovered: {len(unique_plants)} Plants, {len(unique_units)} Process Units, {len(unique_equipment)} Equipment assets.")

        for p_id, p_data in unique_plants.items():
            if not db.query(Plant).filter(Plant.id == p_id).first():
                db.add(Plant(**p_data))
        db.commit()

        for u_id, u_data in unique_units.items():
            if not db.query(ProcessUnit).filter(ProcessUnit.id == u_id).first():
                db.add(ProcessUnit(**u_data))
        db.commit()

        for eq_id, eq_data in unique_equipment.items():
            if not db.query(Equipment).filter(Equipment.id == eq_id).first():
                db.add(Equipment(**eq_data))
        db.commit()

        # 3. Seed Default Hotspots, Recommendations, and Actions
        first_eq = list(unique_equipment.keys())[0] if unique_equipment else "RX-01-EQ795"
        second_eq = list(unique_equipment.keys())[1] if len(unique_equipment) > 1 else first_eq

        if db.query(Hotspot).count() == 0:
            db.add_all([
                Hotspot(
                    id="hotspot-01",
                    plant_id="PLANT-A",
                    equipment_id=first_eq,
                    equipment_name="Scrubber",
                    risk_score=87.0,
                    status="CRITICAL",
                    probability=78.0,
                    emission=142.0,
                    probable_cause="Abnormal flow/pressure pattern",
                    detected_signals=["Pressure anomaly", "Flow imbalance", "Elevated emission concentration"],
                    recommended_action="Inspect outlet seal and optimize operating conditions.",
                    is_active=True,
                ),
                Hotspot(
                    id="hotspot-02",
                    plant_id="PLANT-B",
                    equipment_id=second_eq,
                    equipment_name="Furnace",
                    risk_score=73.0,
                    status="HIGH",
                    probability=65.0,
                    emission=118.0,
                    probable_cause="Temperature inconsistency",
                    detected_signals=["Temperature deviation", "Flame behavior anomaly"],
                    recommended_action="Calibrate temperature sensors and inspect burners.",
                    is_active=True,
                ),
            ])
            db.commit()

        if db.query(Recommendation).count() == 0:
            db.add_all([
                Recommendation(
                    id="rec-01",
                    plant_id="PLANT-A",
                    equipment_id=first_eq,
                    title="Material Optimization",
                    description="Optimize raw material composition and sourcing",
                    co2_reduction=32.0,
                    cost_reduction=18.0,
                    environmental=84.0,
                    economic=79.0,
                    circularity=82.0,
                    feasibility=91.0,
                    priority="HIGH",
                    is_ai_recommended=False,
                    status="active",
                ),
                Recommendation(
                    id="rec-02",
                    plant_id="PLANT-B",
                    equipment_id=second_eq,
                    title="Recycled Material + Process Optimization",
                    description="Increase recycled material usage and optimize process conditions",
                    co2_reduction=45.0,
                    cost_reduction=10.0,
                    environmental=95.0,
                    economic=82.0,
                    circularity=94.0,
                    feasibility=76.0,
                    priority="CRITICAL",
                    is_ai_recommended=True,
                    status="active",
                ),
            ])
            db.commit()

        if db.query(Action).count() == 0:
            db.add_all([
                Action(
                    id="action-01",
                    plant_id="PLANT-A",
                    equipment_id=first_eq,
                    recommendation_id="rec-01",
                    title="Inspect scrubber outlet seal",
                    priority="CRITICAL",
                    impact=38.7,
                    estimated_cost=2500.0,
                    feasibility=92.0,
                    status="PENDING",
                    description="Visual inspection and potential seal replacement",
                ),
                Action(
                    id="action-02",
                    plant_id="PLANT-A",
                    equipment_id=first_eq,
                    recommendation_id="rec-01",
                    title="Optimize process conditions",
                    priority="HIGH",
                    impact=28.5,
                    estimated_cost=5000.0,
                    feasibility=76.0,
                    status="PENDING",
                    description="Fine-tune temperature, pressure, and flow parameters",
                ),
            ])
            db.commit()

        # 4. Check existing process readings to prevent duplicates
        existing_reading_count = db.query(ProcessReading).count()
        if existing_reading_count > 0 and not force:
            logger.info(f"Database already contains {existing_reading_count} process readings. Skipping duplicate insertion (use --force to re-import).")
            return {
                "total_rows": existing_reading_count,
                "successfully_inserted": 0,
                "skipped_rows": existing_reading_count,
                "errors": 0,
            }

        # 5. Stream and bulk-insert process readings
        logger.info(f"Streaming process readings into database (batch size: {batch_size}, limit: {limit or 'all'})...")
        readings_batch = []

        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for idx, raw_row in enumerate(reader):
                total_rows += 1
                if limit and idx >= limit:
                    break

                cleaned = clean_row(raw_row)
                if cleaned is None:
                    skipped_rows += 1
                    error_count += 1
                    continue

                readings_batch.append(cleaned)

                if len(readings_batch) >= batch_size:
                    db.bulk_insert_mappings(ProcessReading, readings_batch)
                    db.commit()
                    successfully_inserted += len(readings_batch)
                    logger.info(f"Batch inserted: {successfully_inserted} rows...")
                    readings_batch = []

            # Remaining batch
            if readings_batch:
                db.bulk_insert_mappings(ProcessReading, readings_batch)
                db.commit()
                successfully_inserted += len(readings_batch)

        logger.info("=== SEEDING SUMMARY REPORT ===")
        logger.info(f"Total rows processed: {total_rows}")
        logger.info(f"Successfully inserted: {successfully_inserted}")
        logger.info(f"Skipped / Invalid rows: {skipped_rows}")
        logger.info(f"Errors encountered: {error_count}")

        return {
            "total_rows": total_rows,
            "successfully_inserted": successfully_inserted,
            "skipped_rows": skipped_rows,
            "errors": error_count,
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Fatal error during database seeding: {e}")
        raise
    finally:
        db.close()


def main():
    args = parse_args()
    if args.create_tables:
        logger.info("Verifying/creating database tables...")
        Base.metadata.create_all(bind=engine)
    seed_database(
        csv_path=args.csv_path,
        limit=args.limit,
        batch_size=args.batch_size,
        force=args.force,
    )


if __name__ == "__main__":
    main()
