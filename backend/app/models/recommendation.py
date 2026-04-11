from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class RecommendationType(str, enum.Enum):
    PAUSE_CAMPAIGN     = "PAUSE_CAMPAIGN"
    BUDGET_INCREASE    = "BUDGET_INCREASE"
    BUDGET_DECREASE    = "BUDGET_DECREASE"
    SCALE_CAMPAIGN     = "SCALE_CAMPAIGN"
    AUDIENCE_EXPANSION = "AUDIENCE_EXPANSION"
    CREATIVE_REFRESH   = "CREATIVE_REFRESH"
    DUPLICATE_CAMPAIGN = "DUPLICATE_CAMPAIGN"
    CUSTOM_AUDIENCE    = "CUSTOM_AUDIENCE"


class RecommendationStatus(str, enum.Enum):
    PENDING       = "PENDING"
    APPROVED      = "APPROVED"
    REJECTED      = "REJECTED"
    EXECUTED      = "EXECUTED"
    FAILED        = "FAILED"
    AUTO_APPROVED = "AUTO_APPROVED"


class Recommendation(Base):
    __tablename__ = "recommendations"

    id      = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Agent info
    agent_name = Column(String, nullable=False)

    # Classification
    type     = Column(String, nullable=False)
    status   = Column(String, default=RecommendationStatus.PENDING)
    priority = Column(String, default="medium")  # low / medium / high / critical

    # Content
    title       = Column(String, nullable=False)
    description = Column(String, nullable=False)
    reasoning   = Column(String, nullable=True)

    # Data (stored as JSON strings)
    data_supporting  = Column(String, nullable=True)
    action_details   = Column(String, nullable=True)
    predicted_impact = Column(String, nullable=True)

    # Risk / confidence
    risk_level       = Column(String, default="medium")  # low / medium / high
    confidence_score = Column(Integer, default=75)       # 0-100

    # Timestamps
    created_at  = Column(DateTime, default=datetime.utcnow)
    executed_at = Column(DateTime, nullable=True)

    # Relationships
    user     = relationship("User", back_populates="recommendations")
    approval = relationship("Approval", back_populates="recommendation", uselist=False)
