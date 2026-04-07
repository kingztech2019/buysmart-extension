import logging
from fastapi import APIRouter
from models.schemas import ProductReviewsRequest, ProductReviewsResponse, ReviewSource
from services.reviews import search_and_summarize_reviews

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/product-reviews", response_model=ProductReviewsResponse)
async def product_reviews(request: ProductReviewsRequest):
    """
    Fetch and summarize customer reviews for a product from Reddit,
    forums, and e-commerce platforms via SearXNG + LLM.
    """
    logger.info("=" * 60)
    logger.info(f"[Reviews] NEW REQUEST")
    logger.info(f"[Reviews]   product : {request.product_name}")
    logger.info("=" * 60)

    result = await search_and_summarize_reviews(request.product_name)

    sources = [
        ReviewSource(
            platform=s.get("platform", "Other"),
            title=s.get("title", ""),
            url=s.get("url", ""),
            snippet=s.get("snippet", ""),
        )
        for s in result.get("sources", [])
    ]

    return ProductReviewsResponse(
        overall_sentiment=result.get("overall_sentiment", "mixed"),
        summary=result.get("summary", ""),
        highlights=result.get("highlights", []),
        sources=sources,
    )
