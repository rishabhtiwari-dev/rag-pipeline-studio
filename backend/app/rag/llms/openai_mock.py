from typing import Any
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage
from langchain_core.outputs import ChatGeneration, ChatResult
from app.rag.llms.base import BaseLLMProvider


class _MockChatModel(BaseChatModel):
    """Stub that satisfies the LangChain interface without calling any API."""

    @property
    def _llm_type(self) -> str:
        return "mock-openai"

    def _generate(self, messages: list[BaseMessage], **kwargs) -> ChatResult:
        content = (
            "[OpenAI Mock] This is a simulated response. "
            "OpenAI integration is not yet activated — configure a real key to enable it."
        )
        return ChatResult(generations=[ChatGeneration(message=AIMessage(content=content))])


class OpenAIMockProvider(BaseLLMProvider):
    @property
    def provider_name(self) -> str:
        return "openai"

    @property
    def is_mock(self) -> bool:
        return True

    def get_langchain_llm(self) -> Any:
        return _MockChatModel()
