from typing import List, Optional
from pydantic import BaseModel


class ConflictEvidenceItem(BaseModel):
    documentId: str
    documentName: Optional[str] = None
    page: Optional[int] = None
    section: Optional[str] = None
    text: str


class ConflictResponse(BaseModel):
    id: str
    caseId: str
    topic: str
    description: str
    # "needs_review" | "reviewed" | "resolved"
    status: str
    evidence: List[ConflictEvidenceItem]
    createdAt: str
