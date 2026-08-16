import pickle, os
from pathlib import Path
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from tqdm import tqdm

SCRIPT_DIR = Path(__file__).resolve().parent
load_dotenv(SCRIPT_DIR.parent / ".env")

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX", "did-i-cook")
VECTOR_DIM = 384  # all-MiniLM-L6-v2

if not PINECONE_API_KEY:
    raise EnvironmentError("PINECONE_API_KEY not set in apps/worker/.env")

pc = Pinecone(api_key=PINECONE_API_KEY)

# Create index if it doesn't exist
existing = [i.name for i in pc.list_indexes()]
if PINECONE_INDEX not in existing:
    print(f"Creating Pinecone index '{PINECONE_INDEX}'...")
    pc.create_index(
        name=PINECONE_INDEX,
        dimension=VECTOR_DIM,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )
else:
    print(f"Index '{PINECONE_INDEX}' already exists.")

index = pc.Index(PINECONE_INDEX)

pkl_path = SCRIPT_DIR / "chunks_and_embeddings.pkl"
with open(pkl_path, "rb") as f:
    data = pickle.load(f)

print(f"Upserting {len(data)} chunks into Pinecone...")
BATCH_SIZE = 100
batch = []
for i, (chunk, emb) in enumerate(tqdm(data)):
    batch.append({
        "id": str(i),
        "values": emb.tolist(),
        "metadata": {"text": chunk["text"], "source": chunk["source"]}
    })
    if len(batch) == BATCH_SIZE:
        index.upsert(vectors=batch)
        batch = []
if batch:
    index.upsert(vectors=batch)

print(f"Done! {len(data)} chunks indexed in Pinecone index '{PINECONE_INDEX}'.")