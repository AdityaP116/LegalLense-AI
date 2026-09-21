from typing import Any, Dict, List
from pydantic import BaseModel


class BriefSection(BaseModel):
    title: str
    content: str
    sources: List[Dict[str, Any]] = []


class BriefResponse(BaseModel):
    id: str
    caseId: str
    sections: List[BriefSection]
    disclaimer: str
    generatedAt: str
