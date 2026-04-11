"""
creative_studio.py
──────────────────
POST /api/creative-studio/generate-ad   — generate a full Meta ad campaign
POST /api/creative-studio/improve-ad    — improve an existing ad
POST /api/creative-studio/regenerate    — regenerate a specific section (hooks / copy)
"""
from __future__ import annotations

import logging
from typing import List, Literal, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.integrations.ollama_api import OllamaClient

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Request / Response models ─────────────────────────────────────────────────

class GenerateAdRequest(BaseModel):
    business: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    goal: Literal["Sales", "Leads", "Traffic", "Awareness"]
    platform: Literal["Instagram", "Facebook", "Both"]
    tone: Literal["Premium", "Funny", "Aggressive", "Minimal"]


class ImproveAdRequest(BaseModel):
    campaignName: str
    adCopy: str
    audience: Optional[dict] = None
    hooks: Optional[List[str]] = None


class RegenerateRequest(BaseModel):
    section: Literal["hooks", "adCopy"]
    business: str
    description: str
    goal: str
    platform: str
    tone: str
    currentCampaignName: Optional[str] = None


# ── Ollama service helpers ────────────────────────────────────────────────────

async def _generate_ad_llm(req: GenerateAdRequest) -> dict:
    ai = OllamaClient()

    system = (
        "You are a Meta Ads expert and high-converting copywriter. "
        "Generate complete, battle-tested ad campaigns. "
        "Return ONLY valid JSON — no markdown, no explanation."
    )

    user = f"""Generate a complete Meta Ads campaign based on:

Business: {req.business}
Description: {req.description}
Goal: {req.goal}
Platform: {req.platform}
Tone: {req.tone}

Return EXACTLY this JSON structure:
{{
  "campaignName": "Short punchy campaign name",
  "hooks": [
    "Hook 1 — scroll-stopping, under 10 words",
    "Hook 2 — provocative question or bold claim",
    "Hook 3 — curiosity gap or social proof angle"
  ],
  "targetAudience": {{
    "age": "25–34",
    "interests": ["interest1", "interest2", "interest3"],
    "location": "Specific city/region or 'India (Tier 1 cities)'",
    "behaviors": ["Online shopping", "Mobile users"],
    "gender": "All / Men / Women"
  }},
  "adCopy": "Full ad body copy. High-converting, simple language, strong CTA. 3–5 sentences.",
  "creativeIdeas": [
    "Creative idea 1 — specific visual or format (e.g. UGC reel, before/after)",
    "Creative idea 2 — carousel or story format idea",
    "Creative idea 3 — influencer or testimonial format"
  ],
  "callToAction": "Shop Now / Learn More / Sign Up / Get Quote",
  "estimatedBudget": "Daily budget suggestion with rationale",
  "keyMetrics": ["CTR", "ROAS", "CPL"]
}}

Rules:
- Hooks must be scroll-stopping, short and punchy
- Ad copy must be high-converting, conversational, {req.tone.lower()} tone
- Audience must be specific and realistic for {req.platform}
- Creative ideas must be visual and platform-native
- Keep everything beginner-friendly"""

    raw = await ai._chat(system, user)
    return ai._parse_json(raw, _fallback_ad(req))


async def _improve_ad_llm(req: ImproveAdRequest) -> dict:
    ai = OllamaClient()

    system = (
        "You are a Meta Ads conversion rate optimisation expert. "
        "Improve ads to increase CTR and ROAS. "
        "Return ONLY valid JSON — no markdown."
    )

    user = f"""Improve this Meta ad to increase conversions:

Campaign Name: {req.campaignName}
Current Ad Copy:
{req.adCopy}

Current Audience: {req.audience or "Not specified"}
Current Hooks: {req.hooks or "Not provided"}

Return EXACTLY this JSON:
{{
  "campaignName": "Improved campaign name",
  "hooks": [
    "Improved hook 1",
    "Improved hook 2",
    "Improved hook 3"
  ],
  "adCopy": "Improved, more persuasive ad copy with stronger CTA",
  "targetAudience": {{
    "age": "Refined age range",
    "interests": ["refined", "interests"],
    "location": "Location",
    "behaviors": ["Behavior 1"],
    "gender": "All / Men / Women"
  }},
  "improvements": [
    "What was changed and why — specific improvement 1",
    "Specific improvement 2",
    "Specific improvement 3"
  ],
  "estimatedImpact": "Expected lift in CTR or conversions"
}}"""

    raw = await ai._chat(system, user)
    return ai._parse_json(raw, _fallback_improve(req))


async def _regenerate_section_llm(req: RegenerateRequest) -> dict:
    ai = OllamaClient()

    if req.section == "hooks":
        system = "You are a Meta Ads copywriter specialising in scroll-stopping hooks. Return ONLY valid JSON."
        user = f"""Generate 3 fresh, scroll-stopping hooks for:

Business: {req.business}
Description: {req.description}
Goal: {req.goal}
Platform: {req.platform}
Tone: {req.tone}
Campaign: {req.currentCampaignName or "Untitled Campaign"}

Return EXACTLY: {{"hooks": ["Hook 1", "Hook 2", "Hook 3"]}}

Make them completely different from typical hooks. Be bold, provocative, creative."""
        raw = await ai._chat(system, user)
        result = ai._parse_json(raw, {"hooks": [
            f"Stop what you're doing — {req.business} just changed the game",
            f"Why are 10,000+ people switching to {req.business}?",
            f"The {req.goal.lower()} secret your competitors don't want you to know",
        ]})
        return result

    else:  # adCopy
        system = "You are a direct-response copywriter for Meta Ads. Return ONLY valid JSON."
        user = f"""Write high-converting ad body copy for:

Business: {req.business}
Description: {req.description}
Goal: {req.goal}
Platform: {req.platform}
Tone: {req.tone}

Return EXACTLY: {{"adCopy": "Your compelling ad copy here with strong CTA"}}

Rules: 3-5 sentences, conversational, {req.tone.lower()} tone, ends with clear CTA."""
        raw = await ai._chat(system, user)
        result = ai._parse_json(raw, {"adCopy": (
            f"Discover why {req.business} is transforming the way people experience "
            f"{req.description[:60]}... Join thousands of happy customers today. "
            f"Limited time offer — tap below to get started!"
        )})
        return result


