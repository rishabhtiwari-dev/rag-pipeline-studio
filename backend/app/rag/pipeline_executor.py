"""
Pipeline Executor
-----------------
Receives the serialized node/edge graph from the frontend and drives
the RAG workflow. The graph is topology-sorted, but for RAG pipelines
the order is always: Loader → Splitter → VectorStore → LLM.

The executor extracts each node's config dict by type, making it trivial
to add new node variants without touching the execution loop.
"""
from __future__ import annotations
import json
from typing import Any

from langchain.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate

from app.rag.loaders import load_documents
from app.rag.splitters import split_documents
from app.rag.vector_stores import build_vector_store, load_vector_store
from app.rag.llms.base import get_llm_provider


RAG_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template=(
        "You are a helpful assistant. Use the following context to answer the question.\n\n"
        "Context:\n{context}\n\n"
        "Question: {question}\n\n"
        "Answer:"
    ),
)


def _extract_node_config(nodes: list[dict], node_type: str) -> dict[str, Any]:
    """Find first node of a given type and return its data payload."""
    for node in nodes:
        if node.get("type") == node_type:
            return node.get("data", {})
    return {}


def build_pipeline(
    nodes: list[dict],
    file_paths: list[str],
    api_key: str,
    collection_name: str,
) -> None:
    """Ingest documents through the pipeline and persist the vector store."""
    loader_cfg = _extract_node_config(nodes, "loaderNode")
    splitter_cfg = _extract_node_config(nodes, "splitterNode")

    docs = load_documents(file_paths, loader_type=loader_cfg.get("loader_type", "auto"))

    chunks = split_documents(
        docs,
        splitter_type=splitter_cfg.get("splitter_type", "recursive"),
        chunk_size=int(splitter_cfg.get("chunk_size", 1000)),
        chunk_overlap=int(splitter_cfg.get("chunk_overlap", 200)),
    )

    build_vector_store(chunks, api_key=api_key, collection_name=collection_name)


def query_pipeline(
    question: str,
    nodes: list[dict],
    api_key: str,
    collection_name: str,
    k: int = 4,
) -> dict[str, Any]:
    """Retrieve relevant chunks and generate an answer."""
    llm_cfg = _extract_node_config(nodes, "llmNode")
    llm_type = llm_cfg.get("llm_type", "gemini")

    provider = get_llm_provider(llm_type, llm_cfg, api_key)
    llm = provider.get_langchain_llm()

    coll = collection_name

    vector_store = load_vector_store(api_key=api_key, collection_name=coll)
    retriever = vector_store.as_retriever(search_kwargs={"k": k})

    chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
        chain_type_kwargs={"prompt": RAG_PROMPT},
    )

    result = chain.invoke({"query": question})

    sources = [
        {"content": doc.page_content, "metadata": doc.metadata}
        for doc in result.get("source_documents", [])
    ]

    return {"answer": result["result"], "sources": sources, "is_mock": provider.is_mock}
