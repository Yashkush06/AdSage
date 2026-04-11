"""Base agent class shared by all AdSage agents."""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session
import logging
import json


class BaseAgent(ABC):
    def __init__(self, name: str, ollama_client, meta_client):
        self.name = name
        self.ai = ollama_client
        self.meta = meta_client
        self.logger = logging.getLogger(f"agent.{name.lower().replace(' ', '_')}")

    # ------------------------------------------------------------------
    # Activity logging
    # ------------------------------------------------------------------

    def log_activity(
        self,
        message: str,
        level: str = "info",
        db: Optional[Session] = None,
        user_id: Optional[int] = None,
        extra_data: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Log to Python's logging system and, optionally, persist to DB.

        The DB write uses a *savepoint* so a failure there does not roll back
        any work the calling agent has already done in the same session.
        """
        log_fn = getattr(self.logger, level, self.logger.info)
        log_fn("[%s] %s", self.name, message)

        if db is None or user_id is None:
            return

        try:
            from app.models.agent_log import AgentLog

            log_entry = AgentLog(
                user_id=user_id,
                agent_name=self.name,
                level=level,
                message=message,
                extra_data=self._json_dumps(extra_data) if extra_data else None,
            )
            db.add(log_entry)
            # Use a nested savepoint so a failure here doesn't poison the
            # parent transaction that the agent is mid-way through.
            db.flush()
        except Exception as exc:
            self.logger.error("[%s] Failed to persist log entry: %s", self.name, exc)
            db.rollback()

    # ------------------------------------------------------------------
    # Abstract interface
    # ------------------------------------------------------------------

    @abstractmethod
    async def analyze(self, user_id: int, db_session: Session) -> Dict:
        """Run the agent's analysis and return a result dict."""

    # ------------------------------------------------------------------
    # Shared helpers
    # ------------------------------------------------------------------

    def _json_dumps(self, obj: Any) -> str:
        """Serialize *obj* to a JSON string, falling back gracefully."""
        try:
            return json.dumps(obj, default=str)
        except (TypeError, ValueError) as exc:
            self.logger.warning("[%s] JSON serialisation failed: %s", self.name, exc)
            return json.dumps({"serialisation_error": str(exc)})

    def _make_result(
        self,
        *,
        status: str = "success",
        recommendations_created: int = 0,
        campaigns_evaluated: int = 0,
        extra: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Build a standard result dict returned by every agent's analyze()."""
        result: Dict[str, Any] = {
            "status": status,
            "agent": self.name,
            "recommendations_created": recommendations_created,
            "campaigns_evaluated": campaigns_evaluated,
        }
        if extra:
            result.update(extra)
        return result
