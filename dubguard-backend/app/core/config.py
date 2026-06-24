from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "DubGuard AI"
    API_V1_STR: str = "/api/v1"
    GROQ_API_KEY: str = ""
    
    # Add other configuration variables here, e.g., Model Paths, Database URL, etc.

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="allow")

settings = Settings()
