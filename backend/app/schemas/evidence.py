from enum import Enum
from typing import Optional
from pydantic import BaseModel


class EvidenceStatus(str, Enum):
    FOUND_DIRECTLY = "FOUND_DIRECTLY"
    DERIVED_FROM_DOCUMENTS = "DERIVED_FROM_DOCUMENTS"
    NOT_FOUND = "NOT_FOUND"
    NEEDS_REVIEW = "NEEDS_REVIEW"


class EvidenceType(str, Enum):
    clause = "clause"
    obligation = "obligation"
    date = "date"
    amount = "amount"
    entity = "entity"
    reference = "reference"
    event = "event"


class EvidenceResponse(BaseModel):
    id: str
    caseId: str
    documentId: str
    documentName: Optional[str] = None
    page: Optional[int] = None
    section: Optional[str] = None
    text: str
    evidenceType: EvidenceType
    status: EvidenceStatus
    topic: Optional[str] = None
    createdAt: str
