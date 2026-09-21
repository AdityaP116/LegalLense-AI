from typing import List, Optional
from pydantic import BaseModel, Field


class QuestionSource(BaseModel):
    documentId: str
    documentName: Optional[str] = None
    page: Optional[int] = None
    section: Optional[str] = None
    text: str


class QuestionCreate(BaseModel):
    question: str = Field(..., min_length=5, max_length=1000)
    category: Optional[str] = None
    rationale: Optional[str] = None


class QuestionUpdate(BaseModel):
    question: Optional[str] = Field(None, min_length=5, max_length=1000)
    category: Optional[str] = None
    rationale: Optional[str] = None
    # "open" | "discussed" | "resolved"
    status: Optional[str] = None


class QuestionResponse(BaseModel):
    id: str
    caseId: str
    question: str
    category: Optional[str] = None
    rationale: Optional[str] = None
    # "open" | "discussed" | "resolved"
    status: str
    sources: List[QuestionSource] = []
    # "generated" | "user_added"
    origin: str = "generated"
    createdAt: str
    updatedAt: str
