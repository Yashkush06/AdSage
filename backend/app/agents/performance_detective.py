"""
Performance Detective
Identifies underperforming campaigns and creates PAUSE / ADJUST recommendations.
"""

import json
from typing import Dict
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.models.recommendation import Recommendation, RecommendationType, RecommendationStatus
import logging

logger = logging.getLogger(__name__)


class PerformanceDetective(BaseAgent):
    def __init__(self, ollama_client, meta_client):
        super().__init__("Performance Detective", ollama_client, meta_client)

    async def analyze(self, user_id: int, db: Session) -> Dict:
        self.log_activity("Starting performance analysis…", db=db, user_id=user_id)

        try:
            from app.models.user import User
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return {"error": "User not found"}

            target_cpa = user.target_cpa or 400
            target_roas = user.target_roas or 3.0

            campaigns = self.meta.get_campaigns(status=["ACTIVE"])
            perf_data = []
            for c in campaigns:
                ins = self.meta.get_campaign_insights(c["id"])
                if ins:
                    perf_data.append({**c, **ins})

            # AI analysis
            user_goals = {
                "target_cpa": target_cpa,
                "target_roas": target_roas,
                "business_name": user.business_name or "Demo Business",
                "industry": user.industry or "E-commerce",
            }
            analysis = await self.ai.analyze_performance(perf_data, user_goals)

            created = 0
            for campaign in perf_data:
                cpa = campaign.get("cpa", 0)
                roas = campaign.get("roas", 0)
                cid = campaign["id"]
                cname = campaign.get("name", cid)

                # Existing pending rec for this campaign?
                existing = db.query(Recommendation).filter(
                    Recommendation.user_id == user_id,
                    Recommendation.status == RecommendationStatus.PENDING,
                    Recommendation.action_details.contains(cid),
                ).first()
                if existing:
                    continue

                if cpa > target_cpa * 3:
                    rec = Recommendation(
                        user_id=user_id,
                        agent_name=self.name,
                        type=RecommendationType.PAUSE_CAMPAIGN,
                        status=RecommendationStatus.PENDING,
                        priority="critical",
                        title=f"Pause '{cname}' — CPA Critical",
                        description=(
                            f"CPA ₹{cpa:.0f} is {cpa/target_cpa:.1f}x your target ₹{target_cpa:.0f}. "
                            f"Pausing will save ₹{campaign.get('daily_budget',0):.0f}/day."
                        ),
                        reasoning=f"Over 3x CPA threshold. ROAS {roas:.2f}x is {'below' if roas < 1 else 'near'} break-even.",
                        data_supporting=self._json_dumps({
                            "current_cpa": cpa,
                            "target_cpa": target_cpa,
                            "current_roas": roas,
                            "spend_30d": campaign.get("spend", 0),
                        }),
                        action_details=self._json_dumps({"action": "pause_campaign", "campaign_id": cid}),
                        predicted_impact=self._json_dumps({
                            "daily_savings": campaign.get("daily_budget", 0),
                            "wasted_spend_prevented": "High",
                        }),
                        risk_level="low",
                        confidence_score=92,
                    )
                    db.add(rec)
                    created += 1

                elif roas < 1.0:
                    rec = Recommendation(
                        user_id=user_id,
                        agent_name=self.name,
                        type=RecommendationType.BUDGET_DECREASE,
                        status=RecommendationStatus.PENDING,
                        priority="high",
                        title=f"Reduce Budget — '{cname}' Below Break-Even",
                        description=(
                            f"ROAS {roas:.2f}x means every ₹1 spent returns ₹{roas:.2f}. "
                            "Reduce budget by 40% to limit losses while testing creative."
                        ),
                        reasoning="ROAS below 1.0 means campaign is losing money.",
                        data_supporting=self._json_dumps({
                            "current_roas": roas, "target_roas": target_roas,
                            "current_cpa": cpa, "spend_30d": campaign.get("spend", 0),
                        }),
                        action_details=self._json_dumps({
                            "action": "reduce_budget",
                            "campaign_id": cid,
                            "reduction_pct": 40,
                        }),
                        predicted_impact=self._json_dumps({"roas_stabilization": "Expected in 7 days"}),
                        risk_level="low",
                        confidence_score=85,
                    )
                    db.add(rec)
                    created += 1

            db.commit()
            self.log_activity(f"Analysis complete — {created} recommendations created", db=db, user_id=user_id)
            return {
                "status": "success",
                "analysis": analysis,
                "recommendations_created": created,
                "campaigns_analyzed": len(perf_data),
            }

        except Exception as e:
            self.log_activity(f"Error: {e}", level="error", db=db, user_id=user_id)
            return {"status": "error", "message": str(e)}
