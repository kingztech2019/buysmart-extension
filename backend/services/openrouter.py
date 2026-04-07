import httpx
import json
import logging
from typing import List, Optional
from config import get_settings
from models.schemas import AnalysisSection, ProductAnalysisResponse

logger = logging.getLogger(__name__)

# ── System prompt ──────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are BuySmart, an expert AI shopping assistant.

You will be given:
1. A product name and its listed price
2. CONFIRMED PRICE DATA — real prices returned by a live shopping search engine
3. Web search results — numbered entries with Title, URL, Source, and Snippet

Your job is to analyze the product and return a structured JSON response.

IMPORTANT: You must return ONLY valid JSON — no markdown fences, no extra text.

The JSON must follow this exact schema:
{
  "product_summary": "One short sentence describing the product (max 20 words).",
  "verdict": "buy" | "skip" | "consider",
  "verdict_confidence": "high" | "medium" | "low",
  "sections": [
    {
      "key": "overview",
      "title": "Overview",
      "content": "2-3 sentences describing the product, its category, and general reputation."
    },
    {
      "key": "price_analysis",
      "title": "Price Analysis",
      "content": "Compare the listed price against the CONFIRMED PRICE DATA. State which retailer has the best price. Use markdown bullet points. Only cite prices from the CONFIRMED PRICE DATA — do not invent prices."
    },
    {
      "key": "pros",
      "title": "Pros",
      "content": "Markdown bullet list of the product's strengths and positive aspects."
    },
    {
      "key": "cons",
      "title": "Cons",
      "content": "Markdown bullet list of weaknesses, known issues, or concerns."
    },
    {
      "key": "alternatives",
      "title": "Alternatives",
      "content": "Markdown list of 2-3 alternative products found in the search results. For each use this exact format: - [Product Name](url) — PRICE — reason. PRICE must be from CONFIRMED PRICE DATA only; if not found write 'price not confirmed'."
    },
    {
      "key": "recommendation",
      "title": "Recommendation",
      "content": "Clear buying verdict. If a retailer in the search results has the product, link it: [Buy on RetailerName](url). Do NOT mention a specific price unless it is in the CONFIRMED PRICE DATA."
    }
  ]
}

