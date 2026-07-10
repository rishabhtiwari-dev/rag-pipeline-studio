from typing import List
from langchain_core.embeddings import Embeddings
from langchain_core.documents import Document
from langchain_chroma import Chroma
from app.core.config import settings


class LocalEmbeddings(Embeddings):
    """ChromaDB's built-in all-MiniLM-L6-v2 via onnxruntime.
    Downloads ~23 MB on first use, cached locally. No API key required.
    """

    def __init__(self):
        from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
        self._ef = DefaultEmbeddingFunction()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [[float(x) for x in v] for v in self._ef(texts)]

    def embed_query(self, text: str) -> List[float]:
        return [float(x) for x in self._ef([text])[0]]


def get_embeddings(api_key: str) -> LocalEmbeddings:
    return LocalEmbeddings()


def build_vector_store(
    documents: List[Document],
    api_key: str,
    collection_name: str = "rag_collection",
) -> Chroma:
    embeddings = get_embeddings(api_key)
    return Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        collection_name=collection_name,
        persist_directory=settings.CHROMA_DIR,
    )


def load_vector_store(api_key: str, collection_name: str = "rag_collection") -> Chroma:
    embeddings = get_embeddings(api_key)
    return Chroma(
        collection_name=collection_name,
        embedding_function=embeddings,
        persist_directory=settings.CHROMA_DIR,
    )
