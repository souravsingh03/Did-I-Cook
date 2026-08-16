from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from pathlib import Path
from dotenv import load_dotenv
from pinecone import Pinecone
import os

app = FastAPI()

SCRIPT_DIR = Path(__file__).resolve().parent
env_path = SCRIPT_DIR.parent / '.env'
if env_path.exists():
    load_dotenv(env_path)

model = SentenceTransformer('all-MiniLM-L6-v2')

PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_INDEX = os.getenv('PINECONE_INDEX', 'did-i-cook')

if not PINECONE_API_KEY:
    raise EnvironmentError('PINECONE_API_KEY not set')

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX)


class Query(BaseModel):
    query: str
    top_k: int = 5


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.post('/search')
def search(query: Query):
    embedding = model.encode(query.query).tolist()
    response = index.query(vector=embedding, top_k=query.top_k, include_metadata=True)
    results = [
        {
            'text': match['metadata'].get('text'),
            'source': match['metadata'].get('source'),
            'score': match['score']
        }
        for match in response['matches']
    ]
