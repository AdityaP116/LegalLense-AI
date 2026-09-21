from enum import Enum
from typing import Optional
from pydantic import BaseModel


class ProcessingStatus(str, Enum):
    uploaded = "uploaded"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class DocumentResponse(BaseModel):
    id: str
    caseId: str
    filename: str
    documentType: str
    storagePath: str
    mimeType: str
    fileSize: int
    pageCount: Optional[int] = None
    processingStatus: ProcessingStatus
    processingError: Optional[str] = None
    createdAt: str
    updatedAt: str
