# LegalLens AI — Backend

FastAPI backend for the LegalLens AI legal document analysis platform.

## Requirements

- Python 3.11+
- A Firebase project with Firestore and Storage enabled
- (Optional) Google Gemini API key for live AI responses

---

## Quick Start

### 1. Clone and navigate to backend

```bash
cd LegalLense-AI/backend
```

### 2. Create a virtual environment

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

| Variable | Description |
|---|---|
| `FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account private key (with `\n` escaped) |
| `FIREBASE_STORAGE_BUCKET` | e.g. `your-project.appspot.com` |
| `GEMINI_API_KEY` | Google Gemini API key (optional if using mock mode) |
| `AI_SERVICE_MODE` | `mock` (default) or `live` |
| `CORS_ORIGINS` | Frontend URL, e.g. `http://localhost:5173` |

> **Note:** Leave `AI_SERVICE_MODE=mock` to test without any API key. All endpoints will return realistic demo data.

### 5. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project or use an existing one
3. Enable **Firestore** (in test mode for development)
4. Enable **Firebase Storage**
5. Go to **Project Settings → Service Accounts → Generate New Private Key**
6. Copy the values from the downloaded JSON into your `.env` file

### 6. Start the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API is now running at: http://localhost:8000

Interactive docs: http://localhost:8000/docs

---

## API Reference

### Health
```
GET /health
```

### Cases
```
POST   /api/cases              — Create a new case
GET    /api/cases              — List your cases
GET    /api/cases/{id}         — Get a specific case
PATCH  /api/cases/{id}         — Update a case
DELETE /api/cases/{id}         — Delete a case
```

### Documents
```
POST   /api/cases/{id}/documents        — Upload document (auto-processes)
GET    /api/cases/{id}/documents        — List documents
GET    /api/documents/{id}              — Get document details
DELETE /api/documents/{id}              — Delete document
POST   /api/documents/{id}/process     — Re-trigger processing
```

### Analysis
```
POST /api/cases/{id}/analyze            — Run full analysis pipeline
GET  /api/cases/{id}/analysis           — Get analysis results
GET  /api/cases/{id}/analysis/status    — Poll analysis job status
```

### Evidence, Conflicts, Timeline
```
GET /api/cases/{id}/evidence            — List extracted evidence
GET /api/evidence/{id}                  — Get single evidence item
GET /api/cases/{id}/conflicts           — List detected conflicts
GET /api/cases/{id}/timeline            — Get chronological timeline
POST /api/cases/{id}/timeline/generate  — Rebuild timeline
```

### Questions
```
GET    /api/cases/{id}/questions          — List questions
POST   /api/cases/{id}/questions          — Add custom question
PATCH  /api/questions/{id}?case_id=...    — Update question
DELETE /api/questions/{id}?case_id=...    — Delete question
POST   /api/cases/{id}/questions/generate — AI-generate questions
```

### Chat
```
POST /api/cases/{id}/chat               — Ask a question (returns answer + sources)
```

### Brief
```
GET  /api/cases/{id}/brief              — Get latest brief
POST /api/cases/{id}/brief/generate     — Generate preparation brief
```

---

## Authentication

All endpoints (except `/health`) require a Firebase ID Token:

```
Authorization: Bearer <firebase-id-token>
```

The frontend obtains this token via `firebase.auth().currentUser.getIdToken()`.

---

## Running Tests

```bash
pytest tests/ -v
```

---

## AI Modes

| Mode | Description |
|---|---|
| `mock` | Returns deterministic demo responses. No API key needed. |
| `live` | Calls real Google Gemini API. Requires `GEMINI_API_KEY`. |

---

## Deployment (Cloud Run)

```bash
gcloud run deploy legallens-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

Set environment variables in Cloud Run console or via `--set-env-vars`.
