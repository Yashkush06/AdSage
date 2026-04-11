"""
Approvals API — human-in-the-loop review of agent recommendations.

GET  /api/approvals             — pending recommendations
GET  /api/approvals/history     — resolved recommendations
GET  /api/approvals/stats       — counts by status/type/agent
POST /api/approvals/{id}/approve
POST /api/approvals/{id}/reject
POST /api/approvals/bulk-reject
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.recommendation import RecommendationStatus
from app.models.user import User
from app.services.recommendation_service import RecommendationService, serialize_recommendation

router = APIRouter()


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class DecisionBody(BaseModel):
    notes: Optional[str] = None


class BulkRejectBody(BaseModel):
    recommendation_ids: List[int]
    notes: Optional[str] = None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("")
async def get_approvals(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = RecommendationService(db=db, user_id=current_user.id)
    recs = svc.list_pending()
    # Optional status filter (override default PENDING view)
    if status and status != RecommendationStatus.PENDING:
        from app.models.recommendation import Recommendation
        recs = (
            db.query(Recommendation)
            .filter(
                Recommendation.user_id == current_user.id,
                Recommendation.status == status,
            )
            .order_by(Recommendation.created_at.desc())
            .limit(100)
            .all()
        )
    return {
        "success": True,
        "approvals": [serialize_recommendation(r) for r in recs],
        "count": len(recs),
    }


@router.get("/history")
async def get_approval_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = RecommendationService(db=db, user_id=current_user.id)
    recs = svc.list_history()
    return {"success": True, "history": [serialize_recommendation(r) for r in recs]}


@router.get("/stats")
async def get_approval_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = RecommendationService(db=db, user_id=current_user.id)
    return {"success": True, "stats": svc.get_stats()}


@router.post("/{rec_id}/approve")
async def approve_recommendation(
    rec_id: int,
    body: DecisionBody = DecisionBody(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = RecommendationService(db=db, user_id=current_user.id)
    rec = svc.get_by_id(rec_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    if rec.status != RecommendationStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Already {rec.status}")

    execution_result = svc.approve(rec, notes=body.notes)
    return {
        "success": True,
        "message": "Approved and executed",
        "execution_result": execution_result,
    }


@router.post("/{rec_id}/reject")
async def reject_recommendation(
    rec_id: int,
    body: DecisionBody = DecisionBody(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = RecommendationService(db=db, user_id=current_user.id)
    rec = svc.get_by_id(rec_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    svc.reject(rec, notes=body.notes)
    return {"success": True, "message": "Recommendation rejected"}


@router.post("/bulk-reject")
async def bulk_reject_recommendations(
    body: BulkRejectBody,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = RecommendationService(db=db, user_id=current_user.id)
    count = svc.bulk_reject(body.recommendation_ids, notes=body.notes)
    return {
        "success": True,
        "message": f"{count} recommendation(s) rejected",
        "rejected_count": count,
    }
