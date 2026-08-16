# Did-I-Cook? 

A real-time, AI-judged debate app where two players debate a topic on video and an AI (Gemini) scores them with evidence-backed reasoning using a RAG pipeline (Pinecone + sentence embeddings). The project includes a Next.js frontend, a Spring Boot backend (API + signaling), and a deployed FastAPI worker for semantic search. BIG THANKS to Kaelyn Cho for her amazing artwork she's provided for this project <:

---

## Table of contents
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Local development](#local-development)
- [RAG pipeline](#rag-pipeline)
- [Gemini & prompt notes](#gemini--prompt-notes)
- [UX & features](#ux--features)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Tech Stack

- Frontend: Next.js (App Router), React, Tailwind CSS, Framer Motion, react-confetti
- Backend: Spring Boot (Java 21), REST controllers, WebRTC signaling
- RAG worker: Python, FastAPI, HuggingFace SentenceTransformers (`all-MiniLM-L6-v2`), Pinecone vector DB
- LLM: Google Gemini 2.5 Flash (via REST) with strict JSON schema validation

---

## Local development

Prereqs: Node.js, Java 21 + Maven, Python 3.11+, Git

1. **Frontend** (`apps/web`)
   ```bash
   cd apps/web
   npm install
   npm run dev
   # Open http://localhost:3000
   ```

2. **Backend API** (`apps/api`)
   ```bash
   cd apps/api
   mvn spring-boot:run
   ```
   Set env vars (create `apps/api/.env` or export):
   ```env
   GEMINI_API_KEY=<your_key>
   WORKER_URL=http://localhost:8000   # or deployed worker URL
   ```

3. **Worker** (`apps/worker`) — optional for local, already deployed to Render
   ```bash
   cd apps/worker
   python -m venv .venv
   .venv\Scripts\activate      # Windows
   # source .venv/bin/activate # macOS/Linux
   pip install -r requirements.txt
   uvicorn scripts.semantic_search_api:app --reload --port 8000
   ```
   Set env vars in `apps/worker/.env`:
   ```env
   PINECONE_API_KEY=<your_key>
   PINECONE_INDEX=did-i-cook
   ```

---

## RAG pipeline

Evidence retrieval uses Pinecone as a managed vector database — no local infrastructure needed.

**How it works:**
1. Source documents in `apps/worker/docs/` (21 articles across 5 debate topics) are split into 300-word chunks
2. Each chunk is embedded into a 384-dim vector using `all-MiniLM-L6-v2`
3. Vectors are stored in Pinecone (one-time setup)
4. At debate end, the transcript is embedded and Pinecone returns the top-5 most semantically similar chunks
5. Those chunks are injected into the Gemini prompt to ground scoring in real evidence

**One-time index setup** (only needed if adding new documents or setting up from scratch):

```bash
cd apps/worker
pip install -r requirements.txt
# ensure PINECONE_API_KEY and PINECONE_INDEX are set in apps/worker/.env
python scripts/chunk_and_embed.py   # generates chunks_and_embeddings.pkl
python scripts/index_chunks.py      # uploads to Pinecone
```

## Gemini & prompt notes

- Gemini is invoked from `apps/api/src/main/java/com/didicook/api/service/GeminiService.java`.
- Important behaviors implemented:
  - Attempts fallback API keys (GEMINI_API_KEY, GEMINI_API_KEY2..GEMINI_API_KEY5).
  - Transcript builder maps numeric speakers to real `player1Name` / `player2Name` when provided.
  - Sends an explicit JSON schema instruction (no sample payload embedded in final prod prompt) to avoid sample bias.

Tips:
- If you see parsing errors in the backend response, the returned text may include extra content — we try to extract the first top-level JSON object.
- For debugging, add a temporary log of the final prompt before sending (avoid logging secrets in production).

---

## UX & features

- In-call judging: users remain on the call while AI scores (results appear as a themed overlay)
- Animated judging state: an "AI is judging..." modal with subtle animations (framer-motion)
- Results page: flippable `CookbookCard` style cards (front/back), lined-paper background aesthetic
- Confetti shows only for the viewer when they are the winner (visitor-specific)
- Tie handling displays "It's a tie!" with no confetti
- Dev conveniences: sample-mode used during development earlier; currently the app fetches live results by default

---
