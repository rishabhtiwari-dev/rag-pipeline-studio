# RAG Pipeline Studio

A visual drag-and-drop RAG (Retrieval-Augmented Generation) pipeline builder powered by Google Gemini.

## Prerequisites

- Python 3.10+
- Node.js 18+
- A **Google Gemini API key** — get one free at [aistudio.google.com](https://aistudio.google.com)

---

## Quick Start

### 1. Clone & enter the project

```bash
git clone <your-repo-url>
cd "Undef Proj"
```

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be live at **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

### 3. Frontend setup

```bash
# In a new terminal, from the project root
cd frontend

npm install
npm run dev
```

The app will be live at **http://localhost:5173**

---

## Usage Flow

1. **Sign up** — create an account and paste your Gemini API key (stored AES-256 encrypted).
2. **Upload Docs** — click "1. Upload Docs" and drag in PDF, TXT, or MD files.
3. **Build Pipeline** — go to "2. Build Pipeline". Configure each node (click to open Config Panel on the right), then click **Build Pipeline**.
4. **Chat** — switch to "3. Chat" and ask questions about your documents.

---

## Project Structure

```
Undef Proj/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── requirements.txt
│   └── app/
│       ├── api/                   # Route handlers
│       ├── core/                  # Config, security, DB session
│       ├── models/                # SQLAlchemy ORM models
│       ├── schemas/               # Pydantic request/response models
│       └── rag/
│           ├── loaders.py         # Document loaders
│           ├── splitters.py       # Text splitters
│           ├── vector_stores.py   # ChromaDB integration
│           ├── pipeline_executor.py  # Orchestration
│           └── llms/
│               ├── base.py        # Abstract provider + factory
│               ├── gemini.py      # Live Gemini integration
│               ├── openai_mock.py # Mock UI provider
│               └── claude_mock.py # Mock UI provider
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── auth/              # Login, Signup, API key modal
│       │   ├── canvas/            # React Flow canvas + custom nodes
│       │   ├── documents/         # Upload UI
│       │   └── chat/              # Chat interface
│       ├── store/                 # Zustand state slices
│       ├── types/                 # TypeScript interfaces
│       └── hooks/useApi.ts        # Axios instance with JWT interceptor
├── ARCHITECTURE.md                # Tech stack justifications
└── README.md
```

---

## Adding a New LLM Provider

1. Create `backend/app/rag/llms/myprovider.py` extending `BaseLLMProvider`
2. Implement `get_langchain_llm()` returning a LangChain chat model
3. Register it in the `registry` dict in `base.py`
4. Add UI option in `frontend/src/components/canvas/nodes/LLMNode.tsx`

No other files need to change.
