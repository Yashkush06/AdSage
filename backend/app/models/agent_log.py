from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    agent_name = Column(String, nullable=False)
    level = Column(String, default="info")   # info / warning / error
    message = Column(Text, nullable=False)
    extra_data = Column(Text, nullable=True)   # JSON string (avoid reserved 'metadata')

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="agent_logs")
