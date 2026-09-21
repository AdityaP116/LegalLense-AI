from typing import Optional
from pydantic import BaseModel


class TimelineEventResponse(BaseModel):
    id: str
    caseId: str
    eventDate: Optional[str] = None  # ISO date string; None = uncertain
    title: str
    description: str
    documentId: Optional[str] = None
    documentName: Optional[str] = None
    page: Optional[int] = None
    # "confirmed" | "derived" | "needs_review"
    status: str
    createdAt: str
