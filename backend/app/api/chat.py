import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decrypt_api_key
from app.api.auth import get_current_user
from app.models.user import User
from app.models.pipeline import PipelineConfig
from app.schemas.chat import ChatRequest, ChatResponse, SourceDocument
from app.rag.pipeline_executor import query_pipeline

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/query", response_model=ChatResponse)
def query(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.gemini_api_key_encrypted:
        raise HTTPException(status_code=400, detail="Gemini API key not configured")

    api_key = decrypt_api_key(current_user.gemini_api_key_encrypted)

    config = db.query(PipelineConfig).filter(PipelineConfig.user_id == current_user.id).first()
    if not config or not config.is_built:
        raise HTTPException(status_code=400, detail="Pipeline not built yet. Build it first.")

    nodes = json.loads(config.nodes_json)
    collection_name = config.collection_name or f"user_{current_user.id}"

    result = query_pipeline(
        question=body.question,
        nodes=nodes,
        api_key=api_key,
        collection_name=collection_name,
    )

    sources = [SourceDocument(**s) for s in result.get("sources", [])]
    return ChatResponse(answer=result["answer"], sources=sources)
