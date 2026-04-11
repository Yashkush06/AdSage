"""
Hackathon-mode: no JWT, no auth.
All requests are serviced as user_id = 1.
get_current_user() just returns the demo user from DB.
"""

from app.core.config import settings


def get_current_user():
    """
    FastAPI dependency — always returns the demo user (id=1).
    No tokens, no headers required.
    """
    from app.core.database import SessionLocal
    from app.models.user import User

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == settings.DEMO_USER_ID).first()
        return user
    finally:
        db.close()
