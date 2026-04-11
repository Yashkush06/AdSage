"""Base agent class shared by all three agents"""

from abc import ABC, abstractmethod
from typing import Dict
from sqlalchemy.orm import Session
import logging
import json


class BaseAgent(ABC):
    def __init__(self, name: str, ollama_client, meta_client):
        self.name = name
        self.ai = ollama_client
        self.meta = meta_client
        self.logger = logging.getLogger(f"agent.{name.lower().replace(' ', '_')}")

    def log_activity(self, message: str, level: str = "info", db: Session = None, user_id: int = None):
        log_fn = getattr(self.logger, level, self.logger.info)
        log_fn(f"[{self.name}] {message}")

        if db and user_id:
            try:
                from app.models.agent_log import AgentLog
                log_entry = AgentLog(
                    user_id=user_id,
                    agent_name=self.name,
                    level=level,
                    message=message,
                )
                db.add(log_entry)
                db.commit()
            except Exception as e:
                self.logger.error(f"Failed to persist log: {e}")

    @abstractmethod
    async def analyze(self, user_id: int, db_session: Session) -> Dict:
        pass

    def _json_dumps(self, obj) -> str:
        return json.dumps(obj, default=str)
