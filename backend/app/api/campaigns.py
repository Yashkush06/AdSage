from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.integrations.demo_meta_client import DemoMetaClient
from app.models.user import User

router = APIRouter()


def get_meta_client(current_user: User = Depends(get_current_user)) -> DemoMetaClient:
    return DemoMetaClient(user_id=current_user.id)


@router.get("")
async def get_campaigns(
    status: Optional[str] = "ACTIVE",
    client: DemoMetaClient = Depends(get_meta_client),
):
    campaigns = client.get_campaigns(status=[status] if status else None)
    return {"success": True, "campaigns": campaigns, "count": len(campaigns)}


@router.get("/{campaign_id}/insights")
async def get_campaign_insights(
    campaign_id: str,
    days: int = 30,
    client: DemoMetaClient = Depends(get_meta_client),
):
    insights = client.get_campaign_insights(campaign_id, days)
    if not insights:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"success": True, "insights": insights}


@router.get("/{campaign_id}/trend")
async def get_campaign_trend(
    campaign_id: str,
    days: int = 30,
    client: DemoMetaClient = Depends(get_meta_client),
):
    trend = client.get_daily_trend(campaign_id, days)
    return {"success": True, "trend": trend}


@router.get("/{campaign_id}/audience")
async def get_audience_breakdown(
    campaign_id: str,
    client: DemoMetaClient = Depends(get_meta_client),
):
    breakdown = client.get_audience_breakdown(campaign_id)
    return {"success": True, "breakdown": breakdown}


@router.get("/{campaign_id}/funnel")
async def get_funnel_data(
    campaign_id: str,
    client: DemoMetaClient = Depends(get_meta_client),
):
    funnel = client.get_funnel_data(campaign_id)
    return {"success": True, "funnel": funnel}


@router.post("/{campaign_id}/pause")
async def pause_campaign(
    campaign_id: str,
    client: DemoMetaClient = Depends(get_meta_client),
):
    ok = client.pause_campaign(campaign_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"success": True, "message": "Campaign paused"}


@router.post("/{campaign_id}/update-budget")
async def update_budget(
    campaign_id: str,
    new_budget: float,
    client: DemoMetaClient = Depends(get_meta_client),
):
    ok = client.update_campaign_budget(campaign_id, new_budget)
    if not ok:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"success": True, "message": f"Budget updated to ₹{new_budget}", "new_budget": new_budget}


@router.post("/demo/simulate-time")
async def simulate_time(
    hours: int = 4,
    client: DemoMetaClient = Depends(get_meta_client),
):
    client.simulate_time_progression(hours)
    return {"success": True, "message": f"Simulated {hours} hours of performance changes"}
