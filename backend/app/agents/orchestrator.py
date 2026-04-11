"""
Agent Orchestrator — Hackathon version.
Runs all three agents sequentially. No Slack, no Celery, no Redis.
"""

from typing import Dict
from sqlalchemy.orm import Session
from app.agents.performance_detective import PerformanceDetective
from app.agents.budget_strategist import BudgetStrategist
from app.agents.growth_executor import GrowthExecutor
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

    async def run_cycle(self, db: Session, broadcast_fn=None) -> Dict:
        """Run all three agents in sequence"""
        results: Dict[str, Dict] = {}

        async def _broadcast(msg: str):
            if broadcast_fn:
                try:
                    await broadcast_fn({"type": "agent_activity", "message": msg, "user_id": self.user_id})
                except Exception:
                    pass
            logger.info(f"[Orchestrator] {msg}")

        await _broadcast("🔍 Performance Detective starting analysis…")
        results["performance_detective"] = await self.detective.analyze(self.user_id, db)
        recs_pd = results["performance_detective"].get("recommendations_created", 0)
        await _broadcast(f"✅ Performance Detective done — {recs_pd} recommendations")

        await _broadcast("💰 Budget Strategist optimizing budget allocation…")
        results["budget_strategist"] = await self.strategist.analyze(self.user_id, db)
        recs_bs = results["budget_strategist"].get("recommendations_created", 0)
        await _broadcast(f"✅ Budget Strategist done — {recs_bs} recommendations")

        await _broadcast("🚀 Growth Executor scanning for scaling opportunities…")
        results["growth_executor"] = await self.executor.analyze(self.user_id, db)
        recs_ge = results["growth_executor"].get("recommendations_created", 0)
        await _broadcast(f"✅ Growth Executor done — {recs_ge} recommendations")

        total = recs_pd + recs_bs + recs_ge
        await _broadcast(f"🎯 Agent cycle complete — {total} total recommendations created")

        return {"user_id": self.user_id, "total_recommendations": total, "results": results}
