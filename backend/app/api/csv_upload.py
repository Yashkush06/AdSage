"""
csv_upload.py
─────────────
POST /api/csv/upload-csv   — parse & process a Meta Ads CSV export
POST /api/csv/analyze      — run AI agent on the processed analytics

Both endpoints are cached (SHA-256 keyed) to avoid redundant work.
"""
from __future__ import annotations

import hashlib
import json
import logging
from typing import Any, List

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.utils.csv_processor import parse_and_clean_csv

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Simple in-process cache (keyed on file SHA-256) ───────────────────────────
_CACHE: dict[str, dict[str, Any]] = {}
MAX_CACHE_ENTRIES = 20

MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB hard limit


def _cache_get(key: str) -> dict | None:
    return _CACHE.get(key)


def _cache_set(key: str, value: dict) -> None:
    if len(_CACHE) >= MAX_CACHE_ENTRIES:
        # Evict oldest
        oldest = next(iter(_CACHE))
        del _CACHE[oldest]
    _CACHE[key] = value


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload a Meta Ads exported CSV and receive structured analytics.

    **Returns**
    ```json
    {
      "success": true,
      "total_rows": 1200,
      "missing_columns": [],
      "preview": [...],
      "channelBreakdown": [...],
      "audiencePerformance": [...],
      "hourlyConversions": [...],
      "aiInsights": {...},
      "cached": false
    }
    ```
    """
    # ── Validate MIME / extension ─────────────────────────────────────────────
    if file.content_type not in (
        "text/csv",
        "application/csv",
        "application/vnd.ms-excel",
        "text/plain",
    ) and not (file.filename or "").lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only .csv files are accepted.",
        )

    # ── Read & size-guard ─────────────────────────────────────────────────────
    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_BYTES // (1024*1024)} MB.",
        )

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # ── Cache lookup ──────────────────────────────────────────────────────────
    file_hash = hashlib.sha256(content).hexdigest()
    cached = _cache_get(file_hash)
    if cached:
        logger.info("CSV cache hit: %s", file_hash[:12])
        return JSONResponse(content={**cached, "cached": True})

    # ── Parse & process ───────────────────────────────────────────────────────
    try:
        result = parse_and_clean_csv(content)
    except Exception as exc:
        logger.exception("CSV processing failed")
        raise HTTPException(
            status_code=422,
            detail=f"Failed to process CSV: {str(exc)}",
        ) from exc

    # ── Warn on missing columns (but don't block) ─────────────────────────────
    missing = result.get("missing_columns", [])
    if missing:
        logger.warning("CSV missing columns: %s", missing)

    response_body: dict[str, Any] = {
        "success": True,
        "filename": file.filename,
        "total_rows": result["total_rows"],
        "missing_columns": missing,
        "preview": result["preview"],
        "channelBreakdown": result["channelBreakdown"],
        "audiencePerformance": result["audiencePerformance"],
        "hourlyConversions": result["hourlyConversions"],
        "aiInsights": result["aiInsights"],
        "cached": False,
    }

    _cache_set(file_hash, response_body)
    return JSONResponse(content=response_body)


# ── /analyze — AI agent insights ─────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    channelBreakdown: List[dict]
    audiencePerformance: List[dict]
    hourlyConversions: List[dict]
    total_rows: int = 0


_AI_CACHE: dict[str, dict] = {}


@router.post("/analyze")
async def analyze_csv(payload: AnalyzeRequest):
    """
    Send processed CSV analytics through the AI agent (OllamaClient) and
    return deep, actionable insights.

    Call this *after* `/upload-csv` with the data it returned.

    **Returns**
    ```json
    {
      "success": true,
      "insights": {
        "headline": "...",
        "top_channel_insight": "...",
        "audience_insight": "...",
        "timing_insight": "...",
        "budget_recommendation": "...",
        "red_flags": [...],
        "action_items": [...],
        "confidence_score": 8
      },
      "cached": false
    }
    ```
    """
    from app.integrations.ollama_api import OllamaClient

    # Cache key = SHA-256 of the sorted JSON body
    cache_key = hashlib.sha256(
        json.dumps(payload.model_dump(), sort_keys=True).encode()
    ).hexdigest()

    if cache_key in _AI_CACHE:
        logger.info("AI insights cache hit: %s", cache_key[:12])
        return JSONResponse(content={**_AI_CACHE[cache_key], "cached": True})

    ai = OllamaClient()
    try:
        insights = await ai.analyze_csv_data(
            channel_breakdown=payload.channelBreakdown,
            audience_performance=payload.audiencePerformance,
            hourly_conversions=payload.hourlyConversions,
            total_rows=payload.total_rows,
        )
    except Exception as exc:
        logger.exception("AI analysis failed")
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(exc)}",
        ) from exc

    response = {"success": True, "insights": insights, "cached": False}

    if len(_AI_CACHE) >= MAX_CACHE_ENTRIES:
        del _AI_CACHE[next(iter(_AI_CACHE))]
    _AI_CACHE[cache_key] = response

    return JSONResponse(content=response)
