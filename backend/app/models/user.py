from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Business profile
    business_name = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    ad_account_id = Column(String, nullable=True)  # For future real Meta API

    # Goals
    target_cpa = Column(Float, nullable=True, default=400.0)
    target_roas = Column(Float, nullable=True, default=3.0)
    monthly_budget = Column(Float, nullable=True)
    strategy = Column(String, nullable=True, default="Efficiency")

    # Settings
    is_active = Column(Boolean, default=True)
    auto_approve_low_risk = Column(Boolean, default=False)
    slack_notifications = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="user", cascade="all, delete-orphan")
    agent_logs = relationship("AgentLog", back_populates="user", cascade="all, delete-orphan")
