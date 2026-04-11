"""
Mock data generator for Meta Ads campaigns.
Simulates realistic campaign performance with variability.
No real Meta API credentials required.
"""

import random
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class DemoDataGenerator:
    """Generate realistic demo data for Meta advertising campaigns"""

    def __init__(self, user_id: int = 1):
        self.user_id = user_id
        self.campaigns_cache: Dict[str, Dict] = {}
        self._initialized = False

        # Campaign templates with realistic performance profiles
        self.campaign_templates = [
            {
                "name": "Sneaker Drop - Summer 2024",
                "objective": "CONVERSIONS",
                "status": "ACTIVE",
                "base_roas": 4.2,
                "base_cpa": 285,
                "base_ctr": 2.8,
                "daily_budget": 1500,
                "trend": "improving",
                "audience": "18-24, Delhi, Streetwear enthusiasts",
            },
            {
                "name": "Hoodie Promo - Winter Sale",
                "objective": "CONVERSIONS",
                "status": "ACTIVE",
                "base_roas": 0.9,
                "base_cpa": 892,
                "base_ctr": 1.1,
                "daily_budget": 800,
                "trend": "declining",
                "audience": "25-34, Mumbai, Fashion",
            },
            {
                "name": "Retargeting - Cart Abandoners",
                "objective": "CONVERSIONS",
                "status": "ACTIVE",
                "base_roas": 5.1,
                "base_cpa": 198,
                "base_ctr": 3.5,
                "daily_budget": 500,
                "trend": "stable",
                "audience": "Website visitors (last 7 days)",
            },
            {
                "name": "Brand Awareness - New Collection",
                "objective": "BRAND_AWARENESS",
                "status": "ACTIVE",
                "base_roas": 2.3,
                "base_cpa": 450,
                "base_ctr": 2.1,
                "daily_budget": 1200,
                "trend": "stable",
                "audience": "18-35, Metro cities, Fashion forward",
            },
            {
                "name": "Video Campaign - Product Showcase",
                "objective": "VIDEO_VIEWS",
                "status": "ACTIVE",
                "base_roas": 1.8,
                "base_cpa": 520,
                "base_ctr": 1.9,
                "daily_budget": 600,
                "trend": "improving",
                "audience": "20-30, All India, Video watchers",
            },
            {
                "name": "Flash Sale - Limited Edition",
                "objective": "CONVERSIONS",
                "status": "ACTIVE",
                "base_roas": 3.8,
                "base_cpa": 312,
                "base_ctr": 3.2,
                "daily_budget": 2000,
                "trend": "stable",
                "audience": "18-28, Bangalore, Early adopters",
            },
            {
                "name": "Lookalike Audience Test",
                "objective": "CONVERSIONS",
                "status": "ACTIVE",
                "base_roas": 2.1,
                "base_cpa": 580,
                "base_ctr": 1.7,
                "daily_budget": 400,
                "trend": "stable",
                "audience": "Lookalike 1% - Best customers",
            },
            {
                "name": "Instagram Stories - Product Drops",
                "objective": "CONVERSIONS",
                "status": "ACTIVE",
                "base_roas": 3.1,
                "base_cpa": 380,
                "base_ctr": 2.5,
                "daily_budget": 900,
                "trend": "improving",
                "audience": "18-24, Instagram heavy users",
            },
        ]

        self._initialize_campaigns()

    def _initialize_campaigns(self):
        """Pre-populate the campaign cache"""
        if self._initialized:
            return
        for idx, template in enumerate(self.campaign_templates):
            campaign_id = f"demo_{self.user_id}_{idx + 1}"
            campaign = {
                "id": campaign_id,
                "name": template["name"],
                "status": template["status"],
                "objective": template["objective"],
                "daily_budget": template["daily_budget"],
                "created_time": (
                    datetime.now() - timedelta(days=random.randint(30, 90))
                ).isoformat(),
                "updated_time": (
                    datetime.now() - timedelta(days=random.randint(1, 7))
                ).isoformat(),
                "_template": template,
            }
            self.campaigns_cache[campaign_id] = campaign
        self._initialized = True

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def get_campaigns(self, status: Optional[List[str]] = None) -> List[Dict]:
        campaigns = []
        for campaign in self.campaigns_cache.values():
            if status and campaign["status"] not in status:
                continue
            # Return sanitized version (no internal _template key)
            c = {k: v for k, v in campaign.items() if not k.startswith("_")}
            c["daily_budget_inr"] = campaign["daily_budget"]
            campaigns.append(c)
        return campaigns

    def get_campaign_insights(self, campaign_id: str, days: int = 30) -> Dict:
        campaign = self.campaigns_cache.get(campaign_id)
        if not campaign:
            logger.warning(f"Campaign {campaign_id} not found in cache")
            return {}

        template = campaign["_template"]
        vm = self._variance_multiplier(template["trend"])

        daily_budget = template["daily_budget"]
        total_spend = daily_budget * days

        roas = template["base_roas"] * vm
        cpa = template["base_cpa"] * (2 - vm)
        ctr = template["base_ctr"] * vm

        total_revenue = total_spend * roas
        conversions = int(total_spend / cpa) if cpa > 0 else 0
        impressions = int((total_spend / (ctr / 100)) / 0.5) if ctr > 0 else 0
        clicks = int(impressions * (ctr / 100))
        cpc = total_spend / clicks if clicks > 0 else 0
        conversion_rate = (conversions / clicks * 100) if clicks > 0 else 0

        return {
            "campaign_id": campaign_id,
            "campaign_name": template["name"],
            "spend": round(total_spend, 2),
            "impressions": impressions,
            "clicks": clicks,
            "conversions": conversions,
            "revenue": round(total_revenue, 2),
            "ctr": round(ctr, 2),
            "cpc": round(cpc, 2),
            "cpa": round(cpa, 2),
            "roas": round(roas, 2),
            "conversion_rate": round(conversion_rate, 2),
            "audience": template["audience"],
            "trend": template["trend"],
            "daily_budget": daily_budget,
        }

    def get_daily_trend(self, campaign_id: str, days: int = 30) -> List[Dict]:
        """Generate day-by-day performance rows for trend charts"""
        campaign = self.campaigns_cache.get(campaign_id)
        if not campaign:
            return []

        template = campaign["_template"]
        rows = []
        base_spend = template["daily_budget"]
        base_roas = template["base_roas"]

        for d in range(days, 0, -1):
            date = (datetime.now() - timedelta(days=d)).strftime("%Y-%m-%d")
            noise = random.uniform(0.9, 1.1)
            trend_factor = 1.0
            if template["trend"] == "improving":
                trend_factor = 1 + (days - d) * 0.005
            elif template["trend"] == "declining":
                trend_factor = 1 - (days - d) * 0.004

            roas = round(base_roas * trend_factor * noise, 2)
            spend = round(base_spend * random.uniform(0.85, 1.15), 2)
            revenue = round(spend * roas, 2)
            conversions = max(1, int(spend / (template["base_cpa"] * (2 - trend_factor * noise))))

            rows.append({
                "date": date,
                "spend": spend,
                "revenue": revenue,
                "roas": roas,
                "conversions": conversions,
            })
        return rows

    def get_audience_breakdown(self, campaign_id: str) -> Dict:
        insights = self.get_campaign_insights(campaign_id, days=30)
        if not insights:
            return {"audience_segments": []}

        demographics = [
            {"age": "18-24", "gender": "male",   "multiplier": 1.2},
            {"age": "18-24", "gender": "female",  "multiplier": 1.3},
            {"age": "25-34", "gender": "male",   "multiplier": 0.9},
            {"age": "25-34", "gender": "female",  "multiplier": 1.0},
            {"age": "35-44", "gender": "male",   "multiplier": 0.6},
            {"age": "35-44", "gender": "female",  "multiplier": 0.7},
        ]

        total_spend = insights["spend"]
        segments = []
        for demo in demographics:
            share = random.uniform(0.10, 0.22)
            seg_spend = total_spend * share
            m = demo["multiplier"]
            seg_roas = round(insights["roas"] * m, 2)
            seg_cpa = round(insights["cpa"] / m, 2) if m else 0
            seg_conv = max(0, int(seg_spend / seg_cpa)) if seg_cpa else 0
            seg_rev = round(seg_spend * seg_roas, 2)

            segments.append({
                "age": demo["age"],
                "gender": demo["gender"],
                "spend": round(seg_spend, 2),
                "revenue": seg_rev,
                "conversions": seg_conv,
                "cpa": seg_cpa,
                "roas": seg_roas,
            })

        return {"audience_segments": segments}

    def get_funnel_data(self, campaign_id: str) -> Dict:
        insights = self.get_campaign_insights(campaign_id, days=30)
        if not insights:
            return {"funnel_steps": []}

        clicks = insights["clicks"]
        lp_views = int(clicks * random.uniform(0.78, 0.85))
        atc = int(lp_views * random.uniform(0.40, 0.55))
        purchases = insights["conversions"]

        def drop(a, b):
            return round((1 - b / a) * 100, 1) if a > 0 else 0

        return {
            "campaign_id": campaign_id,
            "funnel_steps": [
                {"step": "Ad Click",        "label": "Ad Clicks",          "count": clicks,    "drop_rate": 0},
                {"step": "Landing Page",    "label": "Landing Page Views",  "count": lp_views,  "drop_rate": drop(clicks, lp_views)},
                {"step": "Add to Cart",     "label": "Add to Cart",         "count": atc,       "drop_rate": drop(lp_views, atc)},
                {"step": "Purchase",        "label": "Purchases",           "count": purchases, "drop_rate": drop(atc, purchases)},
            ],
        }

    def get_overview_metrics(self) -> Dict:
        """Aggregate metrics across all active campaigns"""
        total_spend = 0
        total_revenue = 0
        total_conversions = 0
        total_clicks = 0
        total_impressions = 0
        active_count = 0
        paused_count = 0

        for cid, campaign in self.campaigns_cache.items():
            if campaign["status"] == "ACTIVE":
                active_count += 1
                ins = self.get_campaign_insights(cid, days=30)
                total_spend += ins.get("spend", 0)
                total_revenue += ins.get("revenue", 0)
                total_conversions += ins.get("conversions", 0)
                total_clicks += ins.get("clicks", 0)
                total_impressions += ins.get("impressions", 0)
            else:
                paused_count += 1

        avg_roas = round(total_revenue / total_spend, 2) if total_spend else 0
        avg_cpa = round(total_spend / total_conversions, 2) if total_conversions else 0
        avg_ctr = round(total_clicks / total_impressions * 100, 2) if total_impressions else 0

        return {
            "total_spend": round(total_spend, 2),
            "total_revenue": round(total_revenue, 2),
            "total_conversions": total_conversions,
            "total_clicks": total_clicks,
            "total_impressions": total_impressions,
            "avg_roas": avg_roas,
            "avg_cpa": avg_cpa,
            "avg_ctr": avg_ctr,
            "active_campaigns": active_count,
            "paused_campaigns": paused_count,
            "period_days": 30,
        }

    # ------------------------------------------------------------------
    # Mutation helpers (simulated actions)
    # ------------------------------------------------------------------

    def update_campaign_budget(self, campaign_id: str, new_daily_budget: float) -> bool:
        campaign = self.campaigns_cache.get(campaign_id)
        if campaign:
            campaign["daily_budget"] = new_daily_budget
            campaign["_template"]["daily_budget"] = new_daily_budget
            logger.info(f"Updated budget for {campaign_id} to ₹{new_daily_budget}")
            return True
        return False

    def pause_campaign(self, campaign_id: str) -> bool:
        campaign = self.campaigns_cache.get(campaign_id)
        if campaign:
            campaign["status"] = "PAUSED"
            campaign["_template"]["status"] = "PAUSED"
            logger.info(f"Paused campaign {campaign_id}")
            return True
        return False

    def duplicate_campaign(
        self, campaign_id: str, new_name: str, new_budget: float
    ) -> Optional[str]:
        original = self.campaigns_cache.get(campaign_id)
        if not original:
            return None

        new_id = f"demo_{self.user_id}_{len(self.campaigns_cache) + 1}"
        new_template = {**original["_template"], "name": new_name, "daily_budget": new_budget}

        self.campaigns_cache[new_id] = {
            "id": new_id,
            "name": new_name,
            "status": "PAUSED",
            "objective": original["objective"],
            "daily_budget": new_budget,
            "created_time": datetime.now().isoformat(),
            "updated_time": datetime.now().isoformat(),
            "_template": new_template,
        }
        self.campaign_templates.append(new_template)
        logger.info(f"Duplicated {campaign_id} → {new_id}")
        return new_id

    def simulate_time_progression(self, hours: int = 4):
        for campaign_id, campaign in self.campaigns_cache.items():
            t = campaign["_template"]
            if t["trend"] == "improving":
                t["base_roas"] *= random.uniform(1.005, 1.015)
                t["base_cpa"] *= random.uniform(0.985, 0.995)
            elif t["trend"] == "declining":
                t["base_roas"] *= random.uniform(0.985, 0.995)
                t["base_cpa"] *= random.uniform(1.005, 1.015)
        logger.info(f"Simulated {hours}h time progression across all campaigns")

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _variance_multiplier(self, trend: str) -> float:
        if trend == "improving":
            return random.uniform(1.05, 1.15)
        elif trend == "declining":
            return random.uniform(0.85, 0.95)
        return random.uniform(0.97, 1.03)
