from enum import Enum
from typing import Optional, Any, Dict
from pydantic import BaseModel


class AnalysisJobStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class AnalysisJobResponse(BaseModel):
    id: str
    caseId: str
    status: AnalysisJobStatus
    progress: int  # 0-100
    currentStep: str
    error: Optional[str] = None
    createdAt: str
    completedAt: Optional[str] = None


class AnalysisStatusResponse(BaseModel):
    jobId: str
    status: AnalysisJobStatus
    progress: int
    currentStep: str
    error: Optional[str] = None


class AnalysisResultResponse(BaseModel):
    caseId: str
    documentsAnalyzed: int
    clausesExtracted: int
    conflictsFound: int
    missingReferences: int
    timelineEvents: int
    latestJobId: Optional[str] = None
    summary: Optional[Dict[str, Any]] = None
