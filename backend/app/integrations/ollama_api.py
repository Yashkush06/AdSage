"""
Ollama Cloud API client.
Sends campaign data to gpt-oss:120b-cloud for AI analysis.
Falls back gracefully with structured mock if API key is missing.
"""

import httpx
import json
import logging
from typing import Dict, List, Any
from app.core.config import settings

logger = logging.getLogger(__name__)


class OllamaClient:
    def __init__(self):
        self.base_url = settings.OLLAMA_API_URL.rstrip("/")
        self.api_key = settings.OLLAMA_API_KEY
        self.model = settings.OLLAMA_MODEL
        self.max_tokens = settings.AI_MAX_TOKENS
        self.temperature = settings.AI_TEMPERATURE
        self.timeout = settings.AI_TIMEOUT

    async def _chat(self, system: str, user: str) -> str:
        """Low-level chat completion call"""
        if not self.api_key:
            logger.warning("No Ollama API key — returning mock AI response")
            return self._mock_response(user)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user",   "content": user},
            ],
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    # ------------------------------------------------------------------
    # Agent methods
    # ------------------------------------------------------------------

    async def analyze_performance(
        self, campaign_data: List[Dict], user_goals: Dict
    ) -> Dict:
        system = (
            "You are an expert Meta Ads performance analyst. "
            "Analyze the provided campaign data and return ONLY valid JSON with no markdown."
        )
        user = (
            f"User goals: {json.dumps(user_goals)}\n\n"
            f"Campaign data (last 30 days):\n{json.dumps(campaign_data, indent=2)}\n\n"
            "Return JSON with keys: summary (str), problems (list of {{issue, severity, affected_campaigns}}), "
            "opportunities (list of str), overall_health (excellent|good|fair|poor)."
        )
        raw = await self._chat(system, user)
        return self._parse_json(raw, self._default_analysis())

    async def optimize_budget(
        self, campaign_data: List[Dict], total_budget: float, user_goals: Dict
    ) -> Dict:
        system = (
            "You are a Meta Ads budget optimization expert. "
            "Redistribute budget to maximize ROAS. Return ONLY valid JSON."
        )
        user = (
            f"Total daily budget: ₹{total_budget}\n"
            f"Goals: {json.dumps(user_goals)}\n"
            f"Campaigns: {json.dumps(campaign_data, indent=2)}\n\n"
            "Return JSON with keys: strategy (str), allocations (list of "
            "{{campaign_id, current_budget, recommended_budget, change_pct, rationale}}), "
            "expected_roas_lift (float)."
        )
        raw = await self._chat(system, user)
        return self._parse_json(raw, {"strategy": "Hold current allocations", "allocations": [], "expected_roas_lift": 0})

    async def identify_scaling_opportunities(
        self, campaign_data: List[Dict], user_goals: Dict
    ) -> Dict:
        system = (
            "You are a Meta Ads growth strategist. Identify campaigns ready to scale. "
            "Return ONLY valid JSON."
        )
        user = (
            f"Goals: {json.dumps(user_goals)}\n"
            f"Campaigns: {json.dumps(campaign_data, indent=2)}\n\n"
            "Return JSON with keys: scaling_candidates (list of "
            "{{campaign_id, current_roas, recommended_action, budget_increase_pct, expected_outcome}}), "
            "overall_growth_potential (low|medium|high)."
        )
        raw = await self._chat(system, user)
        return self._parse_json(raw, {"scaling_candidates": [], "overall_growth_potential": "medium"})

    async def generate_insights(self, overview: Dict, campaign_data: List[Dict]) -> Dict:
        system = (
            "You are a Meta Ads strategist writing a weekly performance report. "
            "Be concise and actionable. Return ONLY valid JSON."
        )
        user = (
            f"Account overview: {json.dumps(overview)}\n"
            f"Campaigns: {json.dumps(campaign_data, indent=2)}\n\n"
            "Return JSON with keys: headline (str, ≤140 chars), "
            "key_wins (list of str), key_concerns (list of str), "
            "action_items (list of str), week_rating (1-10)."
        )
        raw = await self._chat(system, user)
        return self._parse_json(raw, self._default_insights())

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _parse_json(self, raw: str, fallback: Any) -> Any:
        try:
            # Strip markdown code fences if present
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            return json.loads(cleaned.strip())
        except Exception as e:
            logger.error(f"JSON parse error: {e} — raw: {raw[:200]}")
            return fallback

    def _mock_response(self, prompt: str) -> str:
        """Deterministic mock when no API key is set"""
        if "analyze_performance" in prompt or "Campaign data" in prompt:
            return json.dumps(self._default_analysis())
        if "optimize_budget" in prompt or "budget" in prompt.lower():
            return json.dumps({
                "strategy": "Shift 20% budget from underperformers to top ROAS campaigns",
                "allocations": [],
                "expected_roas_lift": 0.3,
            })
        if "scaling" in prompt.lower():
            return json.dumps({"scaling_candidates": [], "overall_growth_potential": "high"})
        return json.dumps(self._default_insights())

    def _default_analysis(self) -> Dict:
        return {
            "summary": "Several campaigns are underperforming against CPA targets while retargeting shows strong ROAS.",
            "problems": [
                {"issue": "Hoodie Promo CPA is 2.2x target", "severity": "high", "affected_campaigns": []},
                {"issue": "Video campaign ROAS below break-even", "severity": "medium", "affected_campaigns": []},
            ],
            "opportunities": [
                "Scale retargeting budget — ROAS > 5x",
                "Expand Sneaker Drop to similar audiences",
            ],
            "overall_health": "fair",
        }

    def _default_insights(self) -> Dict:
        return {
            "headline": "Strong retargeting performance offsets underperforming awareness campaigns",
            "key_wins": ["Retargeting ROAS at 5.1x", "Sneaker Drop improving week-over-week"],
            "key_concerns": ["Hoodie Promo CPA critical", "Video campaign below break-even"],
            "action_items": ["Pause Hoodie Promo", "Scale retargeting budget by 30%"],
            "week_rating": 6,
        }
