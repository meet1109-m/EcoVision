from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="operator", nullable=False)  # admin, engineer, operator
    plant_id = Column(String(50), ForeignKey("plants.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    plant = relationship("Plant", back_populates="users", lazy="joined")
    actions = relationship("Action", back_populates="assignee", lazy="selectin")
    simulations = relationship("Simulation", back_populates="user", lazy="selectin")

    @property
    def name(self) -> str:
        return self.full_name or self.email

    @property
    def password_hash(self) -> str:
        return self.hashed_password
