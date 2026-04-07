"""
Price scraper — three-layer architecture:

Layer 1 (primary): Tavily Search API — targeted price queries
  - Returns concise snippets that actually mention prices
  - Handles all sites (Amazon, eBay, Walmart, BestBuy etc.)
  - Free tier: 1,000 credits/month at https://app.tavily.com
  - Set TAVILY_API_KEY in your .env to enable

Layer 2 (enhanced): Deepcrawl — structured content extraction
  - Extracts clean markdown and metadata from any page
  - Bypasses many anti-bot protections
  - 100% free and open-source at https://deepcrawl.dev
  - Set DEEPCRAWL_API_KEY in your .env to enable

Layer 3 (fallback): Direct HTTP + ld+json / meta tag parsing
  - Works for sites that allow plain HTTP requests (BestBuy, B&H, Newegg etc.)
  - Zero cost, no API key required
"""

import re
import json
import asyncio
import logging
import httpx
from typing import Optional

logger = logging.getLogger(__name__)

_TIMEOUT = 8.0

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

# Price regex — supports $, £, €, ₦ symbols and USD/GBP/EUR/CAD/NGN codes
# (?<!\w) prevents matching GB inside "256GB"
_PRICE_RE = re.compile(
    r'(?<!\w)(?:\$|£|€|₦|USD|GBP|EUR|CAD|NGN)\s?\d[\d,]*(?:\.\d{1,2})?'
    r'|\b\d[\d,]*(?:\.\d{1,2})?\s?(?:USD|GBP|EUR|CAD|NGN)\b',
    re.IGNORECASE,
)

# Filter out range/filter UI text and monthly financing logic
_FILTER_RE = re.compile(
    r'under\s*[\$£€₦]|[\$£€₦]\d+\s*(to|-)\s*[\$£€₦]\d+'
    r'|price\s*range|sort\s*by|filter\s*by|starting\s*(at|from)'
    r'|/\s*mo\b|per\s*month|a\s*month|monthly|month\s*\$'
    r'|installment|payment\s*plan|finance|affirm|klarna'
    r'|as\s+low\s+as|from\s+\$\d+/mo',
    re.IGNORECASE,
)

# Context keywords — a price is more trustworthy when near these words
_PRICE_CONTEXT_RE = re.compile(
    r'(?:price|cost|buy|sale|discount|retail|msrp|now|only|was|from'
    r'|checkout|add\s+to\s+cart|purchase|get\s+it\s+for|shop|order'
    r'|available\s+for|selling\s+for|priced\s+at|deal|offer|save'
    r'|in\s+stock|free\s+shipping|delivery)',
    re.IGNORECASE,
)


# ── Tavily Search Layer ───────────────────────────────────────────────────────

async def search_prices_via_tavily(
    product_name: str,
    api_key: str,
    base_price: Optional[str] = None,
) -> list[dict]:
    """
    Use Tavily Search to find confirmed prices for a product.
    Returns a list of dicts: {title, url, price, snippet}

    Why search instead of extract:
    - Search returns concise, pre-filtered snippets that contain actual prices
    - Extract returns full page HTML which has dozens of unrelated prices
    - Search is simpler, faster, and more accurate for price lookups
    """
    try:
        from tavily import AsyncTavilyClient
        client = AsyncTavilyClient(api_key=api_key)

        query = f'{product_name} price buy online'
        logger.info(f"[Scraper/Tavily] Searching: {query!r}")

        response = await client.search(
            query=query,
            search_depth="advanced",
            max_results=8,
            include_answer=False,
        )

        priced_results = []
        for r in response.get("results", []):
            snippet = r.get("content", "") or ""
            url = r.get("url", "")
            title = r.get("title", "")

            price = _extract_best_price_from_snippet(snippet, base_price)
            
            # Log with more detail
            status = "✅" if price else "  "
            price_display = f"'{price}'" if price else "'no price'"
            logger.info(
                f"[Scraper/Tavily]  {status} {price_display:20s} | {title[:50]}"
            )
            
            # Log snippet for debugging when no price found
            if not price and snippet:
                logger.info(f"[Scraper/Tavily]     Snippet: {snippet[:200]}")

            priced_results.append({
                "title":        title,
                "url":          url,
                "content":      snippet,
                "engine":       "tavily",
                "score":        r.get("score", 0.0),
                "price":        price,
                "price_source": "tavily search" if price else None,
                "thumbnail":    None,
            })

        found = sum(1 for r in priced_results if r["price"])
        logger.info(f"[Scraper/Tavily] Search done: {found}/{len(priced_results)} results have prices")
        return priced_results

    except ImportError:
        logger.error("[Scraper/Tavily] tavily-python not installed")
        return []
    except Exception as e:
        logger.warning(f"[Scraper/Tavily] Search error: {e}")
        return []


