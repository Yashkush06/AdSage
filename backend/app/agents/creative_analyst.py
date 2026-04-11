"""
Creative Analyst
Evaluates ad creative performance (CTR, frequency, fatigue) and suggests
refreshes, A/B tests, or format switches.
"""

import json
from typing import Dict
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.models.recommendation import Recommendation, RecommendationType, RecommendationStatus
import logging

logger = logging.getLogger(__name__)

# CTR benchmarks by campaign objective
CTR_BENCHMARKS = {
    "CONVERSIONS": 2.0,
    "BRAND_AWARENESS": 1.2,
    "VIDEO_VIEWS": 1.5,
    "TRAFFIC": 2.5,
    "REACH": 0.9,
}

# Creative fatigue signal: CTR below 60% of benchmark suggests fatigue
FATIGUE_CTR_RATIO = 0.60


class CreativeAnalyst(BaseAgent):
    def __init__(self, ollama_client, meta_client):
        super().__init__("Creative Analyst", ollama_client, meta_client)

    async def analyze(self, user_id: int, db: Session) -> Dict:
        self.log_activity("Analysing creative performance & fatigue signals…", db=db, user_id=user_id)

        try:
            campaigns = self.meta.get_campaigns(status=["ACTIVE"])
            perf_data = []
            for c in campaigns:
                ins = self.meta.get_campaign_insights(c["id"])
                if ins:
                    perf_data.append({**c, **ins})

            # Ask AI for creative insights
            creative_analysis = await self.ai.analyze_creative(perf_data)

            created = 0
            for campaign in perf_data:
                ctr = campaign.get("ctr", 0)
                objective = campaign.get("objective", "CONVERSIONS")
                cid = campaign["id"]
                cname = campaign.get("name", cid)
                spend = campaign.get("spend", 0)
                roas = campaign.get("roas", 0)

                benchmark = CTR_BENCHMARKS.get(objective, 2.0)

                # Skip if already have a pending creative rec for this campaign
                existing = db.query(Recommendation).filter(
                    Recommendation.user_id == user_id,
                    Recommendation.status == RecommendationStatus.PENDING,
                    Recommendation.type == RecommendationType.CREATIVE_REFRESH,
                    Recommendation.action_details.contains(cid),
                ).first()
                if existing:
                    continue

                # === Creative Fatigue: CTR below threshold ===
                if ctr < benchmark * FATIGUE_CTR_RATIO and spend > 5000:
                    fatigue_ratio = round(ctr / benchmark * 100, 1)
                    rec = Recommendation(
                        user_id=user_id,
                        agent_name=self.name,
                        type=RecommendationType.CREATIVE_REFRESH,
                        status=RecommendationStatus.PENDING,
                        priority="high",
                        title=f"Creative Refresh Required — '{cname}'",
                        description=(
                            f"CTR {ctr:.2f}% is only {fatigue_ratio}% of the {objective} "
                            f"benchmark ({benchmark:.1f}%). Audience is experiencing creative fatigue. "
                            f"Refreshing creatives typically lifts CTR by 30-50%."
                        ),
                        reasoning=(
                            "Low CTR relative to objective benchmark indicates the current creative "
                            "is no longer resonating with the audience. Refreshing ad copy, imagery, "
                            "or format will reset audience attention and improve delivery efficiency."
                        ),
                        data_supporting=self._json_dumps({
                            "current_ctr": ctr,
                            "benchmark_ctr": benchmark,
                            "objective": objective,
                            "total_spend": spend,
                            "fatigue_ratio_pct": fatigue_ratio,
                        }),
                        action_details=self._json_dumps({
                            "action": "creative_refresh",
                            "campaign_id": cid,
                            "recommended_formats": ["carousel", "video_reel", "ugc_style"],
                            "a_b_test": True,
                        }),
                        predicted_impact=self._json_dumps({
                            "expected_ctr_lift": "30-50%",
                            "expected_cpc_reduction": "15-25%",
                            "cost_to_implement": "Low",
                        }),
                        risk_level="low",
                        confidence_score=82,
                    )
                    db.add(rec)
                    created += 1

                # === Low CTR but good ROAS — test new ad format for scale ===
                elif ctr < benchmark and roas > 3.0 and spend > 10000:
                    rec = Recommendation(
                        user_id=user_id,
                        agent_name=self.name,
                        type=RecommendationType.CREATIVE_REFRESH,
                        status=RecommendationStatus.PENDING,
                        priority="medium",
                        title=f"A/B Test New Format — '{cname}'",
                        description=(
                            f"Strong ROAS ({roas:.2f}x) but CTR ({ctr:.2f}%) is below the "
                            f"{objective} benchmark ({benchmark:.1f}%). Testing a new ad format "
                            f"(e.g., Reels or Carousel) could unlock higher click volume."
                        ),
                        reasoning=(
                            "Good ROAS confirms strong product-market fit. CTR gap suggests the "
                            "creative format isn't maximising reach. An A/B test with Reels or "
                            "dynamic carousel ads can capture more clicks at the same ROAS."
                        ),
                        data_supporting=self._json_dumps({
                            "current_ctr": ctr,
                            "benchmark_ctr": benchmark,
                            "current_roas": roas,
                            "spend_30d": spend,
                        }),
                        action_details=self._json_dumps({
                            "action": "ab_test_format",
                            "campaign_id": cid,
                            "test_formats": ["instagram_reels", "dynamic_carousel"],
                            "budget_split": "80/20",
                        }),
                        predicted_impact=self._json_dumps({
                            "expected_click_volume_increase": "20-40%",
                            "roas_impact": "Neutral to +0.3x",
                        }),
                        risk_level="low",
                        confidence_score=74,
                    )
                    db.add(rec)
                    created += 1

            db.commit()
            self.log_activity(f"Creative analysis complete — {created} recommendations", db=db, user_id=user_id)
            return {
                "status": "success",
                "creative_analysis": creative_analysis,
                "recommendations_created": created,
                "campaigns_evaluated": len(perf_data),
            }

        except Exception as e:
            self.log_activity(f"Error: {e}", level="error", db=db, user_id=user_id)
            return {"status": "error", "message": str(e)}
