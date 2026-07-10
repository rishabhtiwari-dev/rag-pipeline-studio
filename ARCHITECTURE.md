# Architecture Decision Record — RAG Pipeline Studio

## Tech Stack Overview

| Layer | Choice | Alternatives Considered |
|-------|--------|------------------------|
| Frontend Framework | React 18 + TypeScript + Vite | Next.js, Svelte |
| Canvas / Flow | React Flow v11 | Xyflow, D3, vanilla drag-and-drop |
| Client State | Zustand v5 | Redux Toolkit, Jotai, React Context |
| Backend Framework | FastAPI | Flask, Django, Express |
| RAG Orchestration | LangChain | LlamaIndex, custom wrappers |
| Vector Store | ChromaDB | FAISS, Pinecone, Weaviate |
| Embeddings + LLM | Google Gemini (`text-embedding-004` + `gemini-1.5-flash`) | OpenAI, Cohere |
| Auth | JWT (python-jose) + bcrypt | OAuth2, session-based |
| ORM | SQLAlchemy 2.0 | Tortoise ORM, raw SQL |
| Database | SQLite (dev) | PostgreSQL (prod) |

---

## Why React Flow?

React Flow is purpose-built for node-edge graph UIs. The key advantage over vanilla drag-and-drop
(e.g. Interact.js) or D3 is that it ships with:
- Automatic handle snapping and edge routing
- Viewport pan/zoom with minimap
- A typed node registry (`nodeTypes`) that maps string identifiers to React components

This maps directly onto the RAG pipeline concept: each pipeline component (Loader, Splitter, etc.)
is a React Flow node type. Adding a new component type means registering one more entry in
`nodeTypes` and writing one more node component — no core graph logic changes.

---

## Why Zustand for Canvas State?

The canvas state is the most performance-sensitive part of the app. React Flow calls
`onNodesChange` on every drag pixel — if this triggered a full Redux reducer cycle with selector
re-computation across the entire component tree, the canvas would jank.

Zustand solves this with **atomic subscriptions**: each component calls `usePipelineStore(s => s.X)`
and only re-renders when `X` changes. The `ConfigPanel` subscribes to `selectedNodeId` and the
relevant node's `data`; `PipelineCanvas` subscribes to `nodes` and `edges`. They never invalidate
each other.

Redux Toolkit would achieve the same with `createSelector` memoization, but at 3× the boilerplate
and with no meaningful correctness gain for this use case.

---

## Why FastAPI?

1. **Async I/O** — file uploads and Chroma inserts are I/O-bound. `async def` endpoints avoid
   blocking the event loop while LangChain processes documents.
2. **Pydantic v2 models** — request/response schemas are the single source of truth; FastAPI
   generates OpenAPI docs automatically (available at `/docs`).
3. **Dependency injection** — `get_db` and `get_current_user` are reusable FastAPI dependencies
   injected via `Depends()`, keeping routes thin and testable.

Flask was rejected because it requires manual schema validation (marshmallow/Pydantic manually
wired) and has no native async support without extensions.

---

## Why LangChain (not custom wrappers)?

LangChain provides three things this project needed immediately:

1. **Document loaders** — `PyPDFLoader`, `TextLoader`, `UnstructuredMarkdownLoader` handle
   format-specific parsing that would otherwise require ~500 lines of boilerplate.
2. **Text splitters** — `RecursiveCharacterTextSplitter` uses a hierarchy of separators
   (`\n\n`, `\n`, ` `) to preserve semantic coherence across chunk boundaries. This is
   non-trivial to replicate correctly.
3. **`RetrievalQA` chain** — standardises the retrieve-then-synthesize loop. Swapping the
   retriever (e.g. from Chroma to Pinecone) or the LLM requires changing one line.

The risk of LangChain coupling is mitigated by the `BaseLLMProvider` abstraction (see below).

---

## Extensible LLM Pattern

