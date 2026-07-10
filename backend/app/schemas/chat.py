from pydantic import BaseModel
from typing import Optional, Any


class ChatRequest(BaseModel):
    question: str
    pipeline_id: Optional[int] = None
    nodes: Optional[list[dict[str, Any]]] = None
    edges: Optional[list[dict[str, Any]]] = None


class SourceDocument(BaseModel):
    content: str
    metadata: dict


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceDocument] = []
