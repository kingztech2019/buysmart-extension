import httpx
import json
import logging
from typing import List
from config import get_settings
from services.searxng import search_product

logger = logging.getLogger(__name__)

REVIEWS_SYSTEM_PROMPT = """You are BuySmart, an AI shopping assistant summarizing customer reviews.

You will be given web search results containing customer reviews from Reddit, forums, and e-commerce platforms.

Return ONLY valid JSON — no markdown fences, no extra text:
{
  "overall_sentiment": "positive" | "negative" | "mixed",
  "summary": "2-3 sentences summarizing the overall customer sentiment.",
  "highlights": ["key insight 1", "key insight 2", "key insight 3"],
  "sources": [
    {
      "platform": "Reddit" | "Amazon" | "Trustpilot" | "YouTube" | "Forum" | "Other",
      "title": "post or review title",
      "url": "https://...",
      "snippet": "brief relevant quote or paraphrase from the review"
    }
  ]
}

Rules:
- highlights: max 5 items, each a concrete observation drawn from the reviews
- sources: include up to 6 most relevant and distinct sources
- summary: neutral and factual, not promotional
- Your entire response must be parseable JSON — nothing outside the JSON object
"""


def _format_review_results(results: List[dict]) -> str:
    if not results:
        return "No review results found."
    lines = []
    for i, r in enumerate(results, 1):
        lines.append(
            f"[{i}] {r.get('title', 'No title')}\n"
            f"    URL: {r.get('url', '')}\n"
            f"    Source: {r.get('engine', '')}\n"
            f"    Snippet: {r.get('content', 'No content')}"
        )
    return "\n\n".join(lines)


def _fallback_reviews(product_name: str) -> dict:
    return {
        "overall_sentiment": "mixed",
        "summary": f"Could not retrieve customer reviews for {product_name} at this time.",
        "highlights": [],
        "sources": [],
    }


async def search_and_summarize_reviews(product_name: str) -> dict:
    """
    Search Reddit, forums, and e-commerce platforms for customer reviews,
    then summarize with LLM.
    """
    settings = get_settings()

    logger.info(f"[Reviews] Starting review search for: '{product_name}'")

    # Reddit-focused search
    reddit_results = await search_product(
        query=f"{product_name} review reddit",
        categories="general",
        num_results=5,
    )

    # Broader review search — Amazon, Trustpilot, tech forums, YouTube
    general_results = await search_product(
        query=f"{product_name} customer review",
        categories="general",
        num_results=5,
    )

    # Deduplicate by URL (reddit results first for authenticity)
    seen_urls: set = set()
    combined = []
    for r in (reddit_results + general_results):
        if r["url"] not in seen_urls:
            seen_urls.add(r["url"])
            combined.append(r)

    results = combined[:10]
    logger.info(f"[Reviews] {len(results)} unique results gathered")

    if not results:
        return _fallback_reviews(product_name)

    if not settings.openrouter_api_key:
        logger.warning("[Reviews] OpenRouter API key not set — returning fallback")
        return _fallback_reviews(product_name)

    search_context = _format_review_results(results)
    user_message = (
        f"Product: {product_name}\n\n"
        f"═══ CUSTOMER REVIEW SEARCH RESULTS ═══\n"
        f"{search_context}\n\n"
        f"Summarize the customer sentiment and return JSON as instructed."
    )

    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/buysmart-extension",
        "X-Title": "BuySmart Chrome Extension",
    }

    payload = {
        "model": settings.openrouter_model,
        "messages": [
            {"role": "system", "content": REVIEWS_SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        "temperature": 0.2,
        "max_tokens": 1000,
        "response_format": {"type": "json_object"},
    }

    try:
        logger.info(f"[Reviews] Sending to LLM model: {settings.openrouter_model}")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.openrouter_base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

        if not data.get("choices"):
            logger.error(f"[Reviews] Response missing 'choices'. Full response: {data}")
            return _fallback_reviews(product_name)

        message = data["choices"][0]["message"]
        raw_content = message.get("content") or message.get("reasoning_content") or ""
        if not raw_content:
            logger.error(f"[Reviews] Model returned empty/null content. Full choice: {data['choices'][0]}")
            return _fallback_reviews(product_name)
        raw_content = raw_content.strip()

        # Strip accidental markdown fences
        if raw_content.startswith("```"):
            raw_content = raw_content.split("```")[1]
            if raw_content.startswith("json"):
                raw_content = raw_content[4:]
            raw_content = raw_content.rsplit("```", 1)[0].strip()

        parsed = json.loads(raw_content)
        logger.info(f"[Reviews] Parsed OK | sentiment={parsed.get('overall_sentiment')} | sources={len(parsed.get('sources', []))}")
        return parsed

    except json.JSONDecodeError as e:
        logger.error(f"[Reviews] Failed to parse LLM JSON: {e}")
        return _fallback_reviews(product_name)
    except httpx.HTTPStatusError as e:
        logger.error(f"[Reviews] HTTP {e.response.status_code}: {e.response.text}")
        return _fallback_reviews(product_name)
    except httpx.RequestError as e:
        logger.error(f"[Reviews] Request error: {e}")
        return _fallback_reviews(product_name)
    except Exception as e:
        logger.error(f"[Reviews] Unexpected error: {e}")
        return _fallback_reviews(product_name)
