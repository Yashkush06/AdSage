"""
csv_processor.py
────────────────
Utility for cleaning, normalising and deriving analytics from uploaded
Meta Ads CSV exports.
"""
from __future__ import annotations

import io
import csv
import re
import logging
from typing import Any

logger = logging.getLogger(__name__)

# ── Column name aliases ────────────────────────────────────────────────────────
# Maps every possible variant we accept → canonical internal name.
COLUMN_ALIASES: dict[str, str] = {
    # Campaign name
    "campaign name": "campaign_name",
    "campaign": "campaign_name",
    "campaign_name": "campaign_name",
    # Ad name
    "ad name": "ad_name",
    "ad": "ad_name",
    "ad_name": "ad_name",
    "creative name": "ad_name",
    # Placement
    "placement": "placement",
    "channel": "placement",
    "publisher platform": "placement",
    "platform": "placement",
    # Age
    "age": "age",
    "age group": "age",
    "age range": "age",
    # Hour
    "hour": "hour",
    "hour of day": "hour",
    "time of day": "hour",
    # Impressions
    "impressions": "impressions",
    "impr": "impressions",
    "imps": "impressions",
    # Reach
    "reach": "reach",
    "unique reach": "reach",
    # CTR
    "ctr": "ctr",
    "click-through rate": "ctr",
    "click through rate": "ctr",
    # CPC
    "cpc": "cpc",
    "cost per click": "cpc",
    # Amount spent
    "amount spent": "amount_spent",
    "spend": "amount_spent",
    "cost": "amount_spent",
    "total spend": "amount_spent",
    "amount spent (inr)": "amount_spent",
    "amount spent (usd)": "amount_spent",
    # Conversions
    "conversions": "conversions",
    "results": "conversions",
    "purchases": "conversions",
    "leads": "conversions",
    "total conversions": "conversions",
}

REQUIRED_COLUMNS: set[str] = {
    "campaign_name",
    "placement",
    "age",
    "hour",
    "impressions",
    "reach",
    "ctr",
    "cpc",
    "amount_spent",
    "conversions",
}

OPTIONAL_COLUMNS: set[str] = {"ad_name"}


# ── Data cleaning helpers ──────────────────────────────────────────────────────

def _clean_money(raw: str) -> float | None:
    """'₹1,234.50' or '$1,234.50' → 1234.50.  Returns None on failure."""
    if not raw or raw.strip() in ("", "-", "N/A", "n/a"):
        return None
    cleaned = re.sub(r"[₹$€£,\s]", "", str(raw))
    try:
        return float(cleaned)
    except ValueError:
        return None


