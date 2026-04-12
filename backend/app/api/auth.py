"""
Hackathon auth router.
No real auth — just a /setup endpoint to update demo user profile & goals.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.core.config import settings

router = APIRouter()


class SetupRequest(BaseModel):
    business_name: Optional[str] = None
    industry: Optional[str] = None
    target_cpa: Optional[float] = None
    target_roas: Optional[float] = None
    monthly_budget: Optional[float] = None
    strategy: Optional[str] = None


@router.get("/me")
async def me(db: Session = Depends(get_db)):
    current_user = db.query(User).filter(User.id == settings.DEMO_USER_ID).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="Demo user not found")
    return {
        "id": current_user.id,
        "email": current_user.email,
        "business_name": current_user.business_name,
        "industry": current_user.industry,
        "target_cpa": current_user.target_cpa,
        "target_roas": current_user.target_roas,
        "monthly_budget": current_user.monthly_budget,
        "strategy": current_user.strategy,
    }


@router.patch("/me")
async def update_profile(
    req: SetupRequest,
    db: Session = Depends(get_db),
):
    current_user = db.query(User).filter(User.id == settings.DEMO_USER_ID).first()
    if not current_user:
        # Auto-create demo user if missing
        current_user = User(
            id=settings.DEMO_USER_ID,
            email=settings.DEMO_USER_EMAIL,
            hashed_password="no-auth-needed",
            business_name=settings.DEMO_BUSINESS_NAME,
            industry=settings.DEMO_INDUSTRY,
        )
        db.add(current_user)
        db.flush()
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return {"success": True}


# Keep /register and /login as no-ops so frontend calls don't fail
@router.post("/register")
async def register(current_user: User = Depends(get_current_user)):
    from app.core.config import settings
    return {
        "access_token": "demo-token",
        "token_type": "bearer",
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "business_name": current_user.business_name,
        },
    }


@router.post("/login")
async def login(current_user: User = Depends(get_current_user)):
    return {
        "access_token": "demo-token",
        "token_type": "bearer",
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "business_name": current_user.business_name,
            "industry": current_user.industry,
            "target_cpa": current_user.target_cpa,
            "target_roas": current_user.target_roas,
            "strategy": current_user.strategy,
        },
    }
