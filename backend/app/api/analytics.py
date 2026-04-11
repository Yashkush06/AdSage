from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.integrations.demo_meta_client import DemoMetaClient
from app.models.agent_log import AgentLog
from app.agents.orchestrator import AgentOrchestrator

router = APIRouter()

DEMO_UID = settings.DEMO_USER_ID


def _get_demo_client() -> DemoMetaClient:
    return DemoMetaClient(user_id=DEMO_UID)


@router.get("/overview")
async def get_overview():
    client = _get_demo_client()
    return {"success": True, "overview": client.get_overview_metrics()}


@router.get("/trends")
async def get_trends(days: int = 30):
    client = _get_demo_client()
    campaigns = client.get_campaigns(status=["ACTIVE"])
    all_trends = []
    for c in campaigns:
        trend = client.get_daily_trend(c["id"], days)
        for row in trend:
            row["campaign_name"] = c.get("name", c["id"])
            row["campaign_id"] = c["id"]
        all_trends.extend(trend)
    return {"success": True, "trends": all_trends, "period_days": days}


@router.get("/audience")
async def get_audience():
    client = _get_demo_client()
    campaigns = client.get_campaigns(status=["ACTIVE"])
    if not campaigns:
        return {"success": True, "breakdown": {"audience_segments": []}}
    audience = client.get_audience_breakdown(campaigns[0]["id"])
    return {"success": True, "breakdown": audience}


@router.get("/funnel")
async def get_funnel():
    client = _get_demo_client()
    campaigns = client.get_campaigns(status=["ACTIVE"])
    if not campaigns:
        return {"success": True, "funnel": {"funnel_steps": []}}
    funnel = client.get_funnel_data(campaigns[0]["id"])
    return {"success": True, "funnel": funnel}


@router.get("/agents/activity")
async def get_agent_activity(limit: int = 50, db: Session = Depends(get_db)):
    logs = (
        db.query(AgentLog)
        .filter(AgentLog.user_id == DEMO_UID)
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
async def run_agent_cycle(db: Session = Depends(get_db)):
    orch = AgentOrchestrator(user_id=DEMO_UID)
    result = await orch.run_cycle(db=db)
    return {"success": True, "result": result}


@router.get("/insights")
async def get_insights():
    from app.integrations.ollama_api import OllamaClient
    client = _get_demo_client()
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


@router.post("/agent/run")
async def run_agent(db: Session = Depends(get_db)):
    orchestrator = AgentOrchestrator(user_id=DEMO_UID)
    result = await orchestrator.run_cycle(db=db)
    return {"status": "done", "result": result}
