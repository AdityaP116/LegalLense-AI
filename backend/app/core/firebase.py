"""
Firebase Admin SDK initialization.

Ensures Firebase is only initialized once regardless of import order.
Provides helper functions to get the Firestore client and Storage bucket.
"""

import firebase_admin
from firebase_admin import credentials, firestore, storage
from google.cloud.firestore import Client

from app.core.config import get_settings

_firebase_app: firebase_admin.App | None = None


def _init_firebase() -> firebase_admin.App:
    import os
    settings = get_settings()
    if settings.firebase_project_id:
        os.environ["GOOGLE_CLOUD_PROJECT"] = settings.firebase_project_id

    if (
        settings.firebase_project_id
        and settings.firebase_client_email
        and settings.firebase_private_key
    ):
        cred = credentials.Certificate(
            {
                "type": "service_account",
                "project_id": settings.firebase_project_id,
                "private_key": settings.firebase_private_key_clean,
                "client_email": settings.firebase_client_email,
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        )
        app = firebase_admin.initialize_app(
            cred,
            {"storageBucket": settings.firebase_storage_bucket},
        )
    else:
        # No credentials — initialize without explicit credentials.
        # In this case Firestore/Storage calls will fail gracefully.
        # The server will still start and /health will respond.
        try:
            if settings.firebase_project_id:
                app = firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})
            else:
                app = firebase_admin.initialize_app()
        except ValueError:
            # Already initialized (e.g., during testing)
            app = firebase_admin.get_app()

    return app


def get_firebase_app() -> firebase_admin.App:
    global _firebase_app
    if _firebase_app is None:
        # Check if already initialized (e.g., test fixtures)
        try:
            _firebase_app = firebase_admin.get_app()
        except ValueError:
            _firebase_app = _init_firebase()
    return _firebase_app


def get_db() -> Client:
    """Return the Firestore client."""
    get_firebase_app()
    return firestore.client()


def get_bucket():
    """Return the Firebase Storage bucket."""
    get_firebase_app()
    return storage.bucket()
