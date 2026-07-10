from pathlib import Path
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader, TextLoader, UnstructuredMarkdownLoader


def load_documents(file_paths: list[str], loader_type: str = "auto") -> list[Document]:
    """Load documents from disk. loader_type 'auto' selects by extension."""
    docs: list[Document] = []
    for path in file_paths:
        p = Path(path)
        ext = p.suffix.lower()
        try:
            if ext == ".pdf" or loader_type == "pdf":
                loader = PyPDFLoader(path)
            elif ext == ".md" or loader_type == "markdown":
                loader = UnstructuredMarkdownLoader(path)
            else:
                loader = TextLoader(path, encoding="utf-8")
            docs.extend(loader.load())
        except Exception as e:
            docs.append(Document(
                page_content=f"[Error loading {p.name}: {e}]",
                metadata={"source": path, "error": str(e)},
            ))
    return docs
