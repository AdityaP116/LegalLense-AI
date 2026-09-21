from fastapi import APIRouter, Depends
from google.cloud.firestore import Client

from app.core.auth import get_current_user
from app.core.dependencies import get_firestore
from app.schemas.chat import ChatRequest
from app.services import ai_service, retrieval_service
from app.services.case_service import get_case

router = APIRouter(tags=["Chat"])


@router.post("/cases/{case_id}/chat", response_model=dict)
def chat(
    case_id: str,
    body: ChatRequest,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    case = get_case(db, case_id, user["uid"])

    # Retrieve relevant chunks
    chunks = retrieval_service.retrieve(db, case_id, body.question)

    # Get AI answer
    result = ai_service.answer_question(
        body.question,
        chunks,
        situation=case.get("situation", ""),
    )

    # Build sources from chunks used
    sources = []
    for chunk in chunks[:5]:  # Top 5 sources
        sources.append(
            {
                "documentId": chunk.get("documentId", ""),
                "filename": chunk.get("documentName", ""),
                "page": chunk.get("page"),
                "section": chunk.get("section"),
                "text": chunk.get("text", "")[
                    :300
                ],  # Truncate for response size
            }
        )

    return {
        "data": {
            "answer": result.get("answer", ""),
            "status": result.get("status", "NOT_FOUND"),
            "sources": sources,
        }
    }