def _clean_percentage(raw: str) -> float | None:
    """'2.34%' → 2.34.  Returns None on failure."""
    if not raw or raw.strip() in ("", "-", "N/A", "n/a"):
        return None
    cleaned = str(raw).replace("%", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None


def _clean_number(raw: str) -> float | None:
    """Generic numeric cleaner: strips commas/spaces, converts to float."""
    if not raw or str(raw).strip() in ("", "-", "N/A", "n/a"):
        return None
    cleaned = re.sub(r"[,\s]", "", str(raw))
    try:
        return float(cleaned)
    except ValueError:
        return None


def _clean_int(raw: str, default: int = 0) -> int:
    v = _clean_number(raw)
    return int(v) if v is not None else default


def _clean_hour(raw: str) -> int | None:
    """Accepts '14', '2 PM', '14:00' etc."""
    if not raw or str(raw).strip() in ("", "-"):
        return None
    s = str(raw).strip().lower()
    pm_match = re.search(r"(\d+)\s*pm", s)
    am_match = re.search(r"(\d+)\s*am", s)
    if pm_match:
        h = int(pm_match.group(1))
        return h + 12 if h != 12 else 12
    if am_match:
        h = int(am_match.group(1))
        return 0 if h == 12 else h
    # Try plain int / colon-separated
    try:
        return int(s.split(":")[0])
    except (ValueError, IndexError):
        return None


# ── Core parsing ───────────────────────────────────────────────────────────────

def _normalise_header(raw: str) -> str:
    return raw.strip().lower().replace("\ufeff", "")  # strip BOM


def parse_and_clean_csv(file_content: bytes) -> dict[str, Any]:
    """
    Parse a raw CSV bytes payload → cleaned row list + analytics.

    Returns a structured dict:
    {
        "rows": [...],
        "total_rows": int,
        "missing_columns": [...],
        "channelBreakdown": [...],
        "audiencePerformance": [...],
        "hourlyConversions": [...],
        "aiInsights": {...},
        "preview": [...],          # first 5 rows (raw, pre-clean)
    }
    """
    try:
        text = file_content.decode("utf-8-sig")  # handle BOM
    except UnicodeDecodeError:
        text = file_content.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text))
    raw_headers = reader.fieldnames or []

    # Build header → canonical map
    header_map: dict[str, str] = {}
    for h in raw_headers:
        canonical = COLUMN_ALIASES.get(_normalise_header(h))
        if canonical:
            header_map[h] = canonical

    canonical_found = set(header_map.values())
    missing = list(REQUIRED_COLUMNS - canonical_found)

    rows: list[dict] = []
    raw_preview: list[dict] = []
    for i, row in enumerate(reader):
        if i < 5:
            raw_preview.append(dict(row))

        cleaned: dict[str, Any] = {}
        for raw_col, canonical in header_map.items():
            val = row.get(raw_col, "")

            if canonical in ("amount_spent", "cpc"):
                cleaned[canonical] = _clean_money(val) or 0.0
            elif canonical == "ctr":
                cleaned[canonical] = _clean_percentage(val) or 0.0
            elif canonical in ("impressions", "reach", "conversions"):
                cleaned[canonical] = _clean_int(val)
            elif canonical == "hour":
                cleaned[canonical] = _clean_hour(val)
            else:
                cleaned[canonical] = val.strip() if val else ""

        rows.append(cleaned)

    # ── Analytics derivation ─────────────────────────────────────────────────

    # 1) Channel Breakdown — group by placement, sum spend, % distribution
    channel_map: dict[str, float] = {}
    for r in rows:
        ch = r.get("placement") or "Unknown"
        channel_map[ch] = channel_map.get(ch, 0.0) + r.get("amount_spent", 0.0)

    total_spend = sum(channel_map.values()) or 1  # guard div-by-zero
    channel_breakdown = [
        {
            "name": k,
            "spend": round(v, 2),
            "percentage": round(v / total_spend * 100, 1),
        }
        for k, v in sorted(channel_map.items(), key=lambda x: -x[1])
    ]

    # 2) Audience Performance — group by age, sum conversions
    age_map: dict[str, int] = {}
    for r in rows:
        age = r.get("age") or "Unknown"
        age_map[age] = age_map.get(age, 0) + r.get("conversions", 0)

    audience_performance = [
        {"age": k, "conversions": v}
        for k, v in sorted(age_map.items())
    ]

    # 3) Hourly Conversions — group by hour (0-23), sum conversions
    hourly_map: dict[int, int] = {h: 0 for h in range(24)}
    for r in rows:
        h = r.get("hour")
        if h is not None and 0 <= h <= 23:
            hourly_map[h] += r.get("conversions", 0)

    hourly_conversions = [
        {"hour": h, "conversions": hourly_map[h]} for h in range(24)
    ]

    # ── AI Insights ───────────────────────────────────────────────────────────
    ai_insights = _generate_ai_insights(
        channel_breakdown, audience_performance, hourly_conversions, total_spend
    )

    return {
        "rows": rows,
        "total_rows": len(rows),
        "missing_columns": missing,
        "channelBreakdown": channel_breakdown,
        "audiencePerformance": audience_performance,
        "hourlyConversions": hourly_conversions,
        "aiInsights": ai_insights,
        "preview": raw_preview,
    }


def _generate_ai_insights(
    channels: list[dict],
    audience: list[dict],
    hourly: list[dict],
    total_spend: float,
) -> dict[str, Any]:
    """Rule-based AI insights derived directly from the processed analytics."""
    insights: dict[str, Any] = {}

    # Top channel
    if channels:
        top_ch = channels[0]
        insights["top_channel"] = (
            f"'{top_ch['name']}' is your top channel, accounting for "
            f"{top_ch['percentage']}% of total spend "
            f"(₹{top_ch['spend']:,.2f})"
        )

    # Best performing age group
    if audience:
        best_age = max(audience, key=lambda x: x["conversions"])
        insights["best_age_group"] = (
            f"The '{best_age['age']}' age group drives the most conversions "
            f"({best_age['conversions']:,}). Prioritise budget allocation here."
        )

    # Peak conversion hour
    if hourly:
        peak = max(hourly, key=lambda x: x["conversions"])
        insights["peak_hour"] = (
            f"Peak conversion activity is at {peak['hour']:02d}:00 "
            f"({peak['conversions']:,} conversions). "
            f"Increase bid adjustments in surrounding hours."
        )

    # Spend summary
    insights["spend_summary"] = (
        f"Total spend across all channels: ₹{total_spend:,.2f}"
    )

    return insights
