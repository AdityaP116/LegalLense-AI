"""
Shared FastAPI dependencies providing Firestore and Storage clients.
"""

from google.cloud.firestore import Client

from app.core.firebase import get_db, get_bucket


def get_firestore() -> Client:
    return get_db()


def get_storage_bucket():
    return get_bucket()
