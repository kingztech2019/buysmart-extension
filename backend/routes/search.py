import logging
from fastapi import APIRouter, Query
from models.schemas import SearchResponse, SearchResult
from services.searxng import search_product

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/search", response_model=SearchResponse)
async def search(
    q: str = Query(..., description="Search query"),
    categories: str = Query("general", description="SearXNG categories (general, shopping)"),
    num_results: int = Query(10, ge=1, le=20, description="Number of results to return"),
):
    """
    Proxy endpoint for SearXNG searches.
    Useful for the manual search mode on unsupported sites.
    """
    logger.info(f"Search request: '{q}' (categories={categories})")

    results = await search_product(
        query=q,
        categories=categories,
        num_results=num_results,
    )

    return SearchResponse(
        query=q,
        results=[SearchResult(**r) for r in results],
        total=len(results),
    )
