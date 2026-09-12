"""initial_schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-09-12 03:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. plants table
    op.create_table(
        "plants",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("industry_type", sa.String(length=100), nullable=False, server_default="Petrochemical & Refining"),
        sa.Column("production_capacity", sa.String(length=100), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_plants_id", "plants", ["id"], unique=False)

    # 2. users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="operator"),
        sa.Column("plant_id", sa.String(length=50), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["plant_id"], ["plants.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_id", "users", ["id"], unique=False)
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # 3. process_units table
    op.create_table(
        "process_units",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("plant_id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("unit_type", sa.String(length=100), nullable=True),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["plant_id"], ["plants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_process_units_id", "process_units", ["id"], unique=False)
    op.create_index("ix_process_units_plant_id", "process_units", ["plant_id"], unique=False)

    # 4. equipment table
    op.create_table(
        "equipment",
        sa.Column("id", sa.String(length=100), nullable=False),
        sa.Column("process_unit_id", sa.String(length=50), nullable=False),
        sa.Column("plant_id", sa.String(length=50), nullable=False),
        sa.Column("equipment_type", sa.String(length=100), nullable=False),
        sa.Column("process_type", sa.String(length=100), nullable=False),
        sa.Column("equipment_age_years", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("maintenance_status", sa.String(length=50), nullable=False, server_default="ok"),
        sa.Column("installation_date", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["plant_id"], ["plants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["process_unit_id"], ["process_units.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_equipment_id", "equipment", ["id"], unique=False)
    op.create_index("ix_equipment_plant_id", "equipment", ["plant_id"], unique=False)
    op.create_index("ix_equipment_process_unit_id", "equipment", ["process_unit_id"], unique=False)
    op.create_index("ix_equipment_equipment_type", "equipment", ["equipment_type"], unique=False)

    # 5. process_readings table (all sensor telemetry fields)
    op.create_table(
        "process_readings",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.Column("plant_id", sa.String(length=50), nullable=False),
        sa.Column("process_unit_id", sa.String(length=50), nullable=False),
        sa.Column("equipment_id", sa.String(length=100), nullable=False),
        sa.Column("equipment_type", sa.String(length=100), nullable=False),
        sa.Column("process_type", sa.String(length=100), nullable=False),
        sa.Column("temperature_c", sa.Float(), nullable=False),
        sa.Column("pressure_bar", sa.Float(), nullable=False),
        sa.Column("flow_rate", sa.Float(), nullable=False),
        sa.Column("production_rate", sa.Float(), nullable=False),
        sa.Column("operating_hours", sa.Float(), nullable=False),
        sa.Column("equipment_age_years", sa.Float(), nullable=False),
        sa.Column("maintenance_due", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("co2_ppm", sa.Float(), nullable=False),
        sa.Column("co_ppm", sa.Float(), nullable=False),
        sa.Column("nox_ppm", sa.Float(), nullable=False),
        sa.Column("so2_ppm", sa.Float(), nullable=False),
        sa.Column("voc_ppm", sa.Float(), nullable=False),
        sa.Column("ch4_ppm", sa.Float(), nullable=False),
        sa.Column("pm25_mg_m3", sa.Float(), nullable=False),
        sa.Column("fuel_or_material_type", sa.String(length=100), nullable=False),
        sa.Column("ambient_temperature_c", sa.Float(), nullable=False),
        sa.Column("humidity_pct", sa.Float(), nullable=False),
        sa.Column("wind_speed_m_s", sa.Float(), nullable=False),
        sa.Column("shift", sa.String(length=50), nullable=False),
        sa.Column("maintenance_status", sa.String(length=50), nullable=False),
        sa.Column("pressure_deviation_pct", sa.Float(), nullable=False),
        sa.Column("flow_deviation_pct", sa.Float(), nullable=False),
        sa.Column("temperature_deviation_pct", sa.Float(), nullable=False),
        sa.Column("emission_above_baseline_pct", sa.Float(), nullable=False),
        sa.Column("rolling_mean", sa.Float(), nullable=False),
        sa.Column("rolling_std", sa.Float(), nullable=False),
        sa.Column("incident_label", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("risk_class", sa.String(length=50), nullable=False, server_default="normal"),
        sa.Column("risk_score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("leak_location", sa.String(length=100), nullable=False, server_default="none"),
        sa.Column("leak_severity", sa.String(length=50), nullable=False, server_default="none"),
        sa.Column("confirmed_by", sa.String(length=50), nullable=False, server_default="sensor"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["equipment_id"], ["equipment.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["plant_id"], ["plants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["process_unit_id"], ["process_units.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_process_readings_id", "process_readings", ["id"], unique=False)
    op.create_index("ix_process_readings_timestamp", "process_readings", ["timestamp"], unique=False)
    op.create_index("ix_process_readings_plant_id", "process_readings", ["plant_id"], unique=False)
    op.create_index("ix_process_readings_process_unit_id", "process_readings", ["process_unit_id"], unique=False)
    op.create_index("ix_process_readings_equipment_id", "process_readings", ["equipment_id"], unique=False)
    op.create_index("ix_process_readings_incident_label", "process_readings", ["incident_label"], unique=False)
    op.create_index("ix_process_readings_risk_class", "process_readings", ["risk_class"], unique=False)

    # 6. predictions table
    op.create_table(
        "predictions",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("reading_id", sa.BigInteger(), nullable=True),
        sa.Column("plant_id", sa.String(length=50), nullable=False),
        sa.Column("equipment_id", sa.String(length=100), nullable=False),
        sa.Column("incident_prediction", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("incident_probability", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("predicted_risk_score", sa.Float(), nullable=False),
        sa.Column("predicted_risk_class", sa.String(length=50), nullable=False),
        sa.Column("predicted_leak_severity", sa.String(length=50), nullable=False, server_default="none"),
        sa.Column("predicted_leak_location", sa.String(length=100), nullable=False, server_default="sensor_point"),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("feature_importance", sa.JSON(), nullable=True),
        sa.Column("rule_signals", sa.JSON(), nullable=True),
        sa.Column("model_version", sa.String(length=50), nullable=False, server_default="xgb-incident-v1.0"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["equipment_id"], ["equipment.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["plant_id"], ["plants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reading_id"], ["process_readings.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_predictions_id", "predictions", ["id"], unique=False)
    op.create_index("ix_predictions_plant_id", "predictions", ["plant_id"], unique=False)
    op.create_index("ix_predictions_equipment_id", "predictions", ["equipment_id"], unique=False)
    op.create_index("ix_predictions_created_at", "predictions", ["created_at"], unique=False)

    # 7. incidents table
    op.create_table(
        "incidents",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("plant_id", sa.String(length=50), nullable=False),
        sa.Column("equipment_id", sa.String(length=100), nullable=False),
        sa.Column("reading_id", sa.BigInteger(), nullable=True),
        sa.Column("prediction_id", sa.BigInteger(), nullable=True),
        sa.Column("incident_label", sa.Integer(), nullable=False),
        sa.Column("risk_class", sa.String(length=50), nullable=False),
        sa.Column("risk_score", sa.Float(), nullable=False),
        sa.Column("leak_severity", sa.String(length=50), nullable=False),
        sa.Column("leak_location", sa.String(length=100), nullable=False),
        sa.Column("confirmed_by", sa.String(length=50), nullable=False, server_default="sensor"),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="OPEN"),
        sa.Column("detected_at", sa.DateTime(), nullable=False),
        sa.Column("resolved_at", sa.DateTime(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["equipment_id"], ["equipment.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["plant_id"], ["plants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reading_id"], ["process_readings.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["prediction_id"], ["predictions.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_incidents_id", "incidents", ["id"], unique=False)
    op.create_index("ix_incidents_plant_id", "incidents", ["plant_id"], unique=False)
    op.create_index("ix_incidents_equipment_id", "incidents", ["equipment_id"], unique=False)
    op.create_index("ix_incidents_prediction_id", "incidents", ["prediction_id"], unique=False)
    op.create_index("ix_incidents_detected_at", "incidents", ["detected_at"], unique=False)

    # 8. hotspots table
    op.create_table(
        "hotspots",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("plant_id", sa.String(length=50), nullable=False),
        sa.Column("equipment_id", sa.String(length=100), nullable=False),
        sa.Column("equipment_name", sa.String(length=100), nullable=False),
        sa.Column("risk_score", sa.Float(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="NORMAL"),
        sa.Column("probability", sa.Float(), nullable=False),
        sa.Column("emission", sa.Float(), nullable=False),
        sa.Column("probable_cause", sa.String(length=255), nullable=False),
        sa.Column("detected_signals", sa.JSON(), nullable=False),
        sa.Column("recommended_action", sa.String(length=500), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["equipment_id"], ["equipment.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["plant_id"], ["plants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_hotspots_id", "hotspots", ["id"], unique=False)
    op.create_index("ix_hotspots_plant_id", "hotspots", ["plant_id"], unique=False)
    op.create_index("ix_hotspots_equipment_id", "hotspots", ["equipment_id"], unique=False)

    # 9. recommendations table
    op.create_table(
        "recommendations",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("plant_id", sa.String(length=50), nullable=True),
        sa.Column("equipment_id", sa.String(length=100), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("co2_reduction", sa.Float(), nullable=False),
        sa.Column("cost_reduction", sa.Float(), nullable=False),
        sa.Column("environmental", sa.Float(), nullable=False),
        sa.Column("economic", sa.Float(), nullable=False),
        sa.Column("circularity", sa.Float(), nullable=False),
        sa.Column("feasibility", sa.Float(), nullable=False),
        sa.Column("priority", sa.String(length=50), nullable=False, server_default="MEDIUM"),
        sa.Column("is_ai_recommended", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["equipment_id"], ["equipment.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["plant_id"], ["plants.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_recommendations_id", "recommendations", ["id"], unique=False)
    op.create_index("ix_recommendations_plant_id", "recommendations", ["plant_id"], unique=False)
    op.create_index("ix_recommendations_equipment_id", "recommendations", ["equipment_id"], unique=False)

    # 10. actions table
    op.create_table(
        "actions",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("plant_id", sa.String(length=50), nullable=True),
        sa.Column("equipment_id", sa.String(length=100), nullable=True),
        sa.Column("recommendation_id", sa.String(length=50), nullable=True),
        sa.Column("assigned_to_user_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("priority", sa.String(length=50), nullable=False, server_default="MEDIUM"),
        sa.Column("impact", sa.Float(), nullable=False),
        sa.Column("estimated_cost", sa.Float(), nullable=False),
        sa.Column("feasibility", sa.Float(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="PENDING"),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["assigned_to_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["equipment_id"], ["equipment.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["plant_id"], ["plants.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["recommendation_id"], ["recommendations.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_actions_id", "actions", ["id"], unique=False)
    op.create_index("ix_actions_plant_id", "actions", ["plant_id"], unique=False)
    op.create_index("ix_actions_equipment_id", "actions", ["equipment_id"], unique=False)

    # 11. simulations table
    op.create_table(
        "simulations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("plant_id", sa.String(length=50), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False, server_default="Simulation Scenario"),
        sa.Column("production_rate", sa.Float(), nullable=False),
        sa.Column("temperature", sa.Float(), nullable=False),
        sa.Column("pressure", sa.Float(), nullable=False),
        sa.Column("renewable_energy", sa.Float(), nullable=False),
        sa.Column("recycled_material", sa.Float(), nullable=False),
        sa.Column("waste_recovery", sa.Float(), nullable=False),
        sa.Column("sourcing_distance", sa.Float(), nullable=True),
        sa.Column("alternative_id", sa.String(length=50), nullable=True),
        sa.Column("input_parameters", sa.JSON(), nullable=True),
        sa.Column("baseline_result", sa.JSON(), nullable=True),
        sa.Column("simulated_result", sa.JSON(), nullable=True),
        sa.Column("current_co2e", sa.Float(), nullable=False),
        sa.Column("optimized_co2e", sa.Float(), nullable=False),
        sa.Column("co2_reduction", sa.Float(), nullable=False),
        sa.Column("co2_reduction_percent", sa.Float(), nullable=False),
        sa.Column("current_risk", sa.Float(), nullable=False),
        sa.Column("optimized_risk", sa.Float(), nullable=False),
        sa.Column("risk_reduction", sa.Float(), nullable=False),
        sa.Column("waste_reduction", sa.Float(), nullable=False),
        sa.Column("energy_reduction", sa.Float(), nullable=False),
        sa.Column("estimated_cost_saving", sa.Float(), nullable=False),
        sa.Column("annual_reduction", sa.Float(), nullable=False),
        sa.Column("annual_saving", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["plant_id"], ["plants.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_simulations_id", "simulations", ["id"], unique=False)
    op.create_index("ix_simulations_plant_id", "simulations", ["plant_id"], unique=False)


def downgrade() -> None:
    op.drop_table("simulations")
    op.drop_table("actions")
    op.drop_table("recommendations")
    op.drop_table("hotspots")
    op.drop_table("incidents")
    op.drop_table("predictions")
    op.drop_table("process_readings")
    op.drop_table("equipment")
    op.drop_table("process_units")
    op.drop_table("users")
    op.drop_table("plants")