STRICT PRICE RULES:
- For CONFIRMED prices (from shopping engine): quote exactly, e.g. "$279.99 on Amazon".
- For APPROXIMATE prices (from snippets): hedge clearly, e.g. "around $280" or "approximately $749".
- If no price exists for a product: write "price not confirmed" — never invent or guess.
- Do not use training knowledge to cite prices; they are likely years out of date.
- Always embed markdown links [text](url) from the provided search result URLs for alternatives and recommendation.
- Your entire response must be parseable JSON — no text outside the JSON object.
"""


def _build_price_context(results: List[dict]) -> str:
    """
    Build a structured price block from results.
    Three tiers: engine-confirmed > page-scraped > snippet-extracted.
    """
    engine_prices  = [r for r in results if r.get("price_source") == "shopping engine"]
    scraped_prices = [r for r in results if r.get("price_source") == "page scrape"]
    snippet_prices = [r for r in results if r.get("price_source") == "snippet extract"]

    lines = []

    confirmed = [
        r for r in results
        if r.get("price_source") in ("shopping engine", "page scrape", "tavily extract", "tavily search")
    ]
    if confirmed:
        lines.append("CONFIRMED prices (from live shopping engine or scraped product page):")
        for r in confirmed:
            source_tag = "shopping engine" if r["price_source"] == "shopping engine" else "scraped"
            lines.append(f"  • {r['price']} [{source_tag}] — {r['title'][:80]} — {r['url']}")
    else:
        lines.append("CONFIRMED prices: none found.")

    if snippet_prices:
        lines.append("\nAPPROXIMATE prices mentioned in search snippets (use as guidance only):")
        for r in snippet_prices:
            lines.append(f"  ~ {r['price']} — {r['title'][:80]} — {r['url']}")

    if not confirmed and not snippet_prices:
        lines.append("\n⚠ No price data available. Use 'price not confirmed' — never invent prices.")

    return "\n".join(lines)


def _format_search_results(results: List[dict]) -> str:
    if not results:
        return "No search results available."
    lines = []
    for i, r in enumerate(results, 1):
        lines.append(
            f"[{i}] {r.get('title', 'No title')}\n"
            f"    URL: {r.get('url', '')}\n"
            f"    Source: {r.get('engine', '')}\n"
            f"    Snippet: {r.get('content', 'No description')}"
        )
    return "\n\n".join(lines)


def _repair_truncated_json(raw: str, product_name: str) -> Optional[dict]:
    """
    Best-effort repair of a JSON object truncated by a max_tokens cutoff.
    Extracts the top-level fields and any fully-formed section objects.
    Returns a dict on success, None if nothing useful could be recovered.
    """
    import re

    # Pull out top-level scalar fields that came through intact
    result: dict = {"sections": []}
    for field in ("product_summary", "verdict", "verdict_confidence"):
        m = re.search(rf'"{field}"\s*:\s*"([^"]*)"', raw)
        if m:
            result[field] = m.group(1)

    # Extract fully-closed section objects: {...} that contain a "key" field
    for m in re.finditer(r'\{\s*"key"\s*:\s*"[^"]+".+?\}', raw, re.DOTALL):
        candidate = m.group(0)
        try:
            obj = json.loads(candidate)
            if "key" in obj and "content" in obj:
                result["sections"].append(obj)
        except json.JSONDecodeError:
            continue

    if result["sections"]:
        logger.warning(
            f"[OpenRouter] Repaired truncated JSON — recovered {len(result['sections'])} sections"
        )
        return result

    return None


def _fallback_sections(product_name: str) -> ProductAnalysisResponse:
    """Return a minimal structured response when parsing fails."""
    return ProductAnalysisResponse(
        product_summary=f"Analysis for {product_name}",
        verdict="consider",
        verdict_confidence="low",
        sections=[
            AnalysisSection(
                key="overview",
                title="Overview",
                content=f"Could not retrieve a full analysis for **{product_name}**.",
            ),
            AnalysisSection(
                key="recommendation",
                title="Recommendation",
                content="Please try again or check your OpenRouter API key and model configuration.",
            ),
        ],
        sources=[],
    )


async def analyze_product(
    product_name: str,
    price: Optional[str],
    search_results: List[dict],
) -> ProductAnalysisResponse:
    """
    Call OpenRouter to generate a structured JSON product analysis.
    Returns a validated ProductAnalysisResponse.
    """
    settings = get_settings()

    if not settings.openrouter_api_key:
        return ProductAnalysisResponse(
            product_summary="Configuration error",
            verdict="consider",
            verdict_confidence="low",
            sections=[
                AnalysisSection(
                    key="overview",
                    title="Configuration Error",
                    content="OpenRouter API key is not set. Please configure `OPENROUTER_API_KEY` in your `.env` file.",
                )
            ],
        )

    price_text = f"Listed price: **{price}**" if price else "Listed price: *not provided*"
    price_context = _build_price_context(search_results)
    search_context = _format_search_results(search_results)

    # Log what price data we're passing to the LLM
    confirmed_count = len([r for r in search_results if r.get("price")])
    logger.info(
        f"[OpenRouter] Building prompt | confirmed prices: {confirmed_count}/{len(search_results)} results"
    )
    if confirmed_count == 0:
        logger.warning(
            "[OpenRouter] No confirmed prices from SearXNG — LLM instructed to use 'price not confirmed'"
        )

    user_message = (
        f"Product: {product_name}\n"
        f"{price_text}\n\n"
        f"═══ CONFIRMED PRICE DATA ═══\n"
        f"{price_context}\n\n"
        f"═══ WEB SEARCH RESULTS ═══\n"
        f"{search_context}\n\n"
        f"Return your analysis as JSON. Remember: only use prices from CONFIRMED PRICE DATA."
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
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        "temperature": 0.2,
        "max_tokens": 4000,
        "response_format": {"type": "json_object"},
    }

    try:
        logger.info(f"[OpenRouter] Sending request to model: {settings.openrouter_model}")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.openrouter_base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

        if not data.get("choices"):
            logger.error(f"[OpenRouter] Response missing 'choices'. Full response: {data}")
            return _fallback_sections(product_name)

        message = data["choices"][0]["message"]
        raw_content = message.get("content") or message.get("reasoning_content") or ""
        if not raw_content:
            logger.error(f"[OpenRouter] Model returned empty/null content. Full choice: {data['choices'][0]}")
            return _fallback_sections(product_name)
        raw_content = raw_content.strip()
        logger.info(f"[OpenRouter] Raw response (first 400 chars):\n{raw_content[:400]}")

        # Strip any accidental markdown fences the model may add despite instructions
        if raw_content.startswith("```"):
            raw_content = raw_content.split("```")[1]
            if raw_content.startswith("json"):
                raw_content = raw_content[4:]
            raw_content = raw_content.rsplit("```", 1)[0].strip()

        try:
            parsed = json.loads(raw_content)
        except json.JSONDecodeError:
            # Response was truncated mid-token — attempt to salvage complete sections
            parsed = _repair_truncated_json(raw_content, product_name)
            if parsed is None:
                logger.error("[OpenRouter] Could not repair truncated JSON — using fallback")
                return _fallback_sections(product_name)

        # Validate & build typed response
        sections = [
            AnalysisSection(
                key=s["key"],
                title=s.get("title", s["key"].replace("_", " ").title()),
                content=s.get("content", ""),
            )
            for s in parsed.get("sections", [])
        ]

        logger.info(
            f"[OpenRouter] Parsed OK | verdict={parsed.get('verdict')} | "
            f"sections={[s.key for s in sections]}"
        )

        return ProductAnalysisResponse(
            product_summary=parsed.get("product_summary", ""),
            verdict=parsed.get("verdict"),
            verdict_confidence=parsed.get("verdict_confidence"),
            sections=sections,
            sources=search_results,
        )

    except httpx.HTTPStatusError as e:
        logger.error(f"[OpenRouter] HTTP {e.response.status_code}: {e.response.text}")
        return _fallback_sections(product_name)
    except httpx.RequestError as e:
        logger.error(f"[OpenRouter] Request error: {e}")
        return _fallback_sections(product_name)
    except Exception as e:
        logger.error(f"[OpenRouter] Unexpected error: {e}")
        return _fallback_sections(product_name)
