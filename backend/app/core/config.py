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
        """Robustly extract the PEM key from any format (JSON, quoted, etc)."""
        import re
        
        raw_key = self.firebase_private_key
        
        # Try to find the content between BEGIN and END tags using regex
        match = re.search(r'-----BEGIN PRIVATE KEY-----(.*?)-----END PRIVATE KEY-----', raw_key, re.DOTALL)
        
        if match:
            # We found the tags, extract just the payload
            payload = match.group(1)
        else:
            # No tags found, assume the user pasted just the base64 payload
            payload = raw_key
            
        # Clean the payload: KEEP ONLY VALID BASE64 CHARACTERS (A-Z, a-z, 0-9, +, /, =)
        # This completely eliminates issues with \n, \r, \t, quotes, spaces, or stray symbols.
        payload = re.sub(r'[^A-Za-z0-9+/=]', '', payload)
        
        # Split into 64-character chunks (standard PEM format)
        chunks = [payload[i:i+64] for i in range(0, len(payload), 64)]
        formatted_key = "\n".join(chunks)
        
        # Reconstruct the valid PEM format
        return f"-----BEGIN PRIVATE KEY-----\n{formatted_key}\n-----END PRIVATE KEY-----\n"


@lru_cache
def get_settings() -> Settings:
    return Settings()