# ── Fallback responses (mock data for no-API-key mode) ───────────────────────

def _fallback_ad(req: GenerateAdRequest) -> dict:
    tone_map = {
        "Premium": "Elevate your experience.",
        "Funny": "You won't believe this, but it works.",
        "Aggressive": "Stop settling. Start winning.",
        "Minimal": "Less noise. More results.",
    }
    return {
        "campaignName": f"{req.business} — {req.goal} Accelerator Q2",
        "hooks": [
            f"Stop scrolling — {req.business} is changing everything",
            f"Why 10,000+ customers chose {req.business} over the rest",
            f"The {req.goal.lower()} hack your competitors are hiding from you",
        ],
        "targetAudience": {
            "age": "25–40",
            "interests": ["Online Shopping", "Digital Products", req.business],
            "location": "India (Tier 1 cities)" if req.platform == "Instagram" else "India",
            "behaviors": ["Mobile users", "Online shoppers"],
            "gender": "All",
        },
        "adCopy": (
            f"{tone_map.get(req.tone, '')} {req.business} delivers exactly what you need — "
            f"{req.description[:80]}... "
            f"Join thousands of satisfied customers already seeing real results. "
            f"{'Shop Now' if req.goal == 'Sales' else 'Learn More'} →"
        ),
        "creativeIdeas": [
            "UGC-style reel: Customer unboxing or 'day in my life' featuring the product",
            "Before/after carousel: Problem → Solution → Result in 3 slides",
            "Testimonial story: 15-second talking-head clip with bold subtitle captions",
        ],
        "callToAction": "Shop Now" if req.goal == "Sales" else ("Get Quote" if req.goal == "Leads" else "Learn More"),
        "estimatedBudget": f"₹500–1,500/day for {req.platform} {req.goal} campaigns (test phase)",
        "keyMetrics": ["CTR > 2%", "ROAS > 3x", "CPC < ₹15"],
    }


def _fallback_improve(req: ImproveAdRequest) -> dict:
    return {
        "campaignName": f"{req.campaignName} — V2 Optimised",
        "hooks": [
            "This changed everything for our customers — see why",
            "You're 1 click away from the result you actually want",
            "Still on the fence? Read what 500+ customers said →",
        ],
        "adCopy": (
            f"{req.adCopy.strip()} "
            "⭐ Rated #1 by our community. "
            "Act now — spots are limited. Tap 'Learn More' to claim your offer."
        ),
        "targetAudience": {
            "age": "24–35",
            "interests": ["Trending products", "Value deals", "Premium brands"],
            "location": "Metro cities",
            "behaviors": ["Frequent online buyers", "Mobile-first"],
            "gender": "All",
        },
        "improvements": [
            "Added social proof ('500+ customers') to build trust faster",
            "Added urgency ('spots are limited') to reduce decision friction",
            "Hooks now target emotion (curiosity, FOMO) instead of features",
        ],
        "estimatedImpact": "Expected 15–30% CTR improvement and lower CPC",
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/generate-ad")
async def generate_ad(req: GenerateAdRequest):
    """
    Generate a full Meta ad campaign from business details.

    **Returns** campaignName, hooks, targetAudience, adCopy, creativeIdeas, etc.
    """
    logger.info("Creative Studio: generate-ad — business=%s goal=%s", req.business, req.goal)
    try:
        result = await _generate_ad_llm(req)
    except Exception as exc:
        logger.exception("generate-ad failed")
        raise HTTPException(status_code=500, detail=f"Ad generation failed: {str(exc)}") from exc

    return JSONResponse(content={"success": True, "ad": result})


@router.post("/improve-ad")
async def improve_ad(req: ImproveAdRequest):
    """
    Improve an existing ad for higher conversions.

    **Returns** improved campaignName, hooks, adCopy, targetAudience, improvements list.
    """
    logger.info("Creative Studio: improve-ad — campaign=%s", req.campaignName)
    if not req.campaignName and not req.adCopy:
        raise HTTPException(status_code=400, detail="Provide either campaignName or adCopy to improve.")

    try:
        result = await _improve_ad_llm(req)
    except Exception as exc:
        logger.exception("improve-ad failed")
        raise HTTPException(status_code=500, detail=f"Ad improvement failed: {str(exc)}") from exc

    return JSONResponse(content={"success": True, "ad": result})


@router.post("/regenerate")
async def regenerate_section(req: RegenerateRequest):
    """
    Partially regenerate a section of the ad (hooks or adCopy only).

    **Returns** `{ "hooks": [...] }` or `{ "adCopy": "..." }` depending on section.
    """
    logger.info("Creative Studio: regenerate section=%s business=%s", req.section, req.business)
    try:
        result = await _regenerate_section_llm(req)
    except Exception as exc:
        logger.exception("regenerate failed")
        raise HTTPException(status_code=500, detail=f"Regeneration failed: {str(exc)}") from exc

    return JSONResponse(content={"success": True, **result})