All LLM providers implement `BaseLLMProvider` (in `app/rag/llms/base.py`):

```python
class BaseLLMProvider(ABC):
    def get_langchain_llm(self) -> Any: ...
    def provider_name(self) -> str: ...
    def is_mock(self) -> bool: ...
```

The `get_llm_provider()` factory function maps a string identifier (`"gemini"`, `"openai"`,
`"claude"`) to the appropriate concrete subclass. The `pipeline_executor.py` module **never
imports a concrete LLM class** — it only calls the factory and then calls `.get_langchain_llm()`.

**Adding OpenAI for real** requires:
1. Install `langchain-openai`
2. Implement `OpenAIProvider(BaseLLMProvider)` (swap mock `_MockChatModel` for `ChatOpenAI`)
3. Store the OpenAI key in `users.openai_api_key_encrypted`
4. That's it — no changes to `pipeline_executor.py`, no changes to routes

The same pattern applies to Anthropic Claude, Cohere, or any other provider.

---

## RAG Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  INGESTION (POST /pipeline/build)                           │
│                                                             │
│  UploadedDocument records → file paths                      │
│       ↓                                                     │
│  loaders.load_documents()   ← loader_type from canvas      │
│       ↓                                                     │
│  splitters.split_documents() ← chunk_size, overlap         │
│       ↓                                                     │
│  vector_stores.build_vector_store()                         │
│       │  Gemini text-embedding-004 → ChromaDB persist       │
│       └─ collection_name stored in PipelineConfig.db row    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  QUERYING (POST /chat/query)                                │
│                                                             │
│  user question                                              │
│       ↓                                                     │
│  vector_stores.load_vector_store()  ← same collection      │
│       ↓                                                     │
│  retriever.get_relevant_documents(question, k=4)            │
│       ↓                                                     │
│  LangChain RetrievalQA (stuff chain)                        │
│       │  context = concatenated chunks                      │
│       │  prompt = RAG_PROMPT template                       │
│       └─ ChatGoogleGenerativeAI.generate()                  │
│              ↓                                              │
│  { answer, source_documents }  →  ChatResponse             │
└─────────────────────────────────────────────────────────────┘
```

---

## State Management Details

The most complex UI state lives in `pipelineStore.ts`. Key decisions:

- **`onNodesChange` / `onEdgesChange`** delegate to React Flow's `applyNodeChanges` /
  `applyEdgeChanges` utilities, which handle position diffs, deletions, and selection state
  in a single atomic update.
- **`updateNodeData`** is a pure setter that maps over `nodes` by `id` — O(n) but n is small
  (≤20 nodes is realistic), so no normalisation needed.
- **`selectedNodeId`** is a scalar string, not a node copy. `ConfigPanel` derives the full
  node object from `selectedNodeId + nodes` array. This means the panel always reads
  live data — no synchronisation bug.
- **`isBuilt`** gates chat input at the UI level, preventing queries before the vector store
  is populated.

---

## Security Notes

- Passwords hashed with bcrypt (cost factor 12).
- Gemini API keys encrypted with Fernet (AES-128-CBC + HMAC-SHA256) before DB storage.
- JWT tokens expire after 7 days. Refresh-token flow is the obvious next step.
- CORS is locked to `localhost:5173` for local dev; production should set specific origins.
- File uploads are validated by extension and stored with UUID filenames (no path traversal).

---

## Production Hardening (out of scope for this assignment)

| Gap | Fix |
|-----|-----|
| SQLite | Swap `DATABASE_URL` to Postgres; run `alembic` migrations |
| Fernet key in `.env` | Inject from secrets manager (Vault, AWS SSM) |
| Single-worker server | Add Gunicorn worker pool + Redis job queue for build tasks |
| No rate limiting | FastAPI middleware (slowapi) on auth + chat endpoints |
| In-process Chroma | Deploy Chroma as a standalone service |
