from typing import Any
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage
from langchain_core.outputs import ChatGeneration, ChatResult
from app.rag.llms.base import BaseLLMProvider


class _MockChatModel(BaseChatModel):
    @property
    def _llm_type(self) -> str:
        return "mock-claude"

    def _generate(self, messages: list[BaseMessage], **kwargs) -> ChatResult:
        content = (
            "[Claude Mock] This is a simulated response. "
            "Anthropic Claude integration is not yet activated — configure a real key to enable it."
        )
        return ChatResult(generations=[ChatGeneration(message=AIMessage(content=content))])


class ClaudeMockProvider(BaseLLMProvider):
    @property
    def provider_name(self) -> str:
        return "claude"

    @property
    def is_mock(self) -> bool:
        return True

    def get_langchain_llm(self) -> Any:
        return _MockChatModel()
