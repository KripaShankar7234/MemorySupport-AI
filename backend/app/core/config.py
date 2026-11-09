import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

# Determine backend base directory and look for .env
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    # Hindsight Settings
    HINDSIGHT_BASE_URL: str = Field(
        default="https://api.hindsight.vectorize.io",
        description="Base URL for Hindsight Cloud or self-hosted instance",
    )
    HINDSIGHT_API_KEY: str = Field(
        default="",
        description="Hindsight Cloud API Key",
    )
    HINDSIGHT_BANK_ID: str = Field(
        default="memorysupport-demo",
        description="Default memory bank ID for customer memory retention and recall",
    )

    # Groq Settings
    GROQ_API_KEY: str = Field(
        default="",
        description="Groq API key for fast LLM inference",
    )
    GROQ_MODEL: str = Field(
        default="openai/gpt-oss-120b",
        description="Default Groq LLM model",
    )

    # MongoDB Atlas Settings
    MONGODB_URI: str = Field(
        default="",
        description="MongoDB Atlas connection string",
    )
    MONGODB_DB_NAME: str = Field(
        default="memorysupport_ai",
        description="MongoDB database name",
    )

    # Server Settings
    ENVIRONMENT: str = Field(default="development")
    HOST: str = Field(default="127.0.0.1")
    PORT: int = Field(default=8000)
    LOG_LEVEL: str = Field(default="INFO")

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH) if ENV_PATH.exists() else ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def mask_key(self, key: str) -> str:
        """Returns a masked representation of a secret string, never revealing the secret."""
        if not key:
            return "<NOT CONFIGURED>"
        if len(key) <= 8:
            return "***"
        return f"{key[:3]}...{key[-3:]}"

    @property
    def hindsight_status(self) -> str:
        return f"Configured ({self.mask_key(self.HINDSIGHT_API_KEY)})" if self.HINDSIGHT_API_KEY else "Missing"

    @property
    def groq_status(self) -> str:
        return f"Configured ({self.mask_key(self.GROQ_API_KEY)})" if self.GROQ_API_KEY else "Missing"

    @property
    def mongo_status(self) -> str:
        return "Configured" if self.MONGODB_URI else "Missing"

settings = Settings()
