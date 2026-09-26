# LegalLens

> AI-powered legal document analysis that transforms complex documents into clear, evidence-backed briefs and actionable insights.

*(Disclaimer: LegalLens is designed for preparation and analysis purposes only. It is not a substitute for a qualified legal professional and does not provide legally binding advice.)*

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [Application Workflow](#application-workflow)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Structure](#project-structure)
- [Quick Start Guide](#quick-start-guide)
- [Security & Data Privacy](#security--data-privacy)
- [License](#license)

---

## Overview

LegalLens is a modern AI legal assistant designed to parse, analyze, and cross-reference complex legal documents. Built for users needing to prepare for legal consultations or internal review, the platform automatically identifies contract clauses, detects cross-document contradictions, builds chronological timelines, and generates a structured, evidence-backed brief from uploaded files.

---

## Problem Statement

Legal documents and workplace contracts are often dense, making it difficult to understand obligations, key dates, or hidden liabilities. Important clauses can be buried in complex language, and manually reviewing multiple documents for contradictions can be exceptionally time-consuming. Users without legal training may struggle to identify critical information, leaving them unprepared for formal legal consultations or negotiations.

---

## Solution

LegalLens provides a structured, automated approach to document review:

1. User authenticates securely via Firebase.
2. User creates a dedicated case workspace tailored to their situation.
3. User uploads relevant documents (PDF/DOCX) to the secure storage.
4. The backend automatically parses and chunks the text, generating vector embeddings.
5. Google Gemini AI analyzes the combined text to extract timelines, obligations, and detect cross-document conflicts.
6. A comprehensive, easy-to-read brief is generated, directly citing source pages.
7. Users can interact with the grounded AI chat for further questions and follow-up analysis.

---

## Key Features

- **User Authentication:** Secure login and session management powered by Firebase.
- **Case/Workspace Management:** Isolated workspaces to track individual legal scenarios.
- **Document Upload & File Validation:** Secure document ingestion with format (.pdf, .docx) and size validation (up to 50MB).
- **Document Processing:** Backend automated extraction and chunking of complex documents.
- **AI-Powered Analysis:** Extraction of key facts, obligations, and timelines using Google Gemini.
- **Conflict Detection:** Automated cross-document analysis that flags contradictions (e.g., mismatched notice periods).
- **Brief Generation:** Automated compilation of an evidence-backed preparation brief.
- **Vector Search RAG:** Semantic similarity search grounded with exact source citations for interactive Q&A.
- **Native Document Viewer:** Slide-over preview panel to read documents and verify citations natively.
- **Error Handling:** Graceful API and AI error handling with clear, user-friendly UI feedback.
- **Responsive Interface:** Modern, mobile-friendly UI built with TailwindCSS.
- **Accessibility Support:** Semantic HTML, ARIA integrations, and keyboard-accessible Radix components.

---

## Application Workflow

```mermaid
flowchart TD
    A[User Login] --> B[Dashboard]
    B --> C[Create or Open Case Workspace]
    C --> D[Upload Document]
    D --> E[Document Parsing & Embedding]
    E --> F[AI Context & Conflict Analysis]
    F --> G[Generate Evidence-Backed Brief]
    G --> H[Review Results & Verified Citations]
    H --> I[Interactive AI Q&A Chat]
```

---

## Architecture & Tech Stack

```mermaid
flowchart LR
    A[React 19 UI] <-->|REST API| B[FastAPI Backend]
    B <--> C[Firebase Auth & Storage]
    B <--> D[Firestore Database]
    B <--> E[Google Gemini AI]
```

### Frontend Stack
- **Framework**: React 19 + Vite + TypeScript
- **Styling**: TailwindCSS, Radix UI primitives, Lucide Icons, Material Symbols
- **Authentication**: Firebase Web SDK
- **Routing**: React Router v7
- **Testing**: Vitest & React Testing Library

### Backend Stack
- **Framework**: Python 3.11+ / FastAPI / Uvicorn
- **AI Engine**: Google Gemini API (`google-genai`), NumPy cosine similarity for RAG
- **Database & Storage**: Firebase Admin SDK, Firestore, Google Cloud Storage
- **Parsers**: PyMuPDF, python-docx
- **Testing**: Pytest & httpx

---

## Project Structure

```text
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
│   │   ├── components/         # Modular UI components (DocumentViewer, Case tabs, Navbar)
│   │   ├── contexts/           # Auth & application state providers
│   │   ├── lib/                # Shared utilities & file validation
│   │   ├── pages/              # Main route views (Dashboard, CaseWorkspace, CreateCase)
│   │   └── services/           # Frontend API services
│   ├── package.json            # Node.js dependencies
│   └── vite.config.ts          # Vite build configuration
│
├── firebase.json               # Firebase deployment configuration
├── firestore.rules             # Firestore security rules
└── README.md                   # Complete system documentation
```

---

## Quick Start Guide

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

## Security & Data Privacy

- **Firebase ID Token Validation**: All API routes verify incoming standard `Authorization: Bearer <id_token>` headers via the Firebase Admin SDK.
- **Signed GCS Downloads**: Original contract documents are stored securely in Cloud Storage and served via short-lived signed URLs directly to the authenticated user.
- **User Ownership Scoping**: Firestore collections enforce ownership checks, preventing cross-tenant data access.
- **Consent Gates**: Users must agree to explicit data storage and AI processing consent before initiating case analysis.

---

## License

Copyright © 2026 LegalLens. All rights reserved.
