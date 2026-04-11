from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_tables, SessionLocal
from app.api import auth, campaigns, approvals, analytics, websocket, csv_upload, creative_studio
from app.models import *  # noqa: F401 — ensure all models are registered
from app.services.scheduler import start_scheduler, stop_scheduler
import logging

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="AI-powered Meta Ads management — Hackathon Demo",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,      prefix="/api/auth",      tags=["Auth"])
app.include_router(campaigns.router, prefix="/api/campaigns", tags=["Campaigns"])
app.include_router(approvals.router, prefix="/api/approvals", tags=["Approvals"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(websocket.router,    tags=["WebSocket"])
app.include_router(csv_upload.router,        prefix="/api/csv",             tags=["CSV Import"])
app.include_router(creative_studio.router,   prefix="/api/creative-studio",  tags=["Creative Studio"])


def _ensure_demo_user():
    """Create the demo user (id=1) if it doesn't exist yet."""
    from app.models.user import User

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == settings.DEMO_USER_ID).first()
        if not user:
            user = User(
                id=settings.DEMO_USER_ID,
                email=settings.DEMO_USER_EMAIL,
                hashed_password="no-auth-needed",
                business_name=settings.DEMO_BUSINESS_NAME,
                industry=settings.DEMO_INDUSTRY,
                target_cpa=settings.DEMO_TARGET_CPA,
                target_roas=settings.DEMO_TARGET_ROAS,
            )
            db.add(user)
            db.commit()
            logger.info(f"Demo user created: {settings.DEMO_USER_EMAIL} (id={settings.DEMO_USER_ID})")
        else:
            logger.info(f"Demo user exists: {user.email} (id={user.id})")
    finally:
        db.close()


@app.on_event("startup")
async def startup():
    logger.info(f"Starting {settings.APP_NAME} — HACKATHON DEMO MODE")
    create_tables()
    _ensure_demo_user()
    # Start background agent scheduler
    start_scheduler(
        interval_seconds=getattr(settings, "AGENT_CYCLE_INTERVAL_SECONDS", 300),
        demo_user_id=settings.DEMO_USER_ID,
    )
    logger.info("Ready ✓")


@app.on_event("shutdown")
async def shutdown():
    stop_scheduler()
    logger.info("Scheduler stopped")


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "mode": "HACKATHON_DEMO",
        "auth": "none (user_id=1 hardcoded)",
        "docs": "/api/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "db": "sqlite"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