# ── Price extraction helpers ─────────────────────────────────────────────────

def _parse_price_value(price_str: str) -> Optional[float]:
    """Extract numeric value from a price string (e.g. '$749.00' -> 749.0)"""
    m = re.search(r'[\d,]+(?:\.\d{1,2})?', price_str)
    if m:
        try:
            return float(m.group(0).replace(',', ''))
        except ValueError:
            pass
    return None

def _is_price_plausible(price_str: str, base_price_str: Optional[str]) -> bool:
    """
    Check if the found price is roughly within scale of the base product price.
    Filters out $15 cases or $20/month plans when looking for a $750 phone.
    """
    val = _parse_price_value(price_str)
    
    if not val:
        return False
    
    if not base_price_str:
        # No base price to compare against - use reasonable bounds
        # For electronics/products, typically > $20 or equivalent
        # But allow lower prices for accessories or regional pricing
        if val < 5:  # Filter out very small prices (likely shipping/tax)
            return False
        if val > 100000:  # Filter out unreasonably high prices
            return False
        return True
        
    base = _parse_price_value(base_price_str)
    
    if val and base and base > 0:
        # Require found price to be between 30% and 300% of base price (more lenient)
        if val < (base * 0.30) or val > (base * 3.00):
            logger.debug(f"[Scraper] Price {price_str} outside plausible range for base {base_price_str}")
            return False
            
    return True


def _extract_best_price_from_snippet(text: str, base_price: Optional[str] = None) -> Optional[str]:
    """
    Extract the most trustworthy price from a short snippet.
    Prefers prices that appear near price-context keywords and pass the plausibility check.
    """
    if not text:
        return None

    # First, try to find prices in sentences with strong context
    sentences = re.split(r'[.!?\n|·•]', text)
    candidates = []  # Store all candidate prices with their scores

    for sentence in sentences:
        # Skip filter/range UI text
        if _FILTER_RE.search(sentence):
            continue

        # Find all prices in this sentence
        matches = list(_PRICE_RE.finditer(sentence))
        if not matches:
            continue

        for m in matches:
            price = m.group(0).strip()

            # Must pass plausibility (e.g. not a $15 accessory for a $800 phone)
            if not _is_price_plausible(price, base_price):
                logger.debug(f"[Scraper] Rejected implausible price: {price}")
                continue

            # Score this price based on context and value
            score = 0
            
            # Strong match: price appears near buying-context words
            if _PRICE_CONTEXT_RE.search(sentence):
                score += 2
            else:
                score += 1
            
            # Prefer higher prices (likely to be product price, not shipping/tax)
            price_value = _parse_price_value(price)
            if price_value:
                # Boost score for prices above certain thresholds
                if price_value > 50:
                    score += 1
                if price_value > 100:
                    score += 1
                if price_value > 500:
                    score += 1
            
            candidates.append((price, score, price_value or 0))
    
    # Sort by score (descending), then by value (descending)
    candidates.sort(key=lambda x: (x[1], x[2]), reverse=True)
    
    # Return the best candidate
    if candidates:
        return candidates[0][0]
    
    # If no high-confidence price found, try a more aggressive approach
    all_matches = list(_PRICE_RE.finditer(text))
    plausible_prices = []
    
    for m in all_matches:
        price = m.group(0).strip()
        # Get context around the price (50 chars before and after)
        start = max(0, m.start() - 50)
        end = min(len(text), m.end() + 50)
        context = text[start:end]
        
        # Skip if it's in a filter phrase
        if _FILTER_RE.search(context):
            continue
        
        # Check plausibility
        if _is_price_plausible(price, base_price):
            price_value = _parse_price_value(price) or 0
            plausible_prices.append((price, price_value))
    
    # Sort by value (descending) and return the highest
    if plausible_prices:
        plausible_prices.sort(key=lambda x: x[1], reverse=True)
        return plausible_prices[0][0]

    return None


# ── Direct HTTP fallback ─────────────────────────────────────────────────────

def _extract_from_ld_json(html: str) -> Optional[str]:
    for block in re.findall(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html, re.DOTALL | re.IGNORECASE,
    ):
        try:
            data = json.loads(block.strip())
        except json.JSONDecodeError:
            continue
        for item in (data if isinstance(data, list) else [data]):
            price = _price_from_schema(item)
            if price:
                return price
    return None


