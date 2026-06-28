"""
Run this once to index all chapter .md files into Qdrant.
Usage: python indexer.py
"""
import os
import re
import glob
import uuid
import logging
from dotenv import load_dotenv
from embeddings import embed_batch, VECTOR_DIM
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

COLLECTION = "cs11_book"
DOCS_PATH = os.path.join(os.path.dirname(__file__), "../my-website/docs/**/*.md")
MIN_CHUNK_CHARS = 150
MAX_CHUNK_CHARS = 1200
EMBED_BATCH_SIZE = 20


def chunk_markdown(text: str, source: str) -> list[dict]:
    text = re.sub(r"^---\n.*?\n---\n", "", text, flags=re.DOTALL)
    parts = re.split(r"\n(#{2,4} .+)\n", text)

    chunks = []
    current_heading = source
    current_body = ""

    for part in parts:
        if re.match(r"#{2,4} ", part.strip()):
            body = current_body.strip()
            if len(body) >= MIN_CHUNK_CHARS:
                chunks.append({
                    "text": f"{current_heading}\n\n{body}"[:MAX_CHUNK_CHARS],
                    "heading": current_heading,
                    "source": source,
                })
            current_heading = part.strip()
            current_body = ""
        else:
            current_body += part

    body = current_body.strip()
    if len(body) >= MIN_CHUNK_CHARS:
        chunks.append({
            "text": f"{current_heading}\n\n{body}"[:MAX_CHUNK_CHARS],
            "heading": current_heading,
            "source": source,
        })

    return chunks


def setup_collection(client: QdrantClient):
    existing = [c.name for c in client.get_collections().collections]
    if COLLECTION not in existing:
        client.create_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(size=VECTOR_DIM, distance=Distance.COSINE),
        )
        logger.info(f"Collection '{COLLECTION}' created (dim={VECTOR_DIM})")
    else:
        logger.info(f"Collection '{COLLECTION}' already exists")


def main():
    for var in ["JINA_API_KEY", "QDRANT_URL", "QDRANT_API_KEY"]:
        if not os.getenv(var):
            raise EnvironmentError(f"Missing required env var: {var}")

    client = QdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"))
    setup_collection(client)

    md_files = sorted(glob.glob(DOCS_PATH, recursive=True))
    if not md_files:
        logger.error(f"No .md files found at: {DOCS_PATH}")
        return

    all_chunks = []
    for filepath in md_files:
        source = os.path.basename(filepath).replace(".md", "")
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        chunks = chunk_markdown(content, source)
        logger.info(f"  {source}: {len(chunks)} chunks")
        all_chunks.extend(chunks)

    if not all_chunks:
        logger.warning("No chunks generated. Check markdown files.")
        return

    logger.info(f"\nEmbedding {len(all_chunks)} chunks via Jina AI...")

    all_embeddings = []
    for i in range(0, len(all_chunks), EMBED_BATCH_SIZE):
        batch = all_chunks[i : i + EMBED_BATCH_SIZE]
        embeddings = embed_batch([c["text"] for c in batch])
        all_embeddings.extend(embeddings)
        logger.info(f"  Embedded {min(i + EMBED_BATCH_SIZE, len(all_chunks))}/{len(all_chunks)}")

    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=emb,
            payload={
                "text": chunk["text"],
                "heading": chunk["heading"],
                "source": chunk["source"],
            },
        )
        for chunk, emb in zip(all_chunks, all_embeddings)
    ]

    UPSERT_BATCH = 50
    for i in range(0, len(points), UPSERT_BATCH):
        batch = points[i : i + UPSERT_BATCH]
        client.upsert(collection_name=COLLECTION, points=batch)
        logger.info(f"  Upserted {min(i + UPSERT_BATCH, len(points))}/{len(points)}")
    logger.info(f"\nDone! Indexed {len(points)} chunks from {len(md_files)} file(s).")


if __name__ == "__main__":
    main()
