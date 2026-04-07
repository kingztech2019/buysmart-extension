from pydantic import BaseModel
from typing import Optional, List, Literal


class ProductAnalysisRequest(BaseModel):
    product_name: str
    price: Optional[str] = None
    url: Optional[str] = None
    site: Optional[str] = None


# ── Structured analysis section ────────────────────────
SectionKey = Literal[
    "overview",
    "price_analysis",
    "pros",
    "cons",
    "alternatives",
    "recommendation",
]

class AnalysisSection(BaseModel):
    key: SectionKey
    title: str
    content: str  # Markdown content for this section


class ProductAnalysisResponse(BaseModel):
    product_summary: Optional[str] = ""       # One-liner product intro
    verdict: Optional[str] = None             # "buy" | "skip" | "consider"
    verdict_confidence: Optional[str] = None  # "high" | "medium" | "low"
    sections: List[AnalysisSection]
    sources: Optional[List[dict]] = []


# ── Customer Reviews ───────────────────────────────────
class ProductReviewsRequest(BaseModel):
    product_name: str


class ReviewSource(BaseModel):
    platform: str
    title: str
    url: str
    snippet: Optional[str] = ""


class ProductReviewsResponse(BaseModel):
    overall_sentiment: Optional[str] = "mixed"
    summary: Optional[str] = ""
    highlights: Optional[List[str]] = []
    sources: Optional[List[ReviewSource]] = []


# ── Search ─────────────────────────────────────────────
class SearchResult(BaseModel):
    title: str
    url: str
    content: Optional[str] = ""
    engine: Optional[str] = ""
    score: Optional[float] = 0.0
    price: Optional[str] = None       # Confirmed price from shopping engine (or None)
    thumbnail: Optional[str] = None   # Product image URL if returned


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total: int
