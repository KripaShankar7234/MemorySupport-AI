import re
import os
import logging
import asyncio
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger("memorysupport_ai.mongo")

try:
    import certifi
    TLS_CA_FILE = certifi.where()
except Exception:
    TLS_CA_FILE = None

class MongoManager:
    """
    Manager for MongoDB Atlas async connection and customer interaction persistence.
    Uses official TLS certificates via certifi and resilient timeouts.
    """
    def __init__(self, uri: Optional[str] = None, db_name: Optional[str] = None):
        self._raw_uri = uri
        self.db_name = db_name or settings.MONGODB_DB_NAME
        self._client: Optional[AsyncIOMotorClient] = None

    @property
    def uri(self) -> str:
        raw = os.getenv("MONGODB_URI") or self._raw_uri or settings.MONGODB_URI
        if not raw:
            return ""
        # Auto-sanitize if password was accidentally copied with angle brackets :<password>@
        if ":<" in raw and ">@" in raw:
            raw = re.sub(r":<([^>]+)>@", r":\1@", raw)
        return raw.strip()

    def get_client(self) -> AsyncIOMotorClient:
        target_uri = self.uri
        if not target_uri:
            raise ValueError("MONGODB_URI is not configured. Please set it in backend/.env")
        if self._client is None:
            kwargs: Dict[str, Any] = {
                "serverSelectionTimeoutMS": 8000,
                "connectTimeoutMS": 8000,
                "socketTimeoutMS": 8000,
            }
            if TLS_CA_FILE:
                kwargs["tlsCAFile"] = TLS_CA_FILE

            self._client = AsyncIOMotorClient(target_uri, **kwargs)
        return self._client

    def get_database(self) -> AsyncIOMotorDatabase:
        client = self.get_client()
        return client[self.db_name]

    async def ping(self) -> bool:
        """Pings the MongoDB Atlas cluster to verify actual database connectivity."""
        try:
            client = self.get_client()
            result = await client.admin.command("ping")
            return bool(result and result.get("ok") == 1.0)
        except Exception as exc:
            logger.error(f"MongoDB ping failed: {exc}")
            return False

    async def save_ticket_and_interaction(
        self,
        ticket_id: str,
        customer_id: str,
        conversation_id: str,
        customer_message: str,
        answer: str,
        recalled_memories: List[Dict[str, Any]],
        issue_status: str,
        escalation_required: bool,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Persists customer support ticket and interaction history into MongoDB Atlas.
        """
        if not self.uri:
            logger.warning("MONGODB_URI not configured; skipping database persistence.")
            return False

        try:
            db = self.get_database()
            now = datetime.now(timezone.utc)

            # 1. Upsert Ticket record
            ticket_doc = {
                "ticket_id": ticket_id,
                "customer_id": customer_id,
                "conversation_id": conversation_id,
                "last_message": customer_message,
                "last_answer": answer,
                "issue_status": issue_status,
                "escalation_required": escalation_required,
                "updated_at": now,
            }
            await db["tickets"].update_one(
                {"ticket_id": ticket_id},
                {
                    "$set": ticket_doc,
                    "$setOnInsert": {"created_at": now},
                },
                upsert=True,
            )

            # 2. Append to Interactions audit log
            interaction_doc = {
                "ticket_id": ticket_id,
                "customer_id": customer_id,
                "conversation_id": conversation_id,
                "customer_message": customer_message,
                "ai_response": answer,
                "recalled_memories_count": len(recalled_memories),
                "recalled_memories": recalled_memories,
                "issue_status": issue_status,
                "escalation_required": escalation_required,
                "timestamp": now,
                "metadata": metadata or {},
            }
            insert_result = await db["interactions"].insert_one(interaction_doc)
            logger.info(f"Persisted interaction in MongoDB (id={insert_result.inserted_id}) for ticket='{ticket_id}'")
            return bool(insert_result.acknowledged)

        except Exception as exc:
            logger.error(f"Failed to persist interaction in MongoDB: {exc}")
            return False

    async def close(self):
        """Closes MongoDB connection pool cleanly."""
        if self._client:
            self._client.close()
            self._client = None

mongo_manager = MongoManager()
