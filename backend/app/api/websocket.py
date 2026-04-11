"""WebSocket endpoint for real-time agent activity broadcast"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory connection manager
class ConnectionManager:
    def __init__(self):
        self.active: Dict[int, List[WebSocket]] = {}  # user_id → [ws]

    async def connect(self, user_id: int, ws: WebSocket):
        await ws.accept()
        if user_id not in self.active:
            self.active[user_id] = []
        self.active[user_id].append(ws)
        logger.info(f"WebSocket connected: user {user_id} ({len(self.active[user_id])} connections)")

    def disconnect(self, user_id: int, ws: WebSocket):
        if user_id in self.active:
            self.active[user_id] = [c for c in self.active[user_id] if c != ws]
        logger.info(f"WebSocket disconnected: user {user_id}")

    async def broadcast(self, payload: dict):
        """Broadcast to all connections for a specific user"""
        user_id = payload.get("user_id")
        if not user_id or user_id not in self.active:
            return
        dead = []
        for ws in self.active[user_id]:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(user_id, ws)

    async def broadcast_all(self, payload: dict):
        """Broadcast to all connected users"""
        for user_id in list(self.active.keys()):
            user_payload = {**payload, "user_id": user_id}
            await self.broadcast(user_payload)


manager = ConnectionManager()


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(ws: WebSocket, user_id: int):
    await manager.connect(user_id, ws)
    try:
        await ws.send_json({"type": "connected", "message": "Real-time agent feed connected", "user_id": user_id})
        while True:
            try:
                data = await ws.receive_text()
                # Echo / heartbeat
                await ws.send_json({"type": "pong", "data": data})
            except WebSocketDisconnect:
                break
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(user_id, ws)
