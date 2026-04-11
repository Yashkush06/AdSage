"""
Hackathon-mode: no JWT, no auth.
All requests are serviced as user_id = 1.
get_current_user() just returns the demo user from DB.
"""

from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db


def get_current_user(db: Session = Depends(get_db)):
    """
    FastAPI dependency — always returns the demo user (id=1).
    No tokens, no headers required.
    """
    from app.models.user import User
    return db.query(User).filter(User.id == settings.DEMO_USER_ID).first()
