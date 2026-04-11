"""
Analytics API
GET  /api/analytics/overview       — account-level KPIs
GET  /api/analytics/summary        — dashboard summary (KPIs + rec stats + health)
GET  /api/analytics/trends         — daily trend data across all campaigns
GET  /api/analytics/insights       — AI-generated weekly narrative
GET  /api/analytics/agents/activity — agent log feed
POST /api/analytics/agents/run-cycle — trigger agents (broadcasts over WS)
POST /api/analytics/agent/run      — alias (no-auth)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.integrations.demo_meta_client import DemoMetaClient
from app.models.agent_log import AgentLog
from app.models.user import User
from app.agents.orchestrator import AgentOrchestrator
from app.services.recommendation_service import RecommendationService
from app.utils.helpers import compute_health_score, campaign_health_label

router = APIRouter()


# ---------------------------------------------------------------------------
# Overview KPIs
# ---------------------------------------------------------------------------

@router.get("/overview")
async def get_overview(current_user: User = Depends(get_current_user)):
    client = DemoMetaClient(user_id=current_user.id)
    return {"success": True, "overview": client.get_overview_metrics()}


# ---------------------------------------------------------------------------
# Dashboard summary (new)
# ---------------------------------------------------------------------------

@router.get("/summary")
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Single endpoint for the dashboard — returns:
      - account KPIs
      - per-campaign health scores
      - recommendation stats
    """
    client = DemoMetaClient(user_id=current_user.id)
    overview = client.get_overview_metrics()

    # Per-campaign health
    user = current_user
    target_roas = user.target_roas or 3.0
    target_cpa = user.target_cpa or 400.0

    campaigns = client.get_campaigns(status=["ACTIVE"])
    campaign_health = []
    for c in campaigns:
        ins = client.get_campaign_insights(c["id"])
        if not ins:
            continue
        score = compute_health_score(
            roas=ins.get("roas", 0),
            cpa=ins.get("cpa", 0),
            ctr=ins.get("ctr", 0),
            target_roas=target_roas,
            target_cpa=target_cpa,
        )
        campaign_health.append({
            "id": c["id"],
            "name": c.get("name", c["id"]),
            "status": c.get("status", "ACTIVE"),
            "health_score": score,
            "health_label": campaign_health_label(score),
            "roas": ins.get("roas", 0),
            "cpa": ins.get("cpa", 0),
            "ctr": ins.get("ctr", 0),
            "spend": ins.get("spend", 0),
            "revenue": ins.get("revenue", 0),
            "daily_budget": ins.get("daily_budget", 0),
            "trend": ins.get("trend", "stable"),
        })

    # Recommendation stats
    svc = RecommendationService(db=db, user_id=current_user.id)
    rec_stats = svc.get_stats()

    # Overall account health
    avg_health = (
        round(sum(c["health_score"] for c in campaign_health) / len(campaign_health))
        if campaign_health else 0
    )

    return {
        "success": True,
        "overview": overview,
        "campaign_health": campaign_health,
        "recommendation_stats": rec_stats,
        "account_health_score": avg_health,
        "account_health_label": campaign_health_label(avg_health),
        "target_roas": target_roas,
        "target_cpa": target_cpa,
    }


# ---------------------------------------------------------------------------
# Trends
# ---------------------------------------------------------------------------

@router.get("/trends")
async def get_trends(
    days: int = 30,
    current_user: User = Depends(get_current_user),
):
    client = DemoMetaClient(user_id=current_user.id)
    campaigns = client.get_campaigns(status=["ACTIVE"])
    all_trends = []
    for c in campaigns:
        trend = client.get_daily_trend(c["id"], days)
        for row in trend:
            row["campaign_name"] = c.get("name", c["id"])
            row["campaign_id"] = c["id"]
        all_trends.extend(trend)
    return {"success": True, "trends": all_trends, "period_days": days}


# ---------------------------------------------------------------------------
# AI Insights narrative
# ---------------------------------------------------------------------------

@router.get("/insights")
async def get_insights(current_user: User = Depends(get_current_user)):
    from app.integrations.ollama_api import OllamaClient

    client = DemoMetaClient(user_id=current_user.id)
    ai = OllamaClient()
    overview = client.get_overview_metrics()
    campaigns = client.get_campaigns(status=["ACTIVE"])
    perf_data = []
    for c in campaigns:
        ins = client.get_campaign_insights(c["id"])
        if ins:
            perf_data.append({**c, **ins})
    insights = await ai.generate_insights(overview, perf_data)
    return {"success": True, "insights": insights}


# ---------------------------------------------------------------------------
# Agent activity log
# ---------------------------------------------------------------------------

@router.get("/agents/activity")
async def get_agent_activity(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logs = (
        db.query(AgentLog)
        .filter(AgentLog.user_id == current_user.id)
        .order_by(AgentLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return {
        "success": True,
        "activity": [
            {
                "id": log.id,
                "agent_name": log.agent_name,
                "level": log.level,
                "message": log.message,
                "created_at": log.created_at.isoformat(),
            }
            for log in logs
        ],
    }


# ---------------------------------------------------------------------------
# Trigger agent cycle
# ---------------------------------------------------------------------------

@router.post("/agents/run-cycle")
async def run_agent_cycle(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trigger agent analysis cycle with real-time WebSocket broadcast."""
    from app.api.websocket import manager

    orch = AgentOrchestrator(user_id=current_user.id)
    result = await orch.run_cycle(db=db, broadcast_fn=manager.broadcast)
    return {"success": True, "result": result}


@router.post("/agent/run")
async def run_agent_no_auth(db: Session = Depends(get_db)):
    """No-auth alias — useful for quick demo triggers."""
    from app.api.websocket import manager

    orchestrator = AgentOrchestrator(user_id=1)
    result = await orchestrator.run_cycle(db=db, broadcast_fn=manager.broadcast)
    return {"status": "done", "result": result}


# ---------------------------------------------------------------------------
# Scheduler status
# ---------------------------------------------------------------------------

@router.get("/scheduler/status")
async def scheduler_status():
    from app.services.scheduler import is_running
    return {"running": is_running()}


@router.post("/scheduler/start")
async def start_scheduler_endpoint():
    from app.services.scheduler import start_scheduler
    from app.core.config import settings
    start_scheduler(
        interval_seconds=getattr(settings, "AGENT_CYCLE_INTERVAL_SECONDS", 300),
        demo_user_id=settings.DEMO_USER_ID,
    )
    return {"success": True, "message": "Scheduler started"}


@router.post("/scheduler/stop")
async def stop_scheduler_endpoint():
    from app.services.scheduler import stop_scheduler
    stop_scheduler()
    return {"success": True, "message": "Scheduler stopped"}
