from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DATABASE_URL: str = "mysql+pymysql://root:root@localhost:3307/sprint_planning"
    JWT_SECRET: str = "Y2hhbmdlLW1lLXRoaXMtaXMtYS1kZXYtb25seS1zZWNyZXQtMzJieXRlcyEh"
    JWT_ISSUER: str = "sprint-planning"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

