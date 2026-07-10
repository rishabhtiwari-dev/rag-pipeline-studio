import requests
from typing import Any, Iterator, List, Optional
from langchain_core.language_models.llms import LLM
from langchain_core.callbacks.manager import CallbackManagerForLLMRun
from app.rag.llms.base import BaseLLMProvider

_CANDIDATE_MODELS = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-pro",
]


class GeminiRestLLM(LLM):
    """Direct REST calls to Gemini generateContent — no gRPC, no version pinning."""

    api_key: str
    model_name: str = "gemini-2.0-flash"
    temperature: float = 0.3
    max_output_tokens: int = 2048

    @property
    def _llm_type(self) -> str:
        return "gemini_rest"

    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        models_to_try = [self.model_name] + [
            m for m in _CANDIDATE_MODELS if m != self.model_name
        ]
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": self.temperature,
                "maxOutputTokens": self.max_output_tokens,
            },
        }
        last_err = None
        for model in models_to_try:
            for api_ver in ("v1beta", "v1"):
                url = f"https://generativelanguage.googleapis.com/{api_ver}/models/{model}:generateContent"
                for attempt in range(3):
                    try:
                        resp = requests.post(
                            url, params={"key": self.api_key}, json=payload, timeout=60
                        )
                        if resp.status_code == 404:
                            break  # model not found — skip to next
                        if resp.status_code in (429, 503) and attempt < 2:
                            import time; time.sleep(2 ** attempt)
                            continue  # transient — retry
                        resp.raise_for_status()
                        data = resp.json()
                        return data["candidates"][0]["content"]["parts"][0]["text"]
                    except Exception as e:
                        last_err = e
                        if attempt < 2:
                            import time; time.sleep(1)
        raise RuntimeError(f"All Gemini models/versions failed. Last error: {last_err}")


class GeminiProvider(BaseLLMProvider):
    """Live Gemini integration via direct REST API."""

    @property
    def provider_name(self) -> str:
        return "gemini"

    def get_langchain_llm(self) -> Any:
        return GeminiRestLLM(
            api_key=self.config["api_key"],
            model_name=self.config.get("model_name", "gemini-2.0-flash"),
            temperature=float(self.config.get("temperature", 0.3)),
            max_output_tokens=int(self.config.get("max_tokens", 2048)),
        )
