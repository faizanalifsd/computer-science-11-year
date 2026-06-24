import logging
import os
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag import answer_question

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
)
logger = logging.getLogger(__name__)

# Validate critical env vars at startup — constitution rule: halt on missing key
for _var in ["GROQ_API_KEY", "JINA_API_KEY", "QDRANT_URL", "QDRANT_API_KEY"]:
    if not os.getenv(_var):
        raise EnvironmentError(f"STARTUP ERROR: required env var '{_var}' is not set. Halting.")

app = FastAPI(title="CS11 Book API — Robo", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to GitHub Pages domain before production deploy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str
    selected_text: str = ""


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    sections: list[dict] = []


@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    q = request.question.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    logger.info(f"Q: {q[:120]}")

    try:
        result = await answer_question(q, request.selected_text)
    except RuntimeError as e:
        logger.error(f"LLM failure: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="AI service temporarily unavailable. Please try again.")
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info(f"Answer delivered. Sources: {result['sources']}")
    return ChatResponse(answer=result["answer"], sources=result["sources"], sections=result.get("sections", []))
