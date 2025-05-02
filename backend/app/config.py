import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).parent.parent

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@localhost:5432/newsdb")
    API_PREFIX: str = "/api"

    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = "utf-8"

settings = Settings()

# in your config.py, right after you load Settings:
print("🔍 Loaded .env → API_PREFIX =", settings.API_PREFIX)
