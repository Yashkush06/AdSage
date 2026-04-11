"""
Ollama Cloud API client.
Uses https://ollama.com/api/chat (native Ollama format) with deepseek-v3.1:671b-cloud.
Falls back gracefully to structured mock if API key is missing or unreachable.
"""

import httpx
import json
import logging
from typing import Dict, List, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

# Keys that should be treated as "not configured" → use mock
_PLACEHOLDER_KEYS = {"", "your_ollama_api_key_here", "your-api-key", "sk-xxx"}


class OllamaClient:
    def __init__(self):
        # Ollama Cloud native endpoint — always https://ollama.com/api
        self.base_url = "https://ollama.com/api"
        self.api_key = settings.OLLAMA_API_KEY
        self.model = settings.OLLAMA_MODEL          # e.g. deepseek-v3.1:671b-cloud
        self.max_tokens = settings.AI_MAX_TOKENS
        self.temperature = settings.AI_TEMPERATURE
        self.timeout = settings.AI_TIMEOUT

    async def _chat(self, system: str, user: str) -> str:
        """
        Calls https://ollama.com/api/chat (Ollama native format).
        Falls back to mock on missing key or any network/API error.
        """
        if not self.api_key or self.api_key.strip() in _PLACEHOLDER_KEYS:
            logger.info("Ollama API key not configured — using mock AI response")
            return self._mock_response(user)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        # Ollama Cloud native format — NOT OpenAI /v1/chat/completions
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user",   "content": user},
            ],
            "stream": False,
            "options": {
                "temperature": self.temperature,
                "num_predict": self.max_tokens,
            },
        }

        try:
            logger.info(f"Calling Ollama Cloud: POST {self.base_url}/chat model={self.model}")
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(
                    f"{self.base_url}/chat",
                    headers=headers,
                    json=payload,
                )
                resp.raise_for_status()
                data = resp.json()
                # Ollama native response: {"message": {"role": "assistant", "content": "..."}}
                return data["message"]["content"]
        except httpx.ConnectError as e:
            logger.warning(f"Ollama unreachable ({e}) — using mock AI response")
            return self._mock_response(user)
        except httpx.HTTPStatusError as e:
            logger.warning(f"Ollama HTTP {e.response.status_code} — {e.response.text[:200]} — using mock")
            return self._mock_response(user)
        except Exception as e:
            logger.warning(f"Ollama error ({type(e).__name__}: {e}) — using mock AI response")
            return self._mock_response(user)

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

    async def analyze_creative(
        self, campaign_data: List[Dict]
    ) -> Dict:
        system = (
            "You are a Meta Ads creative strategist. Analyse ad CTR and creative fatigue signals. "
            "Return ONLY valid JSON."
        )
        user = (
            f"Campaign data: {json.dumps(campaign_data, indent=2)}\n\n"
            "Return JSON with keys: fatigued_campaigns (list of campaign names), "
            "format_recommendations (list of {{campaign_id, recommended_formats}}), "
            "creative_health (excellent|good|fair|poor), "
            "summary (str)."
        )
        raw = await self._chat(system, user)
        return self._parse_json(raw, self._default_creative_analysis())

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
        p = prompt.lower()
        # generate_insights prompt contains 'account overview' and asks for 'week_rating'
        if "account overview" in p or "week_rating" in p or "weekly" in p:
            return json.dumps(self._default_insights())
        if "creative strategist" in p or "ctr" in p or "fatigue" in p:
            return json.dumps(self._default_creative_analysis())
        if "campaign data" in p and "problems" in p:
            return json.dumps(self._default_analysis())
        if "budget" in p and "allocations" in p:
            return json.dumps({
                "strategy": "Shift 20% budget from underperformers to top ROAS campaigns",
                "allocations": [],
                "expected_roas_lift": 0.3,
            })
        if "scaling" in p:
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

    def _default_creative_analysis(self) -> Dict:
        return {
            "fatigued_campaigns": ["Hoodie Promo - Winter Sale", "Video Campaign - Product Showcase"],
            "format_recommendations": [
                {"campaign_id": "demo_1_2", "recommended_formats": ["instagram_reels", "ugc_style"]},
                {"campaign_id": "demo_1_5", "recommended_formats": ["carousel", "story_ads"]},
            ],
            "creative_health": "fair",
            "summary": "Two campaigns show clear creative fatigue with CTR below 60% of objective benchmark. Immediate refreshes recommended.",
        }

    def _default_insights(self) -> Dict:
        return {
            "headline": "Strong retargeting performance offsets underperforming awareness campaigns",
            "key_wins": ["Retargeting ROAS at 5.1x", "Sneaker Drop improving week-over-week"],
            "key_concerns": ["Hoodie Promo CPA critical", "Video campaign below break-even"],
            "action_items": ["Pause Hoodie Promo", "Scale retargeting budget by 30%"],
            "week_rating": 6,
        }
