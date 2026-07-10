import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decrypt_api_key
from app.api.auth import get_current_user
from app.models.user import User
from app.models.pipeline import PipelineConfig, UploadedDocument
from app.schemas.pipeline import SavePipelineRequest, BuildPipelineRequest, PipelineResponse
from app.rag.pipeline_executor import build_pipeline

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


def _require_api_key(user: User) -> str:
    if not user.gemini_api_key_encrypted:
        raise HTTPException(status_code=400, detail="Gemini API key not configured")
    return decrypt_api_key(user.gemini_api_key_encrypted)


@router.post("/save", response_model=PipelineResponse)
def save_pipeline(
    body: SavePipelineRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    config = db.query(PipelineConfig).filter(PipelineConfig.user_id == current_user.id).first()
    if not config:
        config = PipelineConfig(user_id=current_user.id)
        db.add(config)

    config.name = body.name or "My Pipeline"
    config.nodes_json = json.dumps([n.model_dump() for n in body.nodes])
    config.edges_json = json.dumps([e.model_dump() for e in body.edges])
    config.is_built = False

    db.commit()
    db.refresh(config)
    return PipelineResponse.model_validate(config)


@router.post("/build")
def build(
    body: BuildPipelineRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    api_key = _require_api_key(current_user)

    docs = db.query(UploadedDocument).filter(UploadedDocument.user_id == current_user.id).all()
    if not docs:
        raise HTTPException(status_code=400, detail="Upload at least one document first")

    file_paths = [d.stored_path for d in docs]
    collection_name = f"user_{current_user.id}_{uuid.uuid4().hex[:8]}"

    nodes = [n.model_dump() for n in body.nodes]

    build_pipeline(nodes, file_paths, api_key, collection_name)

    config = db.query(PipelineConfig).filter(PipelineConfig.user_id == current_user.id).first()
    if not config:
        config = PipelineConfig(user_id=current_user.id)
        db.add(config)

    config.nodes_json = json.dumps(nodes)
    config.edges_json = json.dumps([e.model_dump() for e in body.edges])
    config.is_built = True
    config.collection_name = collection_name
    db.commit()

    return {"message": "Pipeline built successfully", "collection_name": collection_name}


@router.get("/", response_model=PipelineResponse)
def get_pipeline(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    config = db.query(PipelineConfig).filter(PipelineConfig.user_id == current_user.id).first()
    if not config:
        raise HTTPException(status_code=404, detail="No pipeline saved yet")
    return PipelineResponse.model_validate(config)
