"""
RecommendationService — business logic around recommendations.
Keeps the API routers thin.
"""

from __future__ import annotations

import json
from datetime import datetime
from typing import List, Optional, Dict, Any

from sqlalchemy.orm import Session

from app.models.recommendation import Recommendation, RecommendationStatus, RecommendationType
from app.models.approval import Approval
from app.integrations.demo_meta_client import DemoMetaClient


def serialize_recommendation(rec: Recommendation) -> Dict[str, Any]:
    """Convert a Recommendation ORM row to a plain dict (JSON-safe)."""
    return {
        "id": rec.id,
        "agent_name": rec.agent_name,
        "type": rec.type,
        "status": rec.status,
        "priority": rec.priority,
        "title": rec.title,
        "description": rec.description,
        "reasoning": rec.reasoning,
        "risk_level": rec.risk_level,
        "confidence_score": rec.confidence_score,
        "data_supporting": _safe_json(rec.data_supporting),
        "action_details": _safe_json(rec.action_details),
        "predicted_impact": _safe_json(rec.predicted_impact),
        "created_at": rec.created_at.isoformat() if rec.created_at else None,
        "executed_at": rec.executed_at.isoformat() if rec.executed_at else None,
    }


class RecommendationService:
    """CRUD + execution helpers for Recommendation objects."""

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        self._meta: Optional[DemoMetaClient] = None

    @property
    def meta(self) -> DemoMetaClient:
        if self._meta is None:
            self._meta = DemoMetaClient(user_id=self.user_id)
        return self._meta

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    def list_pending(self, limit: int = 100) -> List[Recommendation]:
        return (
            self.db.query(Recommendation)
            .filter(
                Recommendation.user_id == self.user_id,
                Recommendation.status == RecommendationStatus.PENDING,
            )
            .order_by(Recommendation.created_at.desc())
            .limit(limit)
            .all()
        )

    def list_history(self, limit: int = 50) -> List[Recommendation]:
        return (
            self.db.query(Recommendation)
            .filter(
                Recommendation.user_id == self.user_id,
                Recommendation.status.in_([
                    RecommendationStatus.APPROVED,
                    RecommendationStatus.REJECTED,
                    RecommendationStatus.EXECUTED,
                    RecommendationStatus.AUTO_APPROVED,
                    RecommendationStatus.FAILED,
                ]),
            )
            .order_by(Recommendation.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_by_id(self, rec_id: int) -> Optional[Recommendation]:
        return self.db.query(Recommendation).filter(
            Recommendation.id == rec_id,
            Recommendation.user_id == self.user_id,
        ).first()

    def get_stats(self) -> Dict[str, Any]:
        """Return aggregate recommendation statistics for the dashboard."""
        all_recs = self.db.query(Recommendation).filter(
            Recommendation.user_id == self.user_id
        ).all()

        by_status: Dict[str, int] = {}
        by_type: Dict[str, int] = {}
        by_agent: Dict[str, int] = {}
        by_priority: Dict[str, int] = {}

        for r in all_recs:
            by_status[r.status] = by_status.get(r.status, 0) + 1
            by_type[r.type] = by_type.get(r.type, 0) + 1
            by_agent[r.agent_name] = by_agent.get(r.agent_name, 0) + 1
            by_priority[r.priority] = by_priority.get(r.priority, 0) + 1

        return {
            "total": len(all_recs),
            "by_status": by_status,
            "by_type": by_type,
            "by_agent": by_agent,
            "by_priority": by_priority,
            "pending": by_status.get(RecommendationStatus.PENDING, 0),
            "approved": by_status.get(RecommendationStatus.APPROVED, 0) + by_status.get(RecommendationStatus.AUTO_APPROVED, 0),
            "executed": by_status.get(RecommendationStatus.EXECUTED, 0),
            "rejected": by_status.get(RecommendationStatus.REJECTED, 0),
        }

    # ------------------------------------------------------------------
    # Mutations
    # ------------------------------------------------------------------

    def approve(self, rec: Recommendation, notes: Optional[str] = None) -> Dict[str, Any]:
        """Execute the action for a recommendation then mark it approved/executed."""
        action = _safe_json(rec.action_details) or {}
        action_type = action.get("action", "")
        execution_result: Dict[str, Any] = {"executed": False}

        try:
            if action_type == "pause_campaign":
                ok = self.meta.pause_campaign(action["campaign_id"])
                execution_result = {"executed": ok}
            elif action_type in ("update_budget", "reduce_budget"):
                ok = self.meta.update_campaign_budget(
                    action["campaign_id"],
                    action.get("new_daily_budget", action.get("new_budget", 0)),
                )
                execution_result = {"executed": ok}
            elif action_type == "duplicate_campaign":
                new_id = self.meta.duplicate_campaign(
                    action["campaign_id"], action["new_name"], action["new_budget"]
                )
                execution_result = {"executed": bool(new_id), "new_campaign_id": new_id}
            else:
                execution_result = {"executed": True, "note": "Action simulated (no live API)"}
        except Exception as exc:
            execution_result = {"executed": False, "error": str(exc)}

        rec.status = (
            RecommendationStatus.EXECUTED
            if execution_result["executed"]
            else RecommendationStatus.APPROVED
        )
        rec.executed_at = datetime.utcnow()
        self.db.add(
            Approval(
                user_id=self.user_id,
                recommendation_id=rec.id,
                decision="approved",
                notes=notes,
                decided_at=datetime.utcnow(),
            )
        )
        self.db.commit()
        return execution_result

    def reject(self, rec: Recommendation, notes: Optional[str] = None) -> None:
        rec.status = RecommendationStatus.REJECTED
        self.db.add(
            Approval(
                user_id=self.user_id,
                recommendation_id=rec.id,
                decision="rejected",
                notes=notes,
                decided_at=datetime.utcnow(),
            )
        )
        self.db.commit()

    def bulk_reject(self, rec_ids: List[int], notes: Optional[str] = None) -> int:
        """Reject multiple recommendations at once. Returns count rejected."""
        count = 0
        for rid in rec_ids:
            rec = self.get_by_id(rid)
            if rec and rec.status == RecommendationStatus.PENDING:
                self.reject(rec, notes=notes)
                count += 1
        return count


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _safe_json(raw: Optional[str]) -> Any:
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except Exception:
        return {}
