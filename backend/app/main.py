"""
LegalLens FastAPI Backend

Startup sequence:
1. Initialize Firebase Admin SDK
2. Configure CORS
3. Mount all API routers
4. Register health endpoint and global error handlers
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.firebase import get_firebase_app
from app.api.routes import (
    cases,
    documents,
    analysis,
    evidence,
    conflicts,
    timeline,
    questions,
    chat,
    brief,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize Firebase on startup."""
    logger.info("Starting LegalLens backend …")
    try:
        get_firebase_app()
        logger.info("Firebase Admin SDK initialized.")
    except Exception as e:
        logger.warning(
            "Firebase initialization warning (check credentials): %s", e
        )
    yield
    logger.info("LegalLens backend shutting down.")


settings = get_settings()

app = FastAPI(
    title="LegalLens AI Backend",
    description="Traceability-first legal document analysis API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok",
        "service": "LegalLens API",
        "version": "1.0.0",
        "aiMode": settings.ai_service_mode,
    }


# ── Global Exception Handlers ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s: %s", request.url, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."},
    )


# ── Routers ───────────────────────────────────────────────────────────────────
PREFIX = "/api"

app.include_router(cases.router, prefix=PREFIX)
app.include_router(documents.router, prefix=PREFIX)
app.include_router(analysis.router, prefix=PREFIX)
app.include_router(evidence.router, prefix=PREFIX)
app.include_router(conflicts.router, prefix=PREFIX)
app.include_router(timeline.router, prefix=PREFIX)
app.include_router(questions.router, prefix=PREFIX)
app.include_router(chat.router, prefix=PREFIX)
app.include_router(brief.router, prefix=PREFIX)
