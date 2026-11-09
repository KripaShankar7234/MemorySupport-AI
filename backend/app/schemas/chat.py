from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    customer_id: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Unique customer identifier (used for memory bank isolation)",
        examples=["cust_rahul_9912"],
    )
    message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="Customer support inquiry or interaction transcript",
        examples=["I am following up on my damaged package. Do I get a replacement?"],
    )
    conversation_id: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Optional session or ticket identifier",
        examples=["conv_849201"],
    )

class RecalledMemoryItem(BaseModel):
    id: Optional[str] = Field(None, description="Memory ID in Hindsight")
    text: str = Field(..., description="Recalled memory text or fact")
    score: Optional[float] = Field(None, description="Relevance score from multi-strategy retrieval")
    type: Optional[str] = Field("memory", description="Memory type classification")

class ChatResponse(BaseModel):
    customer_id: str = Field(..., description="Customer ID")
    answer: str = Field(..., description="Personalized, grounded AI support response")
    recalled_memories: List[RecalledMemoryItem] = Field(
        default_factory=list,
        description="Actual long-term memories retrieved from Hindsight",
    )
    issue_status: str = Field(
        ...,
        description="Status of the customer issue: 'resolved', 'in_progress', or 'escalated'",
    )
    escalation_required: bool = Field(
        ...,
        description="True if human specialist escalation is recommended",
    )
    ticket_id: str = Field(..., description="Unique support ticket reference ID")
    conversation_id: str = Field(..., description="Session identifier")
