from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import json

from app.core.database import get_db
from app.core.config import settings
from app.models.recommendation import Recommendation, RecommendationStatus
from app.models.approval import Approval
from app.integrations.demo_meta_client import DemoMetaClient

router = APIRouter()

DEMO_UID = settings.DEMO_USER_ID


class ApprovalDecision(BaseModel):
    notes: Optional[str] = None


class BulkRejectBody(BaseModel):
    recommendation_ids: List[int]
    notes: Optional[str] = None


def _serialize_rec(rec: Recommendation) -> dict:
    return {
        "id": rec.id,
        "agent_name": rec.agent_name,
        "type": rec.type,
        "status": rec.status,
        "priority": rec.priority,
        "title": rec.title,
        "description": rec.description,
        "reasoning": rec.reasoning,
        "risk_level": rec.risk_level,
        "confidence_score": rec.confidence_score,
        "data_supporting": json.loads(rec.data_supporting) if rec.data_supporting else {},
        "action_details": json.loads(rec.action_details) if rec.action_details else {},
        "predicted_impact": json.loads(rec.predicted_impact) if rec.predicted_impact else {},
        "created_at": rec.created_at.isoformat() if rec.created_at else None,
    }


@router.get("")
async def get_approvals(status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Recommendation).filter(Recommendation.user_id == DEMO_UID)
    if status:
        q = q.filter(Recommendation.status == status)
    else:
        q = q.filter(Recommendation.status == RecommendationStatus.PENDING)
    recs = q.order_by(Recommendation.created_at.desc()).all()
    return {"success": True, "approvals": [_serialize_rec(r) for r in recs], "count": len(recs)}


@router.get("/history")
async def get_approval_history(db: Session = Depends(get_db)):
    recs = (
        db.query(Recommendation)
        .filter(
            Recommendation.user_id == DEMO_UID,
            Recommendation.status.in_([
                RecommendationStatus.APPROVED,
                RecommendationStatus.REJECTED,
                RecommendationStatus.EXECUTED,
                RecommendationStatus.AUTO_APPROVED,
            ]),
        )
        .order_by(Recommendation.created_at.desc())
        .limit(50)
        .all()
    )
    return {"success": True, "history": [_serialize_rec(r) for r in recs]}


@router.post("/{rec_id}/approve")
async def approve_recommendation(
    rec_id: int,
    body: ApprovalDecision = ApprovalDecision(),
    db: Session = Depends(get_db),
):
    rec = db.query(Recommendation).filter(
        Recommendation.id == rec_id,
        Recommendation.user_id == DEMO_UID,
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    if rec.status != RecommendationStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Already {rec.status}")

    client = DemoMetaClient(user_id=DEMO_UID)
    action = json.loads(rec.action_details) if rec.action_details else {}
    action_type = action.get("action", "")

    execution_result: dict = {"executed": False}
    try:
        if action_type == "pause_campaign":
            ok = client.pause_campaign(action["campaign_id"])
            execution_result = {"executed": ok}
        elif action_type in ("update_budget", "reduce_budget"):
            ok = client.update_campaign_budget(
                action["campaign_id"],
                action.get("new_daily_budget", action.get("new_budget", 0)),
            )
            execution_result = {"executed": ok}
        elif action_type == "duplicate_campaign":
            new_id = client.duplicate_campaign(
                action["campaign_id"], action["new_name"], action["new_budget"]
            )
            execution_result = {"executed": bool(new_id), "new_campaign_id": new_id}
        else:
            execution_result = {"executed": True, "note": "Action simulated"}
    except Exception as e:
        execution_result = {"executed": False, "error": str(e)}

    rec.status = RecommendationStatus.EXECUTED if execution_result["executed"] else RecommendationStatus.APPROVED
    rec.executed_at = datetime.utcnow()
    db.add(Approval(
        user_id=DEMO_UID,
        recommendation_id=rec.id,
        decision="approved",
        notes=body.notes,
        decided_at=datetime.utcnow(),
    ))
    db.commit()
    return {"success": True, "message": "Approved and executed", "execution_result": execution_result}


@router.post("/{rec_id}/reject")
async def reject_recommendation(
    rec_id: int,
    body: ApprovalDecision = ApprovalDecision(),
    db: Session = Depends(get_db),
):
    rec = db.query(Recommendation).filter(
        Recommendation.id == rec_id,
        Recommendation.user_id == DEMO_UID,
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec.status = RecommendationStatus.REJECTED
    db.add(Approval(
        user_id=DEMO_UID,
        recommendation_id=rec.id,
        decision="rejected",
        notes=body.notes,
        decided_at=datetime.utcnow(),
    ))
    db.commit()
    return {"success": True, "message": "Recommendation rejected"}


@router.post("/bulk-reject")
async def bulk_reject(body: BulkRejectBody, db: Session = Depends(get_db)):
    recs = db.query(Recommendation).filter(
        Recommendation.id.in_(body.recommendation_ids),
        Recommendation.user_id == DEMO_UID,
    ).all()
    for rec in recs:
        rec.status = RecommendationStatus.REJECTED
        db.add(Approval(
            user_id=DEMO_UID,
            recommendation_id=rec.id,
            decision="rejected",
            notes=body.notes,
            decided_at=datetime.utcnow(),
        ))
    db.commit()
    return {"success": True, "message": f"{len(recs)} recommendation(s) rejected", "rejected_count": len(recs)}
