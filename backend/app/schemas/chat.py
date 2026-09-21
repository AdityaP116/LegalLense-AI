from typing import List, Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=2000)


class ChatSource(BaseModel):
    documentId: str
    filename: str
    page: Optional[int] = None
    section: Optional[str] = None
    text: str


class ChatResponse(BaseModel):
    answer: str
    # "FOUND_DIRECTLY" | "DERIVED_FROM_DOCUMENTS" | "NOT_FOUND" | "NEEDS_REVIEW"
    status: str
    sources: List[ChatSource]
