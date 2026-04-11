"""
Growth Executor
Identifies campaigns with strong ROAS ready for scaling or duplication.
"""

import json
from typing import Dict
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.models.recommendation import Recommendation, RecommendationType, RecommendationStatus
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class GrowthExecutor(BaseAgent):
    def __init__(self, ollama_client, meta_client):
        super().__init__("Growth Executor", ollama_client, meta_client)

    async def analyze(self, user_id: int, db: Session) -> Dict:
        self.log_activity("Scanning for growth opportunities…", db=db, user_id=user_id)

        try:
            from app.models.user import User
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return {"error": "User not found"}

            campaigns = self.meta.get_campaigns(status=["ACTIVE"])
            perf_data = []
            for c in campaigns:
                ins = self.meta.get_campaign_insights(c["id"])
                if ins:
                    perf_data.append({**c, **ins})

            user_goals = {
                "target_cpa": user.target_cpa or 400,
                "target_roas": user.target_roas or 3.0,
            }
            scaling_analysis = await self.ai.identify_scaling_opportunities(perf_data, user_goals)

            roas_threshold = settings.AUTO_SCALE_ROAS_THRESHOLD
            created = 0

            for campaign in perf_data:
                roas = campaign.get("roas", 0)
                cid = campaign["id"]
                cname = campaign.get("name", cid)
                daily = campaign.get("daily_budget", 0)

                existing = db.query(Recommendation).filter(
                    Recommendation.user_id == user_id,
                    Recommendation.status == RecommendationStatus.PENDING,
                    Recommendation.type == RecommendationType.SCALE_CAMPAIGN,
                    Recommendation.action_details.contains(cid),
                ).first()
                if existing:
                    continue

                if roas >= roas_threshold:
                    # Recommend duplication for audience expansion
                    new_budget = round(daily * 0.5, 0)
                    new_name = f"{cname} — Scale v2"
                    rec = Recommendation(
                        user_id=user_id,
                        agent_name=self.name,
                        type=RecommendationType.SCALE_CAMPAIGN,
                        status=RecommendationStatus.PENDING,
                        priority="high",
                        title=f"Scale '{cname}' — Duplicate to New Audience",
                        description=(
                            f"ROAS {roas:.2f}x exceeds scaling threshold ({roas_threshold}x). "
                            f"Duplicate with ₹{new_budget:.0f}/day budget to test new audience segment."
                        ),
                        reasoning=(
                            "Campaigns with sustained ROAS above threshold often succeed in expanded audiences "
                            "with the same creative. Duplication reduces risk vs. direct budget scaling."
                        ),
                        data_supporting=self._json_dumps({
                            "current_roas": roas,
                            "scaling_threshold": roas_threshold,
                            "current_daily_budget": daily,
                            "proposed_new_budget": new_budget,
                        }),
                        action_details=self._json_dumps({
                            "action": "duplicate_campaign",
                            "campaign_id": cid,
                            "new_name": new_name,
                            "new_budget": new_budget,
                        }),
                        predicted_impact=self._json_dumps({
                            "expected_additional_conversions": "15-25% lift",
                            "incremental_daily_spend": f"₹{new_budget:.0f}",
                            "expected_roas": f"{roas * 0.85:.2f}x (conservative)",
                        }),
                        risk_level="medium",
                        confidence_score=80,
                    )
                    db.add(rec)
                    created += 1

            db.commit()
            self.log_activity(f"Growth analysis complete — {created} scaling opportunities found", db=db, user_id=user_id)
            return {
                "status": "success",
                "scaling_analysis": scaling_analysis,
                "recommendations_created": created,
                "campaigns_evaluated": len(perf_data),
            }

        except Exception as e:
            self.log_activity(f"Error: {e}", level="error", db=db, user_id=user_id)
            return {"status": "error", "message": str(e)}
