"""
MediFlow AI — WebSocket Manager

Real-time queue updates, notifications, and event broadcasting.
"""

import json
from typing import Dict, List, Optional, Set

from fastapi import WebSocket


class ConnectionManager:
    """Manage WebSocket connections with channel-based broadcasting."""

    def __init__(self):
        # user_id -> WebSocket connection
        self.active_connections: Dict[str, WebSocket] = {}
        # channel -> set of user_ids
        self.channels: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept and register a WebSocket connection."""
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        """Remove a WebSocket connection."""
        self.active_connections.pop(user_id, None)
        # Remove from all channels
        for channel in self.channels.values():
            channel.discard(user_id)

    def subscribe(self, user_id: str, channel: str):
        """Subscribe a user to a channel (e.g., department queue)."""
        if channel not in self.channels:
            self.channels[channel] = set()
        self.channels[channel].add(user_id)

    def unsubscribe(self, user_id: str, channel: str):
        """Unsubscribe a user from a channel."""
        if channel in self.channels:
            self.channels[channel].discard(user_id)

    async def send_personal(self, user_id: str, event: str, data: dict):
        """Send event to a specific user."""
        ws = self.active_connections.get(user_id)
        if ws:
            try:
                await ws.send_json({"event": event, "data": data})
            except Exception:
                self.disconnect(user_id)

    async def broadcast_channel(self, channel: str, event: str, data: dict):
        """Broadcast event to all users in a channel."""
        user_ids = self.channels.get(channel, set()).copy()
        for user_id in user_ids:
            await self.send_personal(user_id, event, data)

    async def broadcast_all(self, event: str, data: dict):
        """Broadcast event to ALL connected users."""
        for user_id in list(self.active_connections.keys()):
            await self.send_personal(user_id, event, data)

    @property
    def connected_count(self) -> int:
        return len(self.active_connections)


# Global singleton
ws_manager = ConnectionManager()


# ── Event Types ──────────────────────────────────────────────
class QueueEvents:
    UPDATE = "queue:update"
    CALLED = "queue:called"
    STATUS_CHANGE = "queue:status_change"
    PATIENT_CHECKED_IN = "patient:checked_in"
    ROOM_STATUS_CHANGE = "room:status_change"
    PAYMENT_COMPLETED = "payment:completed"
    NOTIFICATION = "notification"
