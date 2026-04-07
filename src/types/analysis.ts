/**
 * Shared frontend types that mirror the backend's JSON response schema.
 * Keep in sync with backend/models/schemas.py
 */

export type SectionKey =
  | "overview"
  | "price_analysis"
  | "pros"
  | "cons"
  | "alternatives"
  | "recommendation";

export interface AnalysisSection {
  key: SectionKey;
  title: string;
  content: string;
}

export interface AnalysisResult {
  product_summary?: string;
  verdict?: "buy" | "skip" | "consider";
  verdict_confidence?: "high" | "medium" | "low";
  sections: AnalysisSection[];
  sources: SearchSource[];
}

export interface SearchSource {
  title: string;
  url: string;
  content?: string;
  engine?: string;
  score?: number;
}

export interface ReviewSource {
  platform: string;
  title: string;
  url: string;
  snippet?: string;
}

export interface ProductReviewsResult {
  overall_sentiment?: "positive" | "negative" | "mixed";
  summary?: string;
  highlights?: string[];
  sources?: ReviewSource[];
}
