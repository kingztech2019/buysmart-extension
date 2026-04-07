import axios from "axios";
import React, { useEffect, useState } from "react";
import Analysis from "./Analysis";
import PageLoader from "../partials/PageLoader";
import PriceComparisonCard from "./PriceComparisonCard";
import type { AnalysisResult, ProductReviewsResult } from "../../types/analysis";

interface SupportedComponentsIn {
  data: any;
}

const BACKEND_URL = "http://localhost:8000";

const SupportedComponents: React.FC<SupportedComponentsIn> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [reviews, setReviews] = useState<ProductReviewsResult | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState("");

  const productName = data?.data?.productName || "";
  const price       = data?.data?.price || "";
  const productImg  = data?.data?.productImg || "";
  const site        = data?.site || "";

  const cacheKey = `bs_result_${productName}`;

  const onSubmit = () => {
    setLoading(true);
    setError("");
    setReviews(null);

    // Analysis
    axios.post<AnalysisResult>(`${BACKEND_URL}/api/v1/product-analysis`, {
      product_name: productName,
      price,
      site,
    })
      .then(({ data: res }) => {
        setResult(res);
        try { localStorage.setItem(cacheKey, JSON.stringify(res)); } catch (_) {}
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setError(
          err.response?.data?.detail ||
          "Failed to connect to BuySmart backend. Is it running?"
        );
      });

    // Reviews — fetched in parallel, shown independently
    setReviewsLoading(true);
    axios.post<ProductReviewsResult>(`${BACKEND_URL}/api/v1/product-reviews`, {
      product_name: productName,
    })
      .then(({ data: rev }) => {
        setReviews(rev);
        setReviewsLoading(false);
      })
      .catch(() => setReviewsLoading(false));
  };

  // Restore cached result
  useEffect(() => {
    if (!productName) return;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) setResult(JSON.parse(cached));
    } catch (_) {}
  }, [productName]);

  const handleReset = () => {
    setResult(null);
    setError("");
    try { localStorage.removeItem(cacheKey); } catch (_) {}
  };

  return (
    <div className="sc-wrapper">
      {loading && <PageLoader msg="Analyzing product..." />}

      {/* ── Product Card (pre-analysis) ── */}
      {!result && (
        <div className="sc-product-section animate-fade-up">
          {productImg && (
            <div className="sc-img-wrapper">
              <img src={productImg} alt={productName} className="sc-product-img" />
              <div className="sc-img-overlay" />
            </div>
          )}

          <div className="sc-product-info">
            <div className="sc-site-badge">
              <span className="badge badge-accent">
                {site.replace(/https?:\/\//, "").split("/")[0] || "Supported Site"}
              </span>
            </div>
            <h2 className="sc-product-name">{productName || "Product Detected"}</h2>
            {price && (
              <div className="sc-price-row">
                <span className="sc-price">{price}</span>
                <span className="badge badge-warning">Listed Price</span>
              </div>
            )}
            {error && (
              <div className="sc-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}
          </div>

          <div className="sc-cta">
            <button
              onClick={onSubmit}
              disabled={loading}
              className="btn btn-primary btn-full sc-analyze-btn"
              id="analyze-product-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Analyze with AI
            </button>
            <p className="sc-cta-hint">Powered by SearXNG + OpenRouter</p>
          </div>
        </div>
      )}

      {/* ── Analysis Result ── */}
      {result && (
        <div className="animate-fade-up">
          <div className="sc-result-header">
            {productImg && (
              <img src={productImg} alt={productName} className="sc-result-thumb" />
            )}
            <div className="sc-result-meta">
              <span className="sc-result-name">{productName}</span>
              {price && <span className="badge badge-warning">{price}</span>}
            </div>
            <button onClick={handleReset} className="btn btn-ghost sc-reset-btn" title="Re-analyze">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
              </svg>
            </button>
          </div>

          <Analysis
            sections={result.sections}
            productSummary={result.product_summary}
            verdict={result.verdict}
            verdictConfidence={result.verdict_confidence}
            reviews={reviews}
            reviewsLoading={reviewsLoading}
          />
          <PriceComparisonCard sources={result.sources} />
        </div>
      )}

      <style>{`
        .sc-wrapper { display: flex; flex-direction: column; height: 100%; overflow-y: auto; }
        .sc-product-section { display: flex; flex-direction: column; }
        .sc-img-wrapper { position: relative; height: 220px; overflow: hidden; background: var(--bg-surface-2); }
        .sc-product-img { width: 100%; height: 100%; object-fit: contain; padding: 16px; }
        .sc-img-overlay { position: absolute; bottom: 0; left: 0; right: 0; height: 60px; background: linear-gradient(to bottom, transparent, var(--bg-primary)); }
        .sc-product-info { padding: 16px 16px 12px; display: flex; flex-direction: column; gap: 10px; }
        .sc-site-badge { display: flex; }
        .sc-product-name { font-size: 15px; font-weight: 700; color: var(--text-primary); line-height: 1.4; }
        .sc-price-row { display: flex; align-items: center; gap: 10px; }
        .sc-price { font-size: 22px; font-weight: 800; color: var(--accent); letter-spacing: -0.02em; }
        .sc-error { display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px; background: rgba(248,81,73,0.1); border: 1px solid rgba(248,81,73,0.3); border-radius: var(--radius-md); font-size: 12px; color: var(--danger); line-height: 1.5; }
        .sc-cta { padding: 14px 16px 24px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .sc-analyze-btn { font-size: 15px; padding: 13px 24px; border-radius: var(--radius-lg); }
        .sc-cta-hint { font-size: 11px; color: var(--text-muted); margin: 0; }
        .sc-result-header { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: var(--bg-surface-2); border-bottom: 1px solid var(--border); }
        .sc-result-thumb { width: 40px; height: 40px; object-fit: contain; border-radius: var(--radius-sm); background: var(--bg-surface-3); padding: 4px; flex-shrink: 0; }
        .sc-result-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .sc-result-name { font-size: 12px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sc-reset-btn { padding: 6px; border-radius: var(--radius-sm); flex-shrink: 0; }
      `}</style>
    </div>
  );
};

export default SupportedComponents;
