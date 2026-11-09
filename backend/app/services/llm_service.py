import os
import logging
import asyncio
from typing import Optional, List, Dict, Any, Union
from groq import (
    AsyncGroq,
    AuthenticationError,
    RateLimitError,
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
)
from app.core.config import settings

logger = logging.getLogger("memorysupport_ai.llm_service")

# Default system prompt enforcing grounding, anti-hallucination, and escalation protocols
SYSTEM_SUPPORT_PROMPT = """You are the MemorySupport AI Copilot, an intelligent, empathetic customer support assistant with persistent memory powered by Hindsight.

STRICT GROUNDING & FACT-CHECKING PROTOCOLS:
1. DISTINGUISH CONFIRMED ACTIONS FROM PENDING ACTIONS:
   - Clearly separate what is verified/completed from what is merely requested, preferred, or in progress.
   - If memory records that the customer requested a replacement, acknowledge this as the customer's recorded preference.
   - If memory records that the fulfillment team or warehouse was notified to inspect serial numbers/items, state truthfully that the warehouse inspection is currently PENDING.
   - NEVER claim or imply that a replacement has already shipped, been dispatched, or been confirmed unless explicitly documented as completed.

2. NEVER PROMISE SHIPMENT, TRACKING, OR DATES:
   - NEVER promise that an item has shipped or will ship within a specific time.
   - NEVER guarantee that tracking details, carrier tracking links, or dispatch confirmations will arrive shortly unless verified tracking data exists in memory.
   - NEVER invent or confirm refunds, banking approvals, or financial statuses that are not explicitly documented.

3. PREFERENCE ADHERENCE:
   - Strictly honor documented communication preferences. If the customer prefers email-only updates, explicitly confirm that follow-ups will occur via email and that no phone calls will be placed.

4. HONEST STATUS REPORTING & ESCALATION:
   - Never invent or assume ticket, order, or fulfillment statuses.
   - If an issue involves damaged goods awaiting warehouse verification or policy exceptions, explain the exact current state and confirm that the case is marked for human specialist review.

5. TONE & STYLE:
   - Professional, courteous, transparent, and concise.
   - Reassuring without making false promises or fabricating logistics."""

