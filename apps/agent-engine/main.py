from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Any, Dict
import os
import logging

from agent.engine import AgentEngine
from agent.models import ExecuteRequest, IngestRequest

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Agent Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = AgentEngine()


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


@app.post("/execute")
async def execute(request: ExecuteRequest):
    try:
        logger.info(f"Executing agent {request.agent.id} for execution {request.execution_id}")
        result = await engine.execute(request)
        return result
    except Exception as e:
        logger.error(f"Execution failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ingest")
async def ingest(request: IngestRequest):
    try:
        logger.info(f"Ingesting document {request.document_id}")
        result = await engine.ingest_document(request)
        return result
    except Exception as e:
        logger.error(f"Ingestion failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search")
async def search(knowledge_base_id: str, query: str, top_k: int = 5):
    try:
        results = await engine.search_knowledge(knowledge_base_id, query, top_k)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
