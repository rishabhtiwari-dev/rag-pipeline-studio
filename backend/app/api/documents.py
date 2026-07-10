import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.pipeline import UploadedDocument
from app.schemas.pipeline import DocumentResponse

router = APIRouter(prefix="/documents", tags=["documents"])

ALLOWED_TYPES = {".pdf", ".txt", ".md"}


@router.post("/upload", response_model=list[DocumentResponse])
async def upload_documents(
    files: list[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_dir = Path(settings.UPLOAD_DIR) / str(current_user.id)
    user_dir.mkdir(parents=True, exist_ok=True)

    saved: list[DocumentResponse] = []
    for file in files:
        ext = Path(file.filename or "").suffix.lower()
        if ext not in ALLOWED_TYPES:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

        unique_name = f"{uuid.uuid4().hex}{ext}"
        dest = user_dir / unique_name

        content = await file.read()
        dest.write_bytes(content)

        doc = UploadedDocument(
            user_id=current_user.id,
            filename=file.filename or unique_name,
            stored_path=str(dest),
            file_type=ext.lstrip("."),
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        saved.append(DocumentResponse.model_validate(doc))

    return saved


@router.get("/", response_model=list[DocumentResponse])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    docs = db.query(UploadedDocument).filter(UploadedDocument.user_id == current_user.id).all()
    return [DocumentResponse.model_validate(d) for d in docs]


@router.delete("/{doc_id}")
def delete_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(UploadedDocument).filter(
        UploadedDocument.id == doc_id,
        UploadedDocument.user_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        os.remove(doc.stored_path)
    except FileNotFoundError:
        pass

    db.delete(doc)
    db.commit()
    return {"message": "Deleted"}
