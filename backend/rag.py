import os
import logging
import requests
from dotenv import load_dotenv
from embeddings import embed_text
from qdrant_client import QdrantClient

load_dotenv()
logger = logging.getLogger(__name__)

COLLECTION = "cs11_book"
MIN_SCORE = 0.6
TOP_K = 3

SYSTEM_PROMPT = """You are Robo, a friendly teaching assistant for a Class 11 Computer Science textbook.

Rules:
- Answer ONLY based on the book context provided below. Do not use any outside knowledge.
- Always start your answer with "Based on [chapter/section name]..."
- If context is empty or irrelevant, say exactly: "I couldn't find that in the book. Try rephrasing, or check the relevant chapter directly."
- Keep answers under 300 words.
- Use simple, clear language suitable for 11th class students (age ~16).
- End every response with: "Want me to explain [suggest a related concept from your answer]?"
- Never guess or hallucinate facts."""

_qdrant = None


def _get_qdrant() -> QdrantClient:
    global _qdrant
    if _qdrant is None:
        url = os.getenv("QDRANT_URL")
        api_key = os.getenv("QDRANT_API_KEY")
        if not url or not api_key:
            raise EnvironmentError("QDRANT_URL and QDRANT_API_KEY must be set")
        _qdrant = QdrantClient(url=url, api_key=api_key)
    return _qdrant


def _search(query_vector: list[float]) -> list:
    result = _get_qdrant().query_points(
        collection_name=COLLECTION,
        query=query_vector,
        limit=TOP_K,
        with_payload=True,
    )
    return result.points


def _call_groq(messages: list[dict]) -> str:
    from groq import Groq
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=512,
        temperature=0.2,
    )
    return resp.choices[0].message.content


def _call_openrouter(messages: list[dict]) -> str:
    resp = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
            "Content-Type": "application/json",
        },
        json={
            "model": "deepseek/deepseek-r1-distill-llama-70b",
            "messages": messages,
            "max_tokens": 512,
            "temperature": 0.2,
        },
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def _call_llm(messages: list[dict]) -> str:
    """Groq first, OpenRouter fallback — per constitution rule #3."""
    try:
        return _call_groq(messages)
    except Exception as e:
        logger.warning(f"Groq failed ({e}), switching to OpenRouter...")
        try:
            return _call_openrouter(messages)
        except Exception as e2:
            logger.error(f"OpenRouter also failed: {e2}")
            raise RuntimeError("Both LLM providers failed") from e2


async def answer_question(question: str, selected_text: str = "") -> dict:
    query = f"{selected_text}\n\nQuestion: {question}" if selected_text.strip() else question

    query_vector = embed_text(query)
    results = _search(query_vector)

    good = [r for r in results if r.score >= MIN_SCORE]

    if not good:
        return {
            "answer": "I couldn't find that in the book. Try rephrasing, or check the relevant chapter directly.",
            "sources": [],
            "sections": [],
        }

    context_parts, sources, sections = [], [], []
    seen_sections = set()
    for r in good:
        p = r.payload
        context_parts.append(f"[{p.get('source', '')}]\n{p.get('text', '')}")
        src = p.get("source", "")
        heading = p.get("heading", "")
        if src and src not in sources:
            sources.append(src)
        key = (src, heading)
        if key not in seen_sections:
            seen_sections.add(key)
            sections.append({"source": src, "heading": heading})

    context = "\n\n---\n\n".join(context_parts)

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Book context:\n\n{context}\n\n---\n\nStudent question: {question}"},
    ]

    answer = _call_llm(messages)
    return {"answer": answer, "sources": sources, "sections": sections}