class LLMService:
    """
    Service responsible for fast LLM inference via Groq AsyncGroq,
    integrating retrieved Hindsight memories into support responses.
    """
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout: float = 60.0,
    ):
        self.api_key = api_key or settings.GROQ_API_KEY
        self._configured_model = model
        self.timeout = timeout
        self._client: Optional[AsyncGroq] = None

    @property
    def model(self) -> str:
        """Dynamically resolves the active Groq model from environment or settings."""
        return os.getenv("GROQ_MODEL") or self._configured_model or settings.GROQ_MODEL or "openai/gpt-oss-120b"

    def get_client(self) -> AsyncGroq:
        """Returns or lazily creates the AsyncGroq client."""
        if not self.api_key:
            raise ValueError(
                "GROQ_API_KEY is not configured. Please set GROQ_API_KEY in backend/.env"
            )
        if self._client is None:
            self._client = AsyncGroq(
                api_key=self.api_key,
                timeout=self.timeout,
            )
        return self._client

    def _format_memory_context(self, memories: Union[str, List[Any]]) -> str:
        """Formats recalled Hindsight memory objects or text into a clear contextual block."""
        if not memories:
            return "No previous interaction history found in memory bank."

        if isinstance(memories, str):
            return memories.strip()

        formatted_items = []
        for idx, item in enumerate(memories, start=1):
            if isinstance(item, str):
                formatted_items.append(f"- Fact #{idx}: {item}")
            elif hasattr(item, "text"):
                score = getattr(item, "score", None)
                mtype = getattr(item, "type", "memory")
                score_str = f" (relevance: {score:.2f})" if isinstance(score, float) else ""
                formatted_items.append(f"- [{mtype.upper()}]{score_str}: {item.text}")
            elif isinstance(item, dict):
                text = item.get("text") or item.get("content") or str(item)
                formatted_items.append(f"- Memory #{idx}: {text}")
            else:
                formatted_items.append(f"- Item #{idx}: {str(item)}")

        return "\n".join(formatted_items)

    async def generate_support_response(
        self,
        customer_message: str,
        recalled_memories: Union[str, List[Any]],
        conversation_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.3,
        max_tokens: int = 800,
    ) -> Dict[str, Any]:
        """
        Generates an informed, grounded support response combining the customer message
        with verified long-term memory context retrieved from Hindsight.
        """
        client = self.get_client()
        memory_block = self._format_memory_context(recalled_memories)

        user_content = (
            f"=== RECALLED CUSTOMER MEMORY (FROM HINDSIGHT) ===\n"
            f"{memory_block}\n\n"
            f"=== CURRENT CUSTOMER MESSAGE ===\n"
            f"{customer_message.strip()}\n\n"
            f"Generate a personalized, grounded response adhering strictly to these rules:\n"
            f"1. Clearly distinguish confirmed actions from pending actions: acknowledge the replacement request as the customer's recorded preference, but explicitly clarify that the fulfillment/warehouse serial number inspection is still pending.\n"
            f"2. Do NOT promise that a replacement has shipped or that tracking numbers/details will arrive shortly.\n"
            f"3. Reassure the customer that updates will be sent via their preferred channel (email only, no phone calls).\n"
            f"4. Never invent refund or delivery statuses; remain honest, empathetic, and concise."
        )

        messages = [{"role": "system", "content": SYSTEM_SUPPORT_PROMPT}]

        # Inject conversation history if provided (excluding system messages)
        if conversation_history:
            for msg in conversation_history:
                if msg.get("role") in ("user", "assistant"):
                    messages.append({"role": msg["role"], "content": msg["content"]})

        messages.append({"role": "user", "content": user_content})

        logger.info(
            f"Dispatching inference request to Groq model='{self.model}' "
            f"(timeout={self.timeout}s)"
        )

        try:
            chat_completion = await asyncio.wait_for(
                client.chat.completions.create(
                    messages=messages,
                    model=self.model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                ),
                timeout=self.timeout,
            )

            response_text = chat_completion.choices[0].message.content or ""
            usage = getattr(chat_completion, "usage", None)

            # Heuristic detection of escalation mention in response
            escalation_detected = any(
                phrase in response_text.lower()
                for phrase in [
                    "escalated",
                    "escalating",
                    "human agent",
                    "specialist team",
                    "support team review",
                    "billing team",
                ]
            )

            return {
                "response": response_text.strip(),
                "escalation_recommended": escalation_detected,
                "model_used": self.model,
                "tokens_used": {
                    "prompt_tokens": getattr(usage, "prompt_tokens", None),
                    "completion_tokens": getattr(usage, "completion_tokens", None),
                    "total_tokens": getattr(usage, "total_tokens", None),
                } if usage else {},
                "memory_context_applied": bool(recalled_memories),
            }

        except asyncio.TimeoutError as err:
            logger.error(f"Groq API call timed out after {self.timeout} seconds.")
            raise TimeoutError(f"Groq API request timed out after {self.timeout}s") from err

        except AuthenticationError as err:
            logger.error("Groq Authentication Failed: Invalid GROQ_API_KEY.")
            raise PermissionError("Groq authentication failed. Please verify GROQ_API_KEY in backend/.env") from err

        except RateLimitError as err:
            logger.warning(f"Groq rate limit exceeded: {err}")
            raise

        except APIConnectionError as err:
            logger.error(f"Unable to connect to Groq API servers: {err}")
            raise

        except APIStatusError as err:
            logger.error(f"Groq API returned HTTP status {err.status_code}: {err.message}")
            raise

    async def close(self):
        """Clean up client connections."""
        if self._client:
            await self._client.close()
            self._client = None

# Singleton instance
llm_service = LLMService()
