"""
Shared utilities — formatting, validation, and small helpers.
"""

from __future__ import annotations

import json
import math
from datetime import datetime
from typing import Any, Optional


# ---------------------------------------------------------------------------
# Number / currency helpers
# ---------------------------------------------------------------------------

def format_inr(amount: float, decimals: int = 0) -> str:
    """Format a number as Indian Rupees, e.g. ₹1,23,456"""
    if amount is None:
        return "₹0"
    try:
        rounded = round(float(amount), decimals)
        # Use Python's locale-agnostic manual formatting for INR grouping
        negative = rounded < 0
        s = f"{abs(rounded):.{decimals}f}"
        integer_part, _, decimal_part = s.partition(".")
        # INR grouping: last 3 digits, then groups of 2
        if len(integer_part) > 3:
            last3 = integer_part[-3:]
            rest = integer_part[:-3]
            groups = []
            while len(rest) > 2:
                groups.append(rest[-2:])
                rest = rest[:-2]
            if rest:
                groups.append(rest)
            groups.reverse()
            integer_part = ",".join(groups) + "," + last3
        formatted = f"{'−' if negative else ''}₹{integer_part}"
        if decimals > 0:
            formatted += f".{decimal_part}"
        return formatted
    except (ValueError, TypeError):
        return "₹0"


def format_pct(value: float, decimals: int = 1) -> str:
    """Format a float as a percentage string."""
    return f"{round(value, decimals)}%"


def format_multiplier(value: float, decimals: int = 2) -> str:
    """Format a ROAS/multiplier value, e.g. 3.45x"""
    return f"{round(value, decimals)}x"


def safe_divide(numerator: float, denominator: float, fallback: float = 0.0) -> float:
    """Division that returns fallback on zero denominator."""
    if not denominator:
        return fallback
    return numerator / denominator


# ---------------------------------------------------------------------------
# JSON helpers
# ---------------------------------------------------------------------------

def safe_json_loads(raw: Optional[str], fallback: Any = None) -> Any:
    """Parse a JSON string; return *fallback* on any error."""
    if not raw:
        return fallback if fallback is not None else {}
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return fallback if fallback is not None else {}


def safe_json_dumps(obj: Any) -> str:
    """Serialise to JSON, converting non-serialisable types gracefully."""
    return json.dumps(obj, default=str)


# ---------------------------------------------------------------------------
# Date helpers
# ---------------------------------------------------------------------------

def utcnow_iso() -> str:
    """Current UTC time as ISO-8601 string."""
    return datetime.utcnow().isoformat() + "Z"


# ---------------------------------------------------------------------------
# Performance scoring
# ---------------------------------------------------------------------------

def compute_health_score(
    roas: float,
    cpa: float,
    ctr: float,
    target_roas: float = 3.0,
    target_cpa: float = 400.0,
) -> int:
    """
    Compute a 0-100 health score for a campaign.
    Weights: ROAS 50%, CPA 30%, CTR 20%.
    """
    roas_score = min(100, (roas / target_roas) * 50)
    cpa_score = min(50, max(0, (1 - (cpa - target_cpa) / target_cpa) * 30)) if target_cpa > 0 else 15
    ctr_score = min(20, ctr * 5)  # 4% CTR → full 20 points
    return round(roas_score + cpa_score + ctr_score)


def campaign_health_label(score: int) -> str:
    """Convert a numeric health score to a label."""
    if score >= 80:
        return "excellent"
    if score >= 60:
        return "good"
    if score >= 40:
        return "fair"
    return "poor"
