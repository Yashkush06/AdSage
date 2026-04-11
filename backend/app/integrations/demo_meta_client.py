"""
DemoMetaClient — wraps DemoDataGenerator to mimic the Meta Ads API interface.
Swap this class for a real MetaClient when connecting to the live API.
"""

from typing import Dict, List, Optional
from app.integrations.demo_data import DemoDataGenerator
import logging

logger = logging.getLogger(__name__)

# Module-level cache: one generator per user_id
_generators: Dict[int, DemoDataGenerator] = {}


def _get_generator(user_id: int) -> DemoDataGenerator:
    if user_id not in _generators:
        _generators[user_id] = DemoDataGenerator(user_id)
    return _generators[user_id]


class DemoMetaClient:
    """Demo client that mimics the Meta Ads API interface"""

    def __init__(self, user_id: int = 1):
        self.user_id = user_id
        self.gen = _get_generator(user_id)
        logger.info(f"DemoMetaClient ready for user {user_id}")

    def get_campaigns(self, status: Optional[List[str]] = None) -> List[Dict]:
        return self.gen.get_campaigns(status)

    def get_campaign_insights(self, campaign_id: str, days: int = 30) -> Dict:
        return self.gen.get_campaign_insights(campaign_id, days)

    def get_daily_trend(self, campaign_id: str, days: int = 30) -> List[Dict]:
        return self.gen.get_daily_trend(campaign_id, days)

    def get_audience_breakdown(self, campaign_id: str) -> Dict:
        return self.gen.get_audience_breakdown(campaign_id)

    def get_funnel_data(self, campaign_id: str) -> Dict:
        return self.gen.get_funnel_data(campaign_id)

    def get_overview_metrics(self) -> Dict:
        return self.gen.get_overview_metrics()

    def update_campaign_budget(self, campaign_id: str, new_daily_budget: float) -> bool:
        return self.gen.update_campaign_budget(campaign_id, new_daily_budget)

    def pause_campaign(self, campaign_id: str) -> bool:
        return self.gen.pause_campaign(campaign_id)

    def duplicate_campaign(
        self, campaign_id: str, new_name: str, new_budget: float
    ) -> Optional[str]:
        return self.gen.duplicate_campaign(campaign_id, new_name, new_budget)

    def simulate_time_progression(self, hours: int = 4):
        self.gen.simulate_time_progression(hours)
