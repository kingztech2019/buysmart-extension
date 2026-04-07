import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analysis import router as analysis_router
from routes.reviews import router as reviews_router
from routes.search import router as search_router
from config import get_settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info(f"🚀 {settings.app_name} v{settings.app_version} starting up")
    logger.info(f"   SearXNG : {settings.searxng_url}")
    logger.info(f"   Model   : {settings.openrouter_model}")
    logger.info(f"   API Key : {'✅ set' if settings.openrouter_api_key else '❌ NOT SET'}")
    logger.info(f"   Tavily  : {'✅ set (accurate price scraping enabled)' if settings.tavily_api_key else '⚠️  not set — price scraping uses direct HTTP fallback'}")
    yield
    logger.info("Shutting down BuySmart API")


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="BuySmart open-source backend — AI-powered shopping analysis using SearXNG + OpenRouter",
    lifespan=lifespan,
)

# CORS — allow Chrome extension and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Chrome extensions use chrome-extension:// origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(analysis_router, prefix="/api/v1", tags=["Analysis"])
app.include_router(reviews_router, prefix="/api/v1", tags=["Reviews"])
app.include_router(search_router, prefix="/api/v1", tags=["Search"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
