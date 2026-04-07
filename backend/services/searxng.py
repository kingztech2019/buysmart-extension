import re
import httpx
import logging
from typing import List, Optional
from config import get_settings

logger = logging.getLogger(__name__)

# Matches price patterns in text: $749, $1,299.99, £499, €699 etc.
# (?<!\w) — negative lookbehind prevents matching "GB" inside "256GB"
# \d immediately after currency — prevents matching comma-only strings like "GB,"
_PRICE_PATTERN = re.compile(
    r'(?<!\w)(?:\$|£|€|₦|USD|GBP|EUR|CAD|NGN)\s?\d[\d,]*(?:\.\d{1,2})?'
    r'|\b\d[\d,]*(?:\.\d{1,2})?\s?(?:USD|GBP|EUR|CAD|NGN)\b',
    re.IGNORECASE,
)

# Snippets containing these phrases are filter/range UI text, not product prices
_FILTER_PHRASES = re.compile(
    r'under\s*[\$£€]|[\$£€]\d+\s*(to|-)\s*[\$£€]\d+|price\s*range|sort\s*by|filter\s*by',
    re.IGNORECASE,
)


def _extract_price_from_snippet(text: str) -> Optional[str]:
    """
    Best-effort: find the first price-like pattern in a snippet.
    Skips snippets that look like price filter/range UI text.
    Returns None if no reliable price found — never guesses.
    """
    if not text:
        return None
    # Skip snippets that are just e-commerce filter bars
    if _FILTER_PHRASES.search(text):
        return None
    match = _PRICE_PATTERN.search(text)
    return match.group(0).strip() if match else None


async def search_product(
    query: str,
    categories: str = "general",
    num_results: int = 10,
) -> List[dict]:
    """
    Search SearXNG for a product query.
    Captures structured price field (shopping engines) and falls back to
    regex extraction from snippets for general results.
    """
    settings = get_settings()
    params = {
        "q": query,
        "format": "json",
        "categories": categories,
        "language": "en",
        "pageno": 1,
    }

    logger.info(f"[SearXNG] Querying category='{categories}' | q='{query}'")

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                f"{settings.searxng_url}/search",
                params=params,
            )
            response.raise_for_status()
            data = response.json()

        raw_results = data.get("results", [])
        results = raw_results[:num_results]

        logger.info(
            f"[SearXNG] Received {len(raw_results)} results (using top {len(results)}) "
            f"| engines: {list({r.get('engine', '?') for r in results})}"
        )

        cleaned = []
        for i, r in enumerate(results, 1):
            snippet = r.get("content", "")

            # Primary: structured price from shopping engine
            raw_price = r.get("price") or r.get("price_str") or None
            structured_price = str(raw_price).strip() if raw_price else None

            # Fallback: regex extraction from snippet text
            snippet_price = _extract_price_from_snippet(snippet) if not structured_price else None

            # Use whichever we found; tag whether it's confirmed or extracted
            price_val = structured_price or snippet_price
            price_source = (
                "shopping engine" if structured_price else
                "snippet extract" if snippet_price else
                None
            )

            item = {
                "title":        r.get("title", ""),
                "url":          r.get("url", ""),
                "content":      snippet,
                "engine":       r.get("engine", ""),
                "score":        r.get("score", 0.0),
                "price":        price_val,
                "price_source": price_source,  # so LLM knows how reliable it is
                "thumbnail":    r.get("thumbnail") or r.get("img_src") or None,
            }
            cleaned.append(item)

            logger.info(
                f"[SearXNG]  #{i:02d} [{item['engine']}] {item['title'][:60]!r}\n"
                f"                url  : {item['url']}\n"
                f"                price: {item['price'] or 'none'} "
                f"({'via ' + price_source if price_source else 'not found'})\n"
                f"                snip : {snippet[:100]!r}"
            )

        return cleaned

    except httpx.HTTPStatusError as e:
        logger.error(f"[SearXNG] HTTP {e.response.status_code} for query='{query}': {e.response.text[:200]}")
        return []
    except httpx.RequestError as e:
        logger.error(f"[SearXNG] Request failed for query='{query}': {e}")
        return []
    except Exception as e:
        logger.error(f"[SearXNG] Unexpected error for query='{query}': {e}")
        return []


async def search_product_prices(product_name: str, base_price: Optional[str] = None) -> List[dict]:
    """
    Targeted searches for price comparison data.
    Returns deduplicated results enriched with scraped prices.
    """
    from services.scraper import enrich_with_scraped_prices
    from config import get_settings
    settings = get_settings()

    logger.info(f"[SearXNG] Starting product search for: '{product_name}'")

    # Shopping: structured price data (bing shopping etc.)
    shopping_results = await search_product(
        query=product_name,
        categories="shopping",
        num_results=6,
    )

    # General: reviews and price mentions — snippet extraction as fallback
    general_results = await search_product(
        query=f"{product_name} price buy online",
        categories="general",
        num_results=6,
    )

    # Deduplicate by URL (shopping first — more likely to carry price data)
    seen_urls: set = set()
    combined = []
    for r in (shopping_results + general_results):
        if r["url"] not in seen_urls:
            seen_urls.add(r["url"])
            combined.append(r)

    final = combined[:10]

    # Summarise before scraping
    engine_prices  = [r for r in final if r.get("price_source") == "shopping engine"]
    snippet_prices = [r for r in final if r.get("price_source") == "snippet extract"]
    no_prices      = [r for r in final if not r.get("price")]

    logger.info(
        f"[SearXNG] Before scrape: {len(final)} results | "
        f"engine={len(engine_prices)} | snippet={len(snippet_prices)} | none={len(no_prices)}"
    )

    # Scrape product pages for confirmed prices (ld+json / meta tags)
    # Uses Tavily if API key is set, Deepcrawl as enhanced layer, otherwise falls back to direct HTTP
    if no_prices:
        final = await enrich_with_scraped_prices(
            final,
            max_pages=4,
            tavily_api_key=settings.tavily_api_key or None,
            product_name=product_name,
            base_price=base_price,
            deepcrawl_api_key=settings.deepcrawl_api_key or None,
        )

    # Final summary
    total_priced = len([r for r in final if r.get("price")])
    logger.info(
        f"[SearXNG] Final: {len(final)} results | {total_priced} with price data"
    )
    return final
