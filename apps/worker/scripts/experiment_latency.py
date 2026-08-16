"""
Experiment #1: RAG retrieval latency vs synchronous Gemini evaluation latency.
Demonstrates the value of decoupling the worker from the main API.
"""
import pickle, time, statistics, urllib.request, urllib.error, json, os
from pathlib import Path
from dotenv import load_dotenv
import numpy as np

SCRIPT_DIR = Path(__file__).resolve().parent
PKL_PATH = SCRIPT_DIR / "chunks_and_embeddings.pkl"

# Load Gemini API key from apps/api/.env
load_dotenv(SCRIPT_DIR.parent.parent.parent / "apps" / "api" / ".env")
load_dotenv(SCRIPT_DIR.parent.parent / "api" / ".env")  # fallback relative path
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise EnvironmentError("GEMINI_API_KEY not found. Ensure apps/api/.env exists with GEMINI_API_KEY set.")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"

QUERIES = [
    "AI impact on software engineering jobs",
    "are AI generated images considered art",
    "what makes a sandwich a sandwich",
    "how many holes does a polo shirt have",
    "effects of sleep deprivation on humans",
]

# Sample short transcript for Gemini timing
SAMPLE_TRANSCRIPT = """phase1 - Alice: AI will not replace software engineers because creativity and problem-solving are uniquely human. Tools like Copilot assist but do not replace judgment.
phase2 - Bob: According to McKinsey, up to 30% of work tasks could be automated by 2030. Engineers who don't adapt will be left behind.
phase4 - Alice: Automation raises productivity but historically creates more jobs than it eliminates. The WEF report shows net job creation in tech.
phase5 - Bob: The speed of this AI wave is different. GPT-4 passed bar exams and writes production code. The transition will not be gradual."""

def cosine_sim(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9))

print("Loading embeddings from pkl...")
with open(PKL_PATH, "rb") as f:
    data = pickle.load(f)
chunks = [d[0] for d in data]
embeddings = np.array([d[1] for d in data])
print(f"Loaded {len(chunks)} chunks.\n")

# ── Experiment 1a: RAG retrieval latency ────────────────────────────────────
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("all-MiniLM-L6-v2")

rag_times = []
for query in QUERIES:
    start = time.perf_counter()
    q_emb = model.encode(query)
    sims = [cosine_sim(q_emb, e) for e in embeddings]
    top5 = sorted(range(len(sims)), key=lambda i: sims[i], reverse=True)[:5]
    elapsed_ms = (time.perf_counter() - start) * 1000
    rag_times.append(elapsed_ms)
    print(f"RAG [{query[:40]}]: {elapsed_ms:.1f}ms  top-chunk: \"{chunks[top5[0]]['text'][:60]}...\"")

print(f"\nRAG latency — mean: {statistics.mean(rag_times):.1f}ms | min: {min(rag_times):.1f}ms | max: {max(rag_times):.1f}ms\n")

# ── Experiment 1b: Synchronous Gemini evaluation latency ────────────────────
print("Timing Gemini evaluation (3 runs)...")
gemini_times = []
payload = {
    "contents": [{
        "parts": [{"text": f"Score this debate in one sentence only: {SAMPLE_TRANSCRIPT}"}]
    }]
}
body = json.dumps(payload).encode("utf-8")
headers = {"Content-Type": "application/json"}

for i in range(3):
    start = time.perf_counter()
    try:
        req = urllib.request.Request(GEMINI_URL, data=body, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=60) as resp:
            resp.read()
        elapsed_s = time.perf_counter() - start
        gemini_times.append(elapsed_s)
        print(f"  Run {i+1}: {elapsed_s:.2f}s")
    except Exception as e:
        print(f"  Run {i+1}: ERROR - {e}")

if gemini_times:
    mean_gemini = statistics.mean(gemini_times)
    mean_rag_s = statistics.mean(rag_times) / 1000
    ratio = mean_gemini / mean_rag_s
    print(f"\nGemini eval — mean: {mean_gemini:.2f}s")
    print(f"\n{'='*60}")
    print(f"RAG retrieval is {ratio:.0f}x faster than synchronous Gemini eval")
    print(f"Decoupling the worker keeps the main API response ~{mean_gemini:.1f}s faster per request")
    print(f"{'='*60}")
