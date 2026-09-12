from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class Plant(Base, TimestampMixin):
    __tablename__ = "plants"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    industry_type = Column(String(100), default="Petrochemical & Refining", nullable=False)
    production_capacity = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    process_units = relationship("ProcessUnit", back_populates="plant", cascade="all, delete-orphan", lazy="selectin")
    equipment = relationship("Equipment", back_populates="plant", cascade="all, delete-orphan", lazy="selectin")
    readings = relationship("ProcessReading", back_populates="plant", lazy="dynamic")
    hotspots = relationship("Hotspot", back_populates="plant", cascade="all, delete-orphan", lazy="selectin")
    recommendations = relationship("Recommendation", back_populates="plant", cascade="all, delete-orphan", lazy="selectin")
    actions = relationship("Action", back_populates="plant", cascade="all, delete-orphan", lazy="selectin")
    simulations = relationship("Simulation", back_populates="plant", cascade="all, delete-orphan", lazy="selectin")
    users = relationship("User", back_populates="plant", lazy="selectin")
