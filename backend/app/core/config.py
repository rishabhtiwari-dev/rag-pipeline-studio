from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    DATABASE_URL: str = "sqlite:///./rag_pipeline.db"
    UPLOAD_DIR: str = str(Path(__file__).parent.parent.parent / "uploads")
    CHROMA_DIR: str = str(Path(__file__).parent.parent.parent / "chroma_db")

    ENCRYPTION_KEY: str = "zGnAMGkopBrGNXFPzQgN_V3pO_w8K5FxBzQmB62uMFU="

    class Config:
        env_file = ".env"


settings = Settings()
