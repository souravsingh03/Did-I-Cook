import os
from pathlib import Path
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

SCRIPT_DIR = Path(__file__).resolve().parent
DOCS_DIR = SCRIPT_DIR.parent / "docs"
# Load environment variables from apps/worker/.env if present
env_path = SCRIPT_DIR.parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
CHUNK_SIZE = 300

if not DOCS_DIR.exists():
    raise FileNotFoundError(f"Docs directory not found: {DOCS_DIR}\nPlease ensure the 'docs' folder exists under apps/worker/docs or run the script from the project repository.")

model = SentenceTransformer("all-MiniLM-L6-v2")

chunks = []
for frame in os.listdir(DOCS_DIR):
    path = DOCS_DIR / frame
    with open(path, encoding='utf-8') as f:
        words = f.read().split()
        for i in range(0, len(words), CHUNK_SIZE):
            chunk = " ".join(words[i:i+CHUNK_SIZE])
            if chunk.strip():
                chunks.append({"text": chunk, "source": frame})

print(f"Total chunks: {len(chunks)}")

texts = [c["text"] for c in chunks]
embeddings = model.encode(texts, show_progress_bar=True)

import pickle
with open("chunks_and_embeddings.pkl", "wb") as f:
    pickle.dump(list(zip(chunks, embeddings)), f)

