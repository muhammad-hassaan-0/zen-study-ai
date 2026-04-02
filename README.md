# Zen Minimal Workspace

A minimalist, AI-powered workspace designed to transform study snapshots into actionable learning materials.

Zen Minimal Workspace follows a focused product philosophy: deep-work first, dark-mode aesthetics, and a zero-distraction interface that helps learners move from raw notes to active revision in minutes.

## Project Overview & Aesthetic

Zen Minimal Workspace turns image-based study content into structured outputs you can immediately use:
- extracted text for reference,
- concise bullet summaries for quick revision,
- and generated MCQs for retention testing.

The UX is intentionally calm and professional, with minimalist layout patterns, clear hierarchy, and restrained motion to support long study sessions without visual fatigue. 🌑

## Key Features

- Intelligent OCR: Clean text extraction from study snapshots.
- AI Summarization: Concise bullet points for fast revision.
- Smart MCQ Generator: On-demand question generation with answer keys.
- Modern UI: Typography-led dark interface with responsive behavior and subtle interactions. ✨

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 14+, Tailwind CSS, Framer Motion, Lucide React |
| Backend | FastAPI (Python), Uvicorn |
| AI and ML | LLM integration for OCR and text processing (Google Gemini) |
| DevOps and Deployment | Vercel (Frontend), Render (Backend), Git and GitHub |

## Project Architecture

The application uses a decoupled architecture for performance and maintainability:

- Frontend: A responsive Next.js App Router interface that handles uploads, renders AI outputs, and drives interactions.
- Backend: A high-performance FastAPI service responsible for file handling, LLM requests, and structured JSON responses.

This separation keeps the UI fast, the API scalable, and deployment workflows straightforward. 🧩

## Setup Instructions

### 1) Clone the repository

```bash
git clone https://github.com/your-username/zen-minimal-workspace.git
cd zen-minimal-workspace
```

### 2) Backend setup (FastAPI)

```bash
cd backend
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies and run backend:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Create a backend .env file and set your API key:

```env
GOOGLE_API_KEY=your_key_here
ALLOWED_ORIGINS=http://localhost:3000
```

### 3) Frontend setup (Next.js)

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000 and connects to the backend at http://localhost:8000 by default.

## Version Control and Workflow

- Git and GitHub are used for source control and collaboration.
- Recommended workflow: feature branches, pull requests, and small iterative releases.

## Deployment Notes

- Frontend can be deployed on Vercel.
- Backend can be deployed on Render.
- Configure environment variables in each platform before production release.

---

Built for focused learners who value clarity, speed, and elegant tooling. 🚀
