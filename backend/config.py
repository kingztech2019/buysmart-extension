from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # OpenRouter
    openrouter_api_key: str = ""
    openrouter_model: str = "mistralai/mistral-7b-instruct"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"

    # SearXNG
    searxng_url: str = "http://searxng:8080"

    # Tavily — optional but recommended for accurate price extraction
    # Get a free API key at https://app.tavily.com (1,000 credits/month free)
    tavily_api_key: str = ""

    # Deepcrawl — optional but highly recommended for bypassing anti-bot protections
    # 100% free and open-source at https://deepcrawl.dev
    # Get a free API key at https://deepcrawl.dev/docs/overview/quick-start
    deepcrawl_api_key: str = ""

    # App
    app_name: str = "BuySmart API"
    app_version: str = "1.0.0"
    debug: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
