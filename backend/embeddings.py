import os
import requests
from dotenv import load_dotenv

load_dotenv()

JINA_API_URL = "https://api.jina.ai/v1/embeddings"
JINA_MODEL = "jina-embeddings-v2-base-en"
VECTOR_DIM = 768


def embed_text(text: str) -> list[float]:
    api_key = os.getenv("JINA_API_KEY")
    if not api_key:
        raise EnvironmentError("JINA_API_KEY not set")

    response = requests.post(
        JINA_API_URL,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={"model": JINA_MODEL, "input": [text]},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["data"][0]["embedding"]


def embed_batch(texts: list[str]) -> list[list[float]]:
    api_key = os.getenv("JINA_API_KEY")
    if not api_key:
        raise EnvironmentError("JINA_API_KEY not set")

    response = requests.post(
        JINA_API_URL,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={"model": JINA_MODEL, "input": texts},
        timeout=60,
    )
    response.raise_for_status()
    data = sorted(response.json()["data"], key=lambda x: x["index"])
    return [item["embedding"] for item in data]
