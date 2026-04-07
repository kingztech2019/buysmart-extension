import axios from "axios";
import React, { useState } from "react";
import PageLoader from "../partials/PageLoader";
import Analysis from "../supported/Analysis";
import PriceComparisonCard from "../supported/PriceComparisonCard";
import type { AnalysisResult } from "../../types/analysis";

interface UnsupportedProps {
  data: string | null;
}

const BACKEND_URL = "http://localhost:8000";

const UnsupportedComponents: React.FC<UnsupportedProps> = ({ data }) => {
  const [productName, setProductName] = useState("");
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<AnalysisResult | null>(null);
  const [error, setError]             = useState("");

  const isOnSupportedSite = data === null;

  const onSubmit = () => {
    if (!productName.trim()) { setError("Please enter a product name."); return; }
    setLoading(true);
    setError("");

    axios.post<AnalysisResult>(`${BACKEND_URL}/api/v1/product-analysis`, {
      product_name: productName.trim(),
    })
      .then(({ data: res }) => {
        setResult(res);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setError(
          err.response?.data?.detail ||
          "Failed to reach the BuySmart backend. Is it running?"
        );
      });
  };

  const handleReset = () => {
    setResult(null);
    setProductName("");
    setError("");
  };

  return (
    <div className="uc-wrapper">
      {loading && <PageLoader msg="Searching & analyzing..." />}

      {/* ── Result view ── */}
      {result ? (
        <div className="animate-fade-up">
          <div className="uc-result-header">
            <div className="uc-result-meta">
              <span className="badge badge-accent">Manual Search</span>
              <span className="uc-result-query">{productName}</span>
            </div>
            <button onClick={handleReset} className="btn btn-ghost" style={{ padding: '6px 8px' }} title="Search again">
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
          />
          <PriceComparisonCard sources={result.sources} />
        </div>
      ) : (
        /* ── Search Form ── */
        <div className="uc-form-wrapper animate-fade-up">
          <div className="uc-notice">
            <div className="uc-notice-icon">
              {isOnSupportedSite ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              )}
            </div>
            <div className="uc-notice-content">
              <p className="uc-notice-title">
                {isOnSupportedSite ? "Navigate to a product page" : "Unsupported site"}
              </p>
              <p className="uc-notice-body">
                {isOnSupportedSite
                  ? "Head to a product listing on Amazon, eBay, AliExpress, Walmart, or Jumia and we'll auto-detect it."
                  : "This site isn't auto-detected. Use the search below — we support any product!"}
              </p>
            </div>
          </div>

          {!isOnSupportedSite && (
            <div className="uc-supported-sites">
              <span className="uc-sites-label">Auto-supported:</span>
              {["Amazon", "eBay", "AliExpress", "Walmart", "Jumia"].map((s) => (
                <span key={s} className="badge badge-purple">{s}</span>
              ))}
            </div>
          )}

          <div className="uc-form">
            <h3 className="uc-form-title">Search Any Product</h3>
            <p className="uc-form-subtitle">Enter a product name and we'll find prices and reviews across the web.</p>

            <div className="input-group" style={{ marginTop: 16 }}>
              <label className="input-label" htmlFor="product_name">Product Name</label>
              <input
                type="text"
                id="product_name"
                className="input-field"
                placeholder='e.g. "Sony WH-1000XM5 headphones"'
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              />
            </div>

            {error && (
              <div className="uc-error">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button
              onClick={onSubmit}
              disabled={loading || !productName.trim()}
              className="btn btn-primary btn-full"
              style={{ marginTop: 16, padding: '13px', borderRadius: 'var(--radius-lg)', fontSize: 15 }}
              id="manual-search-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Search & Analyze
            </button>
            <p className="uc-powered-by">Powered by SearXNG + OpenRouter AI</p>
          </div>
        </div>
      )}

      <style>{`
        .uc-wrapper { overflow-y: auto; height: 100%; }
        .uc-form-wrapper { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
        .uc-notice { display: flex; gap: 12px; padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); }
        .uc-notice-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--accent-dim); border: 1px solid var(--border-accent); border-radius: var(--radius-md); color: var(--accent); flex-shrink: 0; }
        .uc-notice-content { display: flex; flex-direction: column; gap: 4px; }
        .uc-notice-title { font-size: 13px; font-weight: 700; color: var(--text-primary); margin: 0; }
        .uc-notice-body { font-size: 12px; color: var(--text-secondary); margin: 0; line-height: 1.5; }
        .uc-supported-sites { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
        .uc-sites-label { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .uc-form { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 18px; }
        .uc-form-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
        .uc-form-subtitle { font-size: 12px; color: var(--text-secondary); margin: 0; }
        .uc-error { display: flex; align-items: center; gap: 6px; margin-top: 10px; padding: 8px 12px; background: rgba(248,81,73,0.1); border: 1px solid rgba(248,81,73,0.3); border-radius: var(--radius-md); font-size: 12px; color: var(--danger); }
        .uc-powered-by { text-align: center; font-size: 11px; color: var(--text-muted); margin-top: 10px; margin-bottom: 0; }
        .uc-result-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--bg-surface-2); border-bottom: 1px solid var(--border); }
        .uc-result-meta { display: flex; flex-direction: column; gap: 4px; }
        .uc-result-query { font-size: 13px; font-weight: 600; color: var(--text-primary); }
      `}</style>
    </div>
  );
};

export default UnsupportedComponents;
