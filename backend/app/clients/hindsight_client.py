import logging
import asyncio
from typing import Optional, List, Any, Dict
from hindsight_client import Hindsight
from app.core.config import settings

logger = logging.getLogger("memorysupport_ai.hindsight")

try:
    from hindsight_client_api.exceptions import ApiException
except ImportError:
    ApiException = None

class HindsightManager:
    """
    Manager for Hindsight Cloud Agent Memory.
    Uses official async client methods suitable for FastAPI event loops.
    """
    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: float = 60.0,
    ):
        self.base_url = base_url or settings.HINDSIGHT_BASE_URL
        self.api_key = api_key or settings.HINDSIGHT_API_KEY
        self.timeout = timeout
        self._client: Optional[Hindsight] = None

    def get_client(self) -> Hindsight:
        """Returns or lazily initializes the Hindsight client."""
        if not self.api_key:
            raise ValueError(
                "HINDSIGHT_API_KEY is not configured. Please set it in backend/.env"
            )
        if self._client is None:
            self._client = Hindsight(
                base_url=self.base_url,
                api_key=self.api_key,
                timeout=self.timeout,
            )
        return self._client

    async def ensure_bank_exists(self, bank_id: str) -> bool:
        """
        Asynchronously creates or ensures the memory bank exists.
        Idempotent; safely handles 409 Conflict if bank already exists.
        """
        client = self.get_client()
        try:
            await asyncio.wait_for(
                client.acreate_bank(bank_id=bank_id),
                timeout=self.timeout,
            )
            logger.info(f"Memory bank verified/created: '{bank_id}'")
            return True
        except Exception as exc:
            if ApiException and isinstance(exc, ApiException) and exc.status == 409:
                logger.debug(f"Memory bank '{bank_id}' already exists (409 Conflict - OK).")
                return True
            logger.warning(f"Note during acreate_bank for '{bank_id}': {exc}")
            return True

    async def retain_memory(
        self,
        bank_id: str,
        content: str,
        context: Optional[str] = None,
        tags: Optional[List[str]] = None,
        document_id: Optional[str] = None,
    ) -> Any:
        """
        Retains content in the specified memory bank using the async SDK method.
        Supports document_id for idempotent writes / deduping on retries.
        """
        client = self.get_client()
        logger.info(f"Retaining memory in bank='{bank_id}', doc_id='{document_id}'")
        kwargs: Dict[str, Any] = {"bank_id": bank_id, "content": content}
        if context:
            kwargs["context"] = context
        if tags:
            kwargs["tags"] = tags
        if document_id:
            kwargs["document_id"] = document_id

        return await asyncio.wait_for(
            client.aretain(**kwargs),
            timeout=self.timeout,
        )

    async def recall_memory(
        self,
        bank_id: str,
        query: str,
        tags: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Recalls memories relevant to the query from the specified memory bank.
        Returns a normalized list of memory items with score, text, and type.
        """
        client = self.get_client()
        logger.info(f"Recalling memory from bank='{bank_id}' for query='{query[:50]}...'")

        kwargs: Dict[str, Any] = {"bank_id": bank_id, "query": query}
        if tags:
            kwargs["tags"] = tags

        try:
            recall_response = await asyncio.wait_for(
                client.arecall(**kwargs),
                timeout=self.timeout,
            )
        except Exception as exc:
            # If bank doesn't exist yet or has 0 items
            logger.warning(f"Recall for bank='{bank_id}' returned exception: {exc}")
            return []

        results = getattr(recall_response, "results", None)
        if results is None and isinstance(recall_response, list):
            results = recall_response

        normalized = []
        if results:
            for item in results:
                normalized.append({
                    "id": getattr(item, "id", None),
                    "text": getattr(item, "text", str(item)),
                    "score": getattr(item, "score", None),
                    "type": getattr(item, "type", "memory"),
                })

        return normalized

    async def close(self):
        """Closes client connections cleanly without leaving unclosed sessions."""
        if self._client:
            try:
                if hasattr(self._client, "aclose"):
                    await self._client.aclose()
                elif hasattr(self._client, "close"):
                    res = self._client.close()
                    if asyncio.iscoroutine(res):
                        await res
            except Exception as exc:
                logger.debug(f"Exception during Hindsight client shutdown: {exc}")
            finally:
                self._client = None

hindsight_manager = HindsightManager()
