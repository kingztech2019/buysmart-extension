import logging
from fastapi import APIRouter
from models.schemas import ProductAnalysisRequest, ProductAnalysisResponse
from services.searxng import search_product_prices
from services.openrouter import analyze_product

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/product-analysis", response_model=ProductAnalysisResponse)
async def product_analysis(request: ProductAnalysisRequest):
    """
    Main endpoint: accepts product info, searches SearXNG for context,
    calls OpenRouter for structured JSON analysis, returns typed response.
    """
    logger.info("=" * 60)
    logger.info(f"[Analysis] NEW REQUEST")
    logger.info(f"[Analysis]   product : {request.product_name}")
    logger.info(f"[Analysis]   price   : {request.price or 'not provided'}")
    logger.info(f"[Analysis]   site    : {request.site or 'not provided'}")
    logger.info("=" * 60)

    # Step 1: Gather context from SearXNG
    search_results = await search_product_prices(request.product_name, base_price=request.price)
    logger.info(f"[Analysis] SearXNG done — {len(search_results)} results passed to LLM")

    # Step 2: LLM analysis — returns validated ProductAnalysisResponse
    result = await analyze_product(
        product_name=request.product_name,
        price=request.price,
        search_results=search_results,
    )

    logger.info(f"[Analysis] LLM done — verdict={result.verdict} | sections={[s.key for s in result.sections]}")
    logger.info("=" * 60)

    return result
