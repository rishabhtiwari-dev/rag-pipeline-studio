from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime


class NodeData(BaseModel):
    id: str
    type: str
    position: dict[str, float]
    data: dict[str, Any]


class EdgeData(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class SavePipelineRequest(BaseModel):
    name: Optional[str] = "My Pipeline"
    nodes: list[NodeData]
    edges: list[EdgeData]


class BuildPipelineRequest(BaseModel):
    nodes: list[NodeData]
    edges: list[EdgeData]


class PipelineResponse(BaseModel):
    id: int
    name: str
    nodes_json: str
    edges_json: str
    is_built: bool
    collection_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    uploaded_at: datetime

    class Config:
        from_attributes = True
