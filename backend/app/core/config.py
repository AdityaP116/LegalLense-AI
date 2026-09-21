"""
Application configuration via pydantic-settings.
All values are read from environment variables / .env file.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Firebase Admin SDK ────────────────────────────────────────────────────
    firebase_project_id: str = ""
    firebase_client_email: str = ""
    firebase_private_key: str = ""
    firebase_storage_bucket: str = ""

    # ── AI Provider ───────────────────────────────────────────────────────────
    gemini_api_key: str = ""
    # "mock" returns controlled dev responses; "live" calls real Gemini API
    ai_service_mode: str = "mock"

    # ── Server ────────────────────────────────────────────────────────────────
    cors_origins: str = "http://localhost:5173"
    max_upload_size_mb: int = 50

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def firebase_private_key_clean(self) -> str:
        """Handle escaped newlines that env vars sometimes produce."""
        return self.firebase_private_key.replace("\\n", "\n")


@lru_cache
def get_settings() -> Settings:
    return Settings()
