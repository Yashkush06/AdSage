from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Meta Ads Agent"
    DEBUG: bool = True
    DEMO_MODE: bool = True

    # Database (SQLite — no setup needed)
    DATABASE_URL: str = "sqlite:///./meta_ads_agent.db"

    # Ollama Cloud AI (optional — falls back to mock if blank)
    OLLAMA_API_URL: str = "https://api.ollama.cloud/v1"
    OLLAMA_API_KEY: str = ""
    OLLAMA_MODEL: str = "gpt-oss:120b-cloud"
    AI_MAX_TOKENS: int = 4000
    AI_TEMPERATURE: float = 0.7
    AI_TIMEOUT: int = 120

    # Agent Configuration
    AUTO_PAUSE_CPA_MULTIPLIER: float = 3.0
    AUTO_SCALE_ROAS_THRESHOLD: float = 3.5

    # Demo hardcoded user
    DEMO_USER_ID: int = 1
    DEMO_USER_EMAIL: str = "demo@adsage.com"
    DEMO_BUSINESS_NAME: str = "Demo Store"
    DEMO_INDUSTRY: str = "E-commerce"
    DEMO_TARGET_CPA: float = 400.0
    DEMO_TARGET_ROAS: float = 3.0

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
