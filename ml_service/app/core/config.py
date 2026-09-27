from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CYBER-PREDICT 360 ML Service"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    MODEL_VERSION: str = "0.1.0-stub"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
