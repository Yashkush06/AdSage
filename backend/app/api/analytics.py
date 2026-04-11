from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.integrations.demo_meta_client import DemoMetaClient
from app.models.agent_log import AgentLog
from app.models.user import User
from app.agents.orchestrator import AgentOrchestrator

router = APIRouter()


@router.get("/overview")
async def get_overview(current_user: User = Depends(get_current_user)):
    client = DemoMetaClient(user_id=current_user.id)
    return {"success": True, "overview": client.get_overview_metrics()}


@router.get("/trends")
async def get_trends(days: int = 30, current_user: User = Depends(get_current_user)):
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


@router.post("/agents/run-cycle")
async def run_agent_cycle(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trigger agent analysis cycle — runs synchronously (hackathon mode)"""
    orch = AgentOrchestrator(user_id=current_user.id)
    result = await orch.run_cycle(db=db)
    return {"success": True, "result": result}


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
