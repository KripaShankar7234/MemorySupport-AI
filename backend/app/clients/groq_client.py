import os
import logging
from typing import Optional, List, Dict, Any
from groq import AsyncGroq
from app.core.config import settings

logger = logging.getLogger(__name__)

class GroqManager:
    """
    Manager for Groq fast LLM inference.
    """
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GROQ_API_KEY
        self._model = model
        self._client: Optional[AsyncGroq] = None

    @property
    def model(self) -> str:
        return os.getenv("GROQ_MODEL") or self._model or settings.GROQ_MODEL or "openai/gpt-oss-120b"

    def get_client(self) -> AsyncGroq:
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not configured. Please set it in backend/.env")
        if self._client is None:
            self._client = AsyncGroq(api_key=self.api_key)
        return self._client

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 1024,
    ) -> str:
        client = self.get_client()
        target_model = model or self.model
        response = await client.chat.completions.create(
            messages=messages,
            model=target_model,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content or ""

groq_manager = GroqManager()
