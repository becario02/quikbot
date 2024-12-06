from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_NAME: str
    DB_PORT: str = "3306"
    QDRANT_URL: str
    QDRANT_API_KEY: str
    QDRANT_COLLECTION_NAME: str
    DATABASE_URL: str 
    BLOB_READ_WRITE_TOKEN: str
    NOTIFICATION_EMAIL: str
    NOTIFICATION_EMAIL_PASSWORD: str
    CORS_ORIGINS: list = ["*"]

    class Config:
        env_file = ".env"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        os.environ["OPENAI_API_KEY"] = self.OPENAI_API_KEY

settings = Settings()