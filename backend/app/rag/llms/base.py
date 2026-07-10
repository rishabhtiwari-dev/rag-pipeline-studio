from abc import ABC, abstractmethod
from typing import Any


class BaseLLMProvider(ABC):
    """Abstract base — every LLM adapter implements this contract.
    Adding a new provider (OpenAI, Anthropic, etc.) means subclassing this
    and registering it in the factory below. The RAG executor never imports
    a concrete class directly, only the factory function.
    """

    def __init__(self, config: dict[str, Any]):
        self.config = config

    @abstractmethod
    def get_langchain_llm(self) -> Any:
        """Return a LangChain-compatible chat model instance."""
        ...

    @property
    @abstractmethod
    def provider_name(self) -> str:
        ...

    @property
    def is_mock(self) -> bool:
        return False


def get_llm_provider(llm_type: str, config: dict[str, Any], api_key: str) -> BaseLLMProvider:
    """Factory — resolves provider name to concrete implementation."""
    from app.rag.llms.gemini import GeminiProvider
    from app.rag.llms.openai_mock import OpenAIMockProvider
    from app.rag.llms.claude_mock import ClaudeMockProvider

    registry: dict[str, type[BaseLLMProvider]] = {
        "gemini": GeminiProvider,
        "openai": OpenAIMockProvider,
        "claude": ClaudeMockProvider,
    }

    provider_cls = registry.get(llm_type.lower())
    if provider_cls is None:
        raise ValueError(f"Unknown LLM provider: {llm_type}. Available: {list(registry)}")

    merged_config = {**config, "api_key": api_key}
    return provider_cls(merged_config)