def _price_from_schema(obj: dict) -> Optional[str]:
    if not isinstance(obj, dict):
        return None
    offers = obj.get("offers") or obj.get("Offers")
    if offers:
        for offer in (offers if isinstance(offers, list) else [offers]):
            if isinstance(offer, dict):
                price = offer.get("price") or offer.get("lowPrice")
                currency = offer.get("priceCurrency", "")
                if price and str(price) not in ("0", "0.0", ""):
                    return f"{currency} {price}".strip() if currency else str(price)
    for key in ("price", "lowPrice"):
        val = obj.get(key)
        if val and str(val) not in ("0", "0.0", ""):
            currency = obj.get("priceCurrency", "")
            return f"{currency} {val}".strip() if currency else str(val)
    return None


def _extract_from_meta(html: str) -> Optional[str]:
    for pat in [
        r'<meta[^>]+property=["\'](?:og|product):price:amount["\'][^>]+content=["\']([^"\']+)["\']',
        r'<meta[^>]+itemprop=["\']price["\'][^>]+content=["\']([^"\']+)["\']',
    ]:
        m = re.search(pat, html, re.IGNORECASE)
        if m:
            val = m.group(1).strip()
            if val and val not in ("0", "0.0"):
                return val
    return None


async def _scrape_direct(url: str) -> Optional[str]:
    """Direct HTTP fetch — works for non-protected sites."""
    try:
        async with httpx.AsyncClient(
            timeout=_TIMEOUT, follow_redirects=True, headers=_HEADERS
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            html = resp.text
        return _extract_from_ld_json(html) or _extract_from_meta(html)
    except Exception:
        return None


async def _scrape_via_deepcrawl(url: str, api_key: str) -> Optional[str]:
    """
    Use Deepcrawl to extract page content and find prices.
    Deepcrawl can bypass many anti-bot protections and extract structured data.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "https://api.deepcrawl.dev/read",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "url": url,
                    "markdown": True,
                    "metadata": True,
                    "cleanedHtml": True,
                }
            )
            
            logger.info(f"[Scraper/Deepcrawl] Response status: {response.status_code} for {url[:60]}")
            
            response.raise_for_status()
            data = response.json()
            
            # Log the full response for debugging
            logger.info(f"[Scraper/Deepcrawl] Response data keys: {list(data.keys())}")
            logger.info(f"[Scraper/Deepcrawl] Success: {data.get('success')}, Cached: {data.get('cached')}")
            
            if data.get("metadata"):
                logger.info(f"[Scraper/Deepcrawl] Metadata title: {data['metadata'].get('title', 'N/A')[:60]}")
            
            if not data.get("success"):
                logger.warning(f"[Scraper/Deepcrawl] Request failed for {url[:60]}")
                return None
            
            # Try to extract price from markdown content
            markdown = data.get("markdown", "")
            if markdown:
                logger.info(f"[Scraper/Deepcrawl] Markdown length: {len(markdown)} chars")
                logger.info(f"[Scraper/Deepcrawl] Markdown preview: {markdown[:300]}")
                
                # Try aggressive price extraction from full markdown
                price = _extract_best_price_from_snippet(markdown, None)
                if price:
                    logger.info(f"[Scraper/Deepcrawl] ✅ Found price {price} in markdown for {url[:50]}")
                    return price
                
                # If no price found, log more of the markdown for debugging
                if len(markdown) > 300:
                    logger.info(f"[Scraper/Deepcrawl] Markdown middle section: {markdown[len(markdown)//2:len(markdown)//2+300]}")
            
            # Try to extract from cleaned HTML
            cleaned_html = data.get("cleanedHtml", "")
            if cleaned_html:
                logger.info(f"[Scraper/Deepcrawl] CleanedHtml length: {len(cleaned_html)} chars")
                logger.info(f"[Scraper/Deepcrawl] CleanedHtml preview: {cleaned_html[:300]}")
                
                price = _extract_from_ld_json(cleaned_html) or _extract_from_meta(cleaned_html)
                if price:
                    logger.info(f"[Scraper/Deepcrawl] ✅ Found price {price} in HTML for {url[:50]}")
                    return price
                
                # Also try regex extraction from HTML as fallback
                price = _extract_best_price_from_snippet(cleaned_html, None)
                if price:
                    logger.info(f"[Scraper/Deepcrawl] ✅ Found price {price} via regex in HTML for {url[:50]}")
                    return price
            
            logger.info(f"[Scraper/Deepcrawl] No price found in response for {url[:60]}")
            return None
            
    except httpx.HTTPStatusError as e:
        logger.warning(f"[Scraper/Deepcrawl] HTTP {e.response.status_code} for {url[:60]}: {e.response.text[:200]}")
        return None
    except Exception as e:
        logger.warning(f"[Scraper/Deepcrawl] Error scraping {url[:60]}: {e}")
        return None


# ── Main entry point ─────────────────────────────────────────────────────────

def _normalize_url(url: str) -> str:
    """Normalize URL for comparison by removing query params, fragments, and trailing slashes."""
    import urllib.parse
    parsed = urllib.parse.urlparse(url)
    # Keep scheme, netloc, and path only
    normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path}".rstrip('/')
    return normalized.lower()


async def enrich_with_scraped_prices(
    results: list[dict],
    max_pages: int = 5,
    tavily_api_key: Optional[str] = None,
    product_name: Optional[str] = None,
    base_price: Optional[str] = None,
    deepcrawl_api_key: Optional[str] = None,
) -> list[dict]:
    """
    Enrich results with prices using Tavily Search or direct HTTP fallback.
    Tavily Search is preferred because it returns concise price-containing snippets.
    """
    to_enrich = [r for r in results if not r.get("price")]

    if not to_enrich:
        logger.info("[Scraper] All results already priced — skipping")
        return results

    if tavily_api_key and product_name:
        # Use Tavily Search — one targeted search returns many priced results
        tavily_results = await search_prices_via_tavily(product_name, tavily_api_key, base_price)

        # Merge Tavily results: update existing results with prices by URL match,
        # then append new Tavily results that aren't already in the list
        # Use normalized URLs for better matching
        existing_urls = {_normalize_url(r["url"]): r for r in results}

        for tr in tavily_results:
            normalized_tr_url = _normalize_url(tr["url"])
            if normalized_tr_url in existing_urls:
                # Update the existing result with the Tavily-found price
                existing_result = existing_urls[normalized_tr_url]
                if not existing_result.get("price") and tr.get("price"):
                    existing_result["price"] = tr["price"]
                    existing_result["price_source"] = "tavily search"
                    logger.info(f"[Scraper] ✅ Merged Tavily price {tr['price']} into existing result: {existing_result['title'][:50]}")
            elif tr.get("price"):
                # Add new Tavily result (with price) to our list
                results.append(tr)
                logger.info(f"[Scraper] ➕ Added new Tavily result with price {tr['price']}: {tr['title'][:50]}")
        
        # Try direct scraping on URLs that still don't have prices
        still_no_price = [r for r in results if not r.get("price")]
        if still_no_price:
            targets = still_no_price[:max_pages]
            
            # Try Deepcrawl first if API key is available
            if deepcrawl_api_key:
                logger.info(f"[Scraper] Attempting Deepcrawl scrape on {len(targets)} URLs without prices...")
                prices = await asyncio.gather(
                    *[_scrape_via_deepcrawl(r["url"], deepcrawl_api_key) for r in targets],
                    return_exceptions=True,
                )
                for result, price in zip(targets, prices):
                    if isinstance(price, str) and price:
                        result["price"] = price
                        result["price_source"] = "deepcrawl scrape"
                        logger.info(f"[Scraper] 🔍 Deepcrawl found price {price} for: {result['title'][:50]}")
            
            # Fall back to direct HTTP for any still missing
            still_no_price_after_deepcrawl = [r for r in targets if not r.get("price")]
            if still_no_price_after_deepcrawl:
                logger.info(f"[Scraper] Attempting direct HTTP scrape on {len(still_no_price_after_deepcrawl)} remaining URLs...")
                prices = await asyncio.gather(
                    *[_scrape_direct(r["url"]) for r in still_no_price_after_deepcrawl],
                    return_exceptions=True,
                )
                for result, price in zip(still_no_price_after_deepcrawl, prices):
                    if isinstance(price, str) and price:
                        result["price"] = price
                        result["price_source"] = "page scrape"
                        logger.info(f"[Scraper] 🔍 Direct scrape found price {price} for: {result['title'][:50]}")

    else:
        # No Tavily key — use Deepcrawl or direct HTTP scraping
        targets = to_enrich[:max_pages]
        
        if deepcrawl_api_key:
            logger.info(f"[Scraper] Deepcrawl scraping {len(targets)} pages...")
            prices = await asyncio.gather(
                *[_scrape_via_deepcrawl(r["url"], deepcrawl_api_key) for r in targets],
                return_exceptions=True,
            )
            for result, price in zip(targets, prices):
                if isinstance(price, str) and price:
                    result["price"] = price
                    result["price_source"] = "deepcrawl scrape"
        
        # Fall back to direct HTTP for any still missing
        still_missing = [r for r in targets if not r.get("price")]
        if still_missing:
            logger.info(f"[Scraper] Direct HTTP scraping {len(still_missing)} pages...")
            prices = await asyncio.gather(
                *[_scrape_direct(r["url"]) for r in still_missing],
                return_exceptions=True,
            )
            for result, price in zip(still_missing, prices):
                if isinstance(price, str) and price:
                    result["price"] = price
                    result["price_source"] = "page scrape"

    enriched = sum(1 for r in results if r.get("price"))
    logger.info(f"[Scraper] Total results with prices: {enriched}/{len(results)}")
    return results
