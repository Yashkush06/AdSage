"""
Background Scheduler — runs the agent cycle periodically.

Uses asyncio + a simple interval loop (no Celery/Redis).
Starts automatically when the FastAPI app starts.

Interval is controlled by AGENT_CYCLE_INTERVAL_SECONDS in config.
In hackathon mode: 300s (5 min) by default.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

_scheduler_task: Optional[asyncio.Task] = None
_running = False


async def _run_cycle_for_user(user_id: int) -> None:
    """Execute one full agent cycle for the given user."""
    from app.core.database import SessionLocal
    from app.agents.orchestrator import AgentOrchestrator

    db = SessionLocal()
    try:
        orch = AgentOrchestrator(user_id=user_id)

        # Import the WebSocket manager for real-time broadcast
        from app.api.websocket import manager
        result = await orch.run_cycle(db=db, broadcast_fn=manager.broadcast)
        logger.info(
            f"[Scheduler] Cycle complete for user {user_id} — "
            f"{result.get('total_recommendations', 0)} recommendations"
        )
    except Exception as exc:
        logger.exception(f"[Scheduler] Cycle failed for user {user_id}: {exc}")
    finally:
        db.close()


async def _scheduler_loop(interval_seconds: int, demo_user_id: int) -> None:
    global _running
    _running = True
    logger.info(f"[Scheduler] Started — interval={interval_seconds}s, user_id={demo_user_id}")

    # Small initial delay so the server is fully initialised
    await asyncio.sleep(15)

    while _running:
        started = datetime.utcnow()
        logger.info(f"[Scheduler] Triggering agent cycle at {started.isoformat()}")
        await _run_cycle_for_user(demo_user_id)
        elapsed = (datetime.utcnow() - started).total_seconds()
        sleep_for = max(1, interval_seconds - elapsed)
        logger.info(f"[Scheduler] Next cycle in {sleep_for:.0f}s")
        await asyncio.sleep(sleep_for)

    logger.info("[Scheduler] Stopped")


def start_scheduler(interval_seconds: int = 300, demo_user_id: int = 1) -> None:
    """Launch the background scheduler as an asyncio Task."""
    global _scheduler_task, _running

    if _scheduler_task and not _scheduler_task.done():
        logger.warning("[Scheduler] Already running — skipping start")
        return

    loop = asyncio.get_event_loop()
    _scheduler_task = loop.create_task(
        _scheduler_loop(interval_seconds, demo_user_id),
        name="agent_scheduler",
    )
    logger.info("[Scheduler] Task created")


def stop_scheduler() -> None:
    global _scheduler_task, _running
    _running = False
    if _scheduler_task and not _scheduler_task.done():
        _scheduler_task.cancel()
        logger.info("[Scheduler] Task cancelled")


def is_running() -> bool:
    return _running and _scheduler_task is not None and not _scheduler_task.done()
