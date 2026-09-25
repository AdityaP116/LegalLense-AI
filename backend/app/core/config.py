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
    gemini_api_key: str = "GEMINI_API_KEY"
    # "mock" returns controlled dev responses; "live" calls real Gemini API
    ai_service_mode: str = "live"

    # ── Server ────────────────────────────────────────────────────────────────
    cors_origins: str = "http://localhost:5173,https://legallense-ai-1.onrender.com"
    max_upload_size_mb: int = 50

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def firebase_private_key_clean(self) -> str:
        """Handle copy-paste errors (quotes, missing newlines, spaces) by reconstructing the PEM."""
        key = self.firebase_private_key.strip()
        if key.startswith('"') and key.endswith('"'):
            key = key[1:-1]
        elif key.startswith("'") and key.endswith("'"):
            key = key[1:-1]
            
        # Remove headers and footers, leaving only the base64 payload
        key = key.replace("-----BEGIN PRIVATE KEY-----", "")
        key = key.replace("-----END PRIVATE KEY-----", "")
        
        # Remove all whitespace, newlines, and literal "\n" from the payload
        key = key.replace("\\n", "").replace("\n", "").replace(" ", "")
        
        # Split into 64-character chunks (standard PEM format)
        chunks = [key[i:i+64] for i in range(0, len(key), 64)]
        formatted_key = "\n".join(chunks)
        
        # Reconstruct the valid PEM format
        return f"-----BEGIN PRIVATE KEY-----\n{formatted_key}\n-----END PRIVATE KEY-----\n"


@lru_cache
def get_settings() -> Settings:
    return Settings()
