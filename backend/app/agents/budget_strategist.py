"""
Budget Strategist
Reallocates daily budgets from underperformers to high-ROAS campaigns.
"""

import json
from typing import Dict
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.models.recommendation import Recommendation, RecommendationType, RecommendationStatus
import logging

logger = logging.getLogger(__name__)


class BudgetStrategist(BaseAgent):
    def __init__(self, ollama_client, meta_client):
        super().__init__("Budget Strategist", ollama_client, meta_client)

    async def analyze(self, user_id: int, db: Session) -> Dict:
        self.log_activity("Starting budget optimization analysis…", db=db, user_id=user_id)

        try:
            from app.models.user import User
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return {"error": "User not found"}

            campaigns = self.meta.get_campaigns(status=["ACTIVE"])
            perf_data = []
            total_daily_budget = 0

            for c in campaigns:
                ins = self.meta.get_campaign_insights(c["id"])
                if ins:
                    daily = ins.get("daily_budget", 0)
                    total_daily_budget += daily
                    perf_data.append({**c, **ins})

            user_goals = {
                "target_cpa": user.target_cpa or 400,
                "target_roas": user.target_roas or 3.0,
            }

            optimization = await self.ai.optimize_budget(perf_data, total_daily_budget, user_goals)

            created = 0
            # Sort campaigns: underperformers first (low ROAS)
            sorted_campaigns = sorted(perf_data, key=lambda x: x.get("roas", 0))

            for campaign in perf_data:
                roas = campaign.get("roas", 0)
                target_roas = user.target_roas or 3.0
                cid = campaign["id"]
                cname = campaign.get("name", cid)
                daily = campaign.get("daily_budget", 0)

                # Skip if already have a pending budget rec
                existing = db.query(Recommendation).filter(
                    Recommendation.user_id == user_id,
                    Recommendation.status == RecommendationStatus.PENDING,
                    Recommendation.type.in_([
                        RecommendationType.BUDGET_INCREASE,
                        RecommendationType.BUDGET_DECREASE,
                    ]),
                    Recommendation.action_details.contains(cid),
                ).first()
                if existing:
                    continue

                if roas > target_roas * 1.5 and daily > 0:
                    # Winner — increase budget 30%
                    new_budget = round(daily * 1.30, 0)
                    rec = Recommendation(
                        user_id=user_id,
                        agent_name=self.name,
                        type=RecommendationType.BUDGET_INCREASE,
                        status=RecommendationStatus.PENDING,
                        priority="high",
                        title=f"Increase Budget 30% — '{cname}'",
                        description=(
                            f"ROAS {roas:.2f}x is {roas/target_roas:.1f}x your target. "
                            f"Increasing from ₹{daily:.0f} to ₹{new_budget:.0f}/day."
                        ),
                        reasoning=f"Campaign consistently exceeds ROAS target. Scaling budget to capture more conversions.",
                        data_supporting=self._json_dumps({
                            "current_roas": roas, "target_roas": target_roas,
                            "current_budget": daily, "proposed_budget": new_budget,
                        }),
                        action_details=self._json_dumps({
                            "action": "update_budget",
                            "campaign_id": cid,
                            "new_daily_budget": new_budget,
                        }),
                        predicted_impact=self._json_dumps({
                            "expected_additional_revenue": f"₹{(new_budget - daily) * roas:.0f}/day",
                            "budget_increase": f"₹{new_budget - daily:.0f}/day",
                        }),
                        risk_level="low",
                        confidence_score=88,
                    )
                    db.add(rec)
                    created += 1

                elif roas < 1.5 and roas > 0 and daily > 300:
                    # Underperformer — reduce 25%
                    new_budget = round(daily * 0.75, 0)
                    rec = Recommendation(
                        user_id=user_id,
                        agent_name=self.name,
                        type=RecommendationType.BUDGET_DECREASE,
                        status=RecommendationStatus.PENDING,
                        priority="medium",
                        title=f"Reduce Budget 25% — '{cname}'",
                        description=(
                            f"ROAS {roas:.2f}x is below target. "
                            f"Reducing from ₹{daily:.0f} to ₹{new_budget:.0f}/day frees ₹{daily - new_budget:.0f}."
                        ),
                        reasoning="Reallocating budget from underperformers to top campaigns maximizes account ROAS.",
                        data_supporting=self._json_dumps({
                            "current_roas": roas, "target_roas": target_roas,
                            "current_budget": daily, "proposed_budget": new_budget,
                        }),
                        action_details=self._json_dumps({
                            "action": "update_budget",
                            "campaign_id": cid,
                            "new_daily_budget": new_budget,
                        }),
                        predicted_impact=self._json_dumps({
                            "freed_budget": f"₹{daily - new_budget:.0f}/day",
                            "account_roas_lift": "Estimated +0.2-0.4x",
                        }),
                        risk_level="medium",
                        confidence_score=78,
                    )
                    db.add(rec)
                    created += 1

            db.commit()
            self.log_activity(f"Budget optimization complete — {created} recommendations", db=db, user_id=user_id)
            return {
                "status": "success",
                "optimization": optimization,
                "recommendations_created": created,
                "total_daily_budget_analyzed": total_daily_budget,
            }

        except Exception as e:
            self.log_activity(f"Error: {e}", level="error", db=db, user_id=user_id)
            return {"status": "error", "message": str(e)}
