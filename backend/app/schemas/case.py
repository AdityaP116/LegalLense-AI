from typing import List, Optional
from pydantic import BaseModel, Field

VALID_CATEGORIES = [
    "Employment",
    "Rental/Housing",
    "Business Contract",
    "Consumer Issue",
    "Finance",
    "Insurance",
    "Other",
]

VALID_STATUSES = ["active", "archived", "completed"]


class CaseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    category: str = Field(..., description="Legal category")
    situation: str = Field(..., min_length=10, max_length=5000)
    goals: List[str] = Field(default_factory=list)


class CaseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[str] = None
    situation: Optional[str] = Field(None, min_length=10, max_length=5000)
    goals: Optional[List[str]] = None
    status: Optional[str] = None


class CaseResponse(BaseModel):
    id: str
    userId: str
    title: str
    category: str
    situation: str
    goals: List[str]
    status: str
    createdAt: str
    updatedAt: str
