import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "EcoVision Emission & Leak Intelligence Platform"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Industrial emission intelligence, leak detection, and sustainability platform API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    
    # API prefix
    API_V1_PREFIX: str = "/api/v1"
    
    # PostgreSQL Database
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/ecovision"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_ECHO: bool = False
    
    # JWT Authentication
    SECRET_KEY: str = "supersecret_ecovision_jwt_signing_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    # CSV path for dataset seeding
    CSV_DATASET_PATH: str = "industrial_leak_training_v2.csv"
    
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), "..", ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
