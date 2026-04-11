"""
Agent Orchestrator — Hackathon version.
Runs all four agents sequentially. No Slack, no Celery, no Redis.
Supports WebSocket broadcast and auto-approval of low-risk recommendations.
"""

from typing import Dict, Callable, Optional
from sqlalchemy.orm import Session
from app.agents.performance_detective import PerformanceDetective
from app.agents.budget_strategist import BudgetStrategist
from app.agents.growth_executor import GrowthExecutor
from app.agents.creative_analyst import CreativeAnalyst
from app.integrations.ollama_api import OllamaClient
from app.integrations.demo_meta_client import DemoMetaClient
import logging

logger = logging.getLogger(__name__)


class AgentOrchestrator:
    def __init__(self, user_id: int):
        self.user_id = user_id
        self.ollama = OllamaClient()
        self.meta = DemoMetaClient(user_id)

        self.detective = PerformanceDetective(self.ollama, self.meta)
        self.strategist = BudgetStrategist(self.ollama, self.meta)
        self.executor = GrowthExecutor(self.ollama, self.meta)
        self.creative = CreativeAnalyst(self.ollama, self.meta)

    async def run_cycle(
        self,
        db: Session,
        broadcast_fn: Optional[Callable] = None,
    ) -> Dict:
        """Run all four agents in sequence, then auto-approve low-risk items."""
        results: Dict[str, Dict] = {}

        async def _broadcast(msg: str, event_type: str = "agent_activity"):
            if broadcast_fn:
                try:
                    await broadcast_fn({
                        "type": event_type,
                        "message": msg,
                        "user_id": self.user_id,
                    })
                except Exception:
                    pass
            logger.info(f"[Orchestrator] {msg}")

        await _broadcast("🔍 Performance Detective starting analysis…")
        results["performance_detective"] = await self.detective.analyze(self.user_id, db)
        recs_pd = results["performance_detective"].get("recommendations_created", 0)
        await _broadcast(f"✅ Performance Detective done — {recs_pd} recommendation(s)")

        await _broadcast("💰 Budget Strategist optimizing budget allocation…")
        results["budget_strategist"] = await self.strategist.analyze(self.user_id, db)
        recs_bs = results["budget_strategist"].get("recommendations_created", 0)
        await _broadcast(f"✅ Budget Strategist done — {recs_bs} recommendation(s)")

        await _broadcast("🚀 Growth Executor scanning for scaling opportunities…")
        results["growth_executor"] = await self.executor.analyze(self.user_id, db)
        recs_ge = results["growth_executor"].get("recommendations_created", 0)
        await _broadcast(f"✅ Growth Executor done — {recs_ge} recommendation(s)")

        await _broadcast("🎨 Creative Analyst evaluating ad creative performance…")
        results["creative_analyst"] = await self.creative.analyze(self.user_id, db)
        recs_ca = results["creative_analyst"].get("recommendations_created", 0)
        await _broadcast(f"✅ Creative Analyst done — {recs_ca} recommendation(s)")

        # Auto-approve low-risk, high-confidence recommendations
        auto_approved = await self._auto_approve(db)
        if auto_approved:
            await _broadcast(
                f"🤖 Auto-approved {auto_approved} low-risk recommendation(s)",
                event_type="auto_approval",
            )

        total = recs_pd + recs_bs + recs_ge + recs_ca
        await _broadcast(
            f"🎯 Agent cycle complete — {total} recommendations created, {auto_approved} auto-approved",
            event_type="cycle_complete",
        )

        return {
            "user_id": self.user_id,
            "total_recommendations": total,
            "auto_approved": auto_approved,
            "results": results,
        }

    async def _auto_approve(self, db: Session) -> int:
        """
        Auto-approve recommendations that meet all of:
          - risk_level == 'low'
          - confidence_score >= 85
          - type in (CREATIVE_REFRESH, BUDGET_DECREASE by <30%)
        Returns count of auto-approved items.
        """
        from app.models.recommendation import Recommendation, RecommendationStatus, RecommendationType
        from app.models.approval import Approval
        from datetime import datetime
        import json

        AUTO_APPROVE_TYPES = {
            RecommendationType.CREATIVE_REFRESH,
        }

        pending = db.query(Recommendation).filter(
            Recommendation.user_id == self.user_id,
            Recommendation.status == RecommendationStatus.PENDING,
            Recommendation.risk_level == "low",
            Recommendation.confidence_score >= 85,
        ).all()

        count = 0
        for rec in pending:
            if rec.type not in AUTO_APPROVE_TYPES:
                continue

            rec.status = RecommendationStatus.AUTO_APPROVED
            rec.executed_at = datetime.utcnow()
            db.add(Approval(
                user_id=self.user_id,
                recommendation_id=rec.id,
                decision="auto_approved",
                notes="Automatically approved: low risk, high confidence",
                decided_at=datetime.utcnow(),
            ))
            count += 1

        if count:
            db.commit()
        return count
