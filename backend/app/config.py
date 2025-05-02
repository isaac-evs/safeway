import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@localhost:5432/newsdb")
    API_PREFIX: str = "/api"

    class Config:
        env_file = ".env"

settings = Settings()
