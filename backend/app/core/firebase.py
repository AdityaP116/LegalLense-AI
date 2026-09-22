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

    # Check for serviceAccountKey.json in the backend root directory
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    service_account_path = os.path.join(backend_dir, "serviceAccountKey.json")

    bucket_name = settings.firebase_storage_bucket or (f"{settings.firebase_project_id}.firebasestorage.app" if settings.firebase_project_id else None)

    if os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
        options = {}
        if bucket_name:
            options["storageBucket"] = bucket_name
        app = firebase_admin.initialize_app(cred, options if options else None)
    elif (
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
        options = {}
        if bucket_name:
            options["storageBucket"] = bucket_name
        app = firebase_admin.initialize_app(cred, options if options else None)
    else:
        # No explicit credentials found
        try:
            if settings.firebase_project_id:
                app = firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})
            else:
                app = firebase_admin.initialize_app()
        except ValueError:
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
