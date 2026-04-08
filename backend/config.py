# backend/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "sqlite:///./crm.db"
    jwt_secret_key: str = "change-me-before-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    app_name: str = "Cape Neto CRM"
    debug: bool = True

    class Config:
        env_file = ".env"

settings = Settings()