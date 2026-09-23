# ⚖️ LegalLens AI — Legal Document Analysis & Evidentiary Intelligence Platform

LegalLens AI is a modern, enterprise-grade AI legal assistant that parses, analyzes, and cross-references complex legal documents. Built with **FastAPI**, **React**, **Firebase**, and **Google Gemini AI**, LegalLens automatically identifies contract clauses, detects cross-document contradictions, builds chronological timelines, and calculates an **Evidentiary Health Score** for your legal cases.

---

## ✨ Features

- 🔍 **Vector Search RAG (Retrieval-Augmented Generation)**
  Uses Google Gemini `text-embedding-004` to index document chunks and perform semantic similarity search, grounding AI answers with exact source citations.

- ⚠️ **Generalized Conflict Detection**
  LLM-powered cross-document analysis that finds contradictions across any topic — notice periods, liability caps, jurisdiction, non-compete terms, or payment schedules.

- 📄 **Native Document Viewer**
  Slide-over document preview panel supporting native PDF rendering in sandboxed preview mode with page-level jumping, extracted text review, and evidence highlighting.

- 📊 **Dynamic Evidentiary Health Score**
  Real-time case health calculation based on verified evidence, identified conflicts, missing document references, and unverified claims.

- 💬 **Grounded Legal AI Chat**
  Interactive chat interface allowing attorneys and legal analysts to query document sets with precise source document and page attribution.

- 📅 **Automated Timeline Extraction**
  Extracts critical dates, effective periods, and milestone events into a unified chronological case timeline.

- 🔒 **Privacy & AI Processing Consent**
  Built-in compliance checks requiring explicit user consent for secure cloud storage and AI contract processing prior to analysis.

- ⚙️ **User Settings & Privacy Controls**
  Profile management, storage usage statistics, data export options, and secure account deletion.

---

## 🛠️ Architecture & Tech Stack

```
                     ┌─────────────────────────────────────────┐
                     │           React 19 + Vite UI            │
                     │   (TailwindCSS / Material Symbols)      │
                     └────────────────────┬────────────────────┘
                                          │  REST API (Bearer Token)
                                          ▼
                     ┌─────────────────────────────────────────┐
                     │            FastAPI Backend              │
                     └──────────┬───────────────────┬──────────┘
                                │                   │
                                ▼                   ▼
                    ┌──────────────────────┐   ┌──────────────────────┐
                    │  Google Gemini AI    │   │  Firebase Ecosystem  │
                    │  • 1.5 Flash / Pro   │   │  • Authentication    │
                    │  • text-embedding-004│   │  • Cloud Firestore   │
                    └──────────────────────┘   │  • Cloud Storage     │
                                               └──────────────────────┘
```

### Frontend Stack
- **Framework**: React 19 + Vite + TypeScript
- **Styling**: TailwindCSS, Radix UI primitives, Lucide Icons, Material Symbols
- **Authentication**: Firebase Web SDK
- **Routing**: React Router v7

### Backend Stack
- **Framework**: Python 3.11+ / FastAPI / Uvicorn
- **AI Engine**: Google Gemini API (`google-genai`), NumPy cosine similarity
- **Database & Storage**: Firebase Admin SDK (`firebase-admin`), Firestore, Google Cloud Storage
- **Parsers**: PyPDF2, python-docx

---

## 📁 Project Structure

```
LegalLense-AI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/         # FastAPI endpoint routers (cases, docs, analysis, chat)
│   │   ├── core/               # App configuration, Firebase initialization, auth middleware
│   │   ├── models/             # Pydantic data schemas
│   │   └── services/           # AI service, document processing, RAG retrieval, conflict detection
│   ├── Dockerfile
│   ├── requirements.txt        # Python backend dependencies
│   └── serviceAccountKey.json  # Firebase service account credentials (git-ignored)
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Modular UI components (DocumentViewer, Case tabs, Navbar, Sidebar)
│   │   ├── contexts/           # Auth & application state providers
│   │   ├── lib/                # API client & Firebase config
│   │   ├── pages/              # Main route views (Dashboard, CaseDetail, CreateCase, Settings)
│   │   └── services/           # Frontend API services
│   ├── package.json            # Node.js dependencies
│   └── vite.config.ts          # Vite build configuration
│
├── firebase.json               # Firebase deployment configuration
├── firestore.rules             # Firestore security rules
└── README.md                   # Complete system documentation
```

---

## 🚦 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.11 or higher
- **Firebase Account**: Firebase project with Firestore and Storage enabled
- **Gemini API Key**: (Optional for live mode; fallback mock mode supported)

---

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file in the `backend/` root directory:
   ```env
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

   GEMINI_API_KEY=your-gemini-api-key
   AI_SERVICE_MODE=live   # Set to 'mock' for local testing without Gemini API key

   CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]
   ```

5. **Start the FastAPI server**:
   ```bash
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   - REST API running at: `http://127.0.0.1:8000`
   - Interactive Swagger API Docs: `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file in the `frontend/` root directory:
   ```env
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   - Frontend application running at: `http://localhost:5173`

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health check |
| `GET` / `POST` | `/api/cases` | List user cases / Create new legal case |
| `GET` / `DELETE`| `/api/cases/{id}` | Retrieve or delete specific case |
| `POST` | `/api/cases/{id}/documents` | Upload PDF/DOCX file & parse chunks |
| `GET` | `/api/documents/{id}/download-url` | Generate signed GCS URL for document viewing |
| `POST` | `/api/cases/{id}/analyze` | Trigger full AI analysis pipeline |
| `GET` | `/api/cases/{id}/analysis/status` | Poll active analysis job progress |
| `GET` | `/api/cases/{id}/evidence` | List extracted legal evidence & clauses |
| `GET` | `/api/cases/{id}/conflicts` | List cross-document contradictions |
| `POST` | `/api/cases/{id}/chat` | Ask Q&A question grounded via RAG vector search |

---

## 🔐 Security & Data Privacy

- **Firebase ID Token Validation**: All API routes verify incoming standard `Authorization: Bearer <id_token>` headers.
- **Signed GCS Downloads**: Original contract documents are stored securely in Cloud Storage and served via short-lived signed URLs.
- **User Ownership Scoping**: Firestore collections enforce ownership checks preventing cross-tenant data access.

---

## 📄 License

Copyright © 2026 LegalLens AI. All rights reserved.
