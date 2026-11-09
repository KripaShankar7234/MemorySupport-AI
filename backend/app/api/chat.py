import re
import uuid
import hashlib
import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.chat import ChatRequest, ChatResponse, RecalledMemoryItem
from app.clients.hindsight_client import hindsight_manager
from app.services.llm_service import llm_service
from app.clients.mongo_client import mongo_manager
from app.core.config import settings

logger = logging.getLogger("memorysupport_ai.api.chat")
router = APIRouter(tags=["Support Chat"])

def get_isolated_bank_id(customer_id: str) -> str:
    """
    Computes an isolated, normalized memory bank ID for the customer.
    Ensures alphanumeric and hyphen compliance for Hindsight Cloud banks.
    """
    normalized_id = re.sub(r"[^a-zA-Z0-9-]", "-", customer_id.strip().lower())
    normalized_id = re.sub(r"-+", "-", normalized_id).strip("-")
    if not normalized_id:
        normalized_id = "default"
    return f"{settings.HINDSIGHT_BANK_ID}-{normalized_id}"

@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Unified Memory-Augmented Support Chat Endpoint",
    description="Recalls isolated long-term memories from Hindsight Cloud, reasons with Groq LLM, "
                "persists interaction in MongoDB Atlas, and retains interaction without duplicating retries.",
)
async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    logger.info(f"Incoming chat request for customer_id='{request.customer_id}'")

    # 1. Compute isolated memory bank ID and ensure bank exists
    customer_bank_id = get_isolated_bank_id(request.customer_id)
    await hindsight_manager.ensure_bank_exists(customer_bank_id)

    # 2. Retrieve customer-specific memories from Hindsight Cloud
    try:
        raw_memories = await hindsight_manager.recall_memory(
            bank_id=customer_bank_id,
            query=request.message,
        )
    except Exception as exc:
        logger.error(f"Error recalling memories from Hindsight: {exc}")
        raw_memories = []

    # 3. Generate grounded, personalized response via Groq
    try:
        llm_result = await llm_service.generate_support_response(
            customer_message=request.message,
            recalled_memories=raw_memories,
        )
    except PermissionError as auth_err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(auth_err),
        )
    except TimeoutError as timeout_err:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=str(timeout_err),
        )
    except Exception as exc:
        logger.error(f"Error during Groq LLM inference: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Inference engine failure: {str(exc)}",
        )

    ai_answer = llm_result["response"]
    escalation_required = llm_result.get("escalation_recommended", False)

    # 4. Determine Issue Status
    lower_msg = request.message.lower()
    if escalation_required:
        issue_status = "escalated"
    elif any(phrase in lower_msg for phrase in ["solved", "all good", "thank you", "thanks, that helps", "resolved"]):
        issue_status = "resolved"
    else:
        issue_status = "in_progress"

    # 5. Session and Ticket ID generation
    conversation_id = request.conversation_id or f"conv_{uuid.uuid4().hex[:10]}"
    ticket_seed = f"{request.customer_id}:{conversation_id}".encode("utf-8")
    ticket_id = f"TKT-{hashlib.md5(ticket_seed).hexdigest()[:8].upper()}"

    # 6. Retain meaningful interaction in Hindsight idempotently
    # Use deterministic document_id based on message hash to prevent duplicate writes on retries
    doc_hash = hashlib.sha256(f"{request.customer_id}:{conversation_id}:{request.message}".encode("utf-8")).hexdigest()[:16]
    doc_id = f"int_{doc_hash}"

    retained_summary = (
        f"Customer Support Interaction Transcript:\n"
        f"Customer Query: {request.message.strip()}\n"
        f"Agent Response: {ai_answer}\n"
        f"Status: {issue_status} | Escalation: {escalation_required}"
    )

    try:
        await hindsight_manager.retain_memory(
            bank_id=customer_bank_id,
            content=retained_summary,
            context="customer_support_chat",
            document_id=doc_id,
            tags=["chat_interaction", issue_status, f"ticket_{ticket_id}"],
        )
    except Exception as exc:
        # Non-blocking for client response if retain has transient lag
        logger.warning(f"Failed to retain interaction to Hindsight (non-fatal): {exc}")

    # 7. Persist Ticket and Interaction to MongoDB Atlas
    recalled_items = [
        RecalledMemoryItem(
            id=item.get("id"),
            text=item.get("text", ""),
            score=item.get("score"),
            type=item.get("type", "memory"),
        )
        for item in raw_memories
    ]

    await mongo_manager.save_ticket_and_interaction(
        ticket_id=ticket_id,
        customer_id=request.customer_id,
        conversation_id=conversation_id,
        customer_message=request.message,
        answer=ai_answer,
        recalled_memories=[m.model_dump() for m in recalled_items],
        issue_status=issue_status,
        escalation_required=escalation_required,
        metadata={
            "model_used": llm_result.get("model_used"),
            "tokens_used": llm_result.get("tokens_used"),
        },
    )

    # 8. Return structured ChatResponse
    return ChatResponse(
        customer_id=request.customer_id,
        answer=ai_answer,
        recalled_memories=recalled_items,
        issue_status=issue_status,
        escalation_required=escalation_required,
        ticket_id=ticket_id,
        conversation_id=conversation_id,
    )
