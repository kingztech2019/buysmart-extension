import React from "react";
import Accordion from "./Accordion";
import type { AnalysisSection, SectionKey, ProductReviewsResult } from "../../types/analysis";

// ── Section metadata lookup (keyed by backend `key` field) ──────
interface SectionMeta {
  icon: JSX.Element;
  badgeClass: string;
}

const SECTION_META: Record<SectionKey, SectionMeta> = {
  overview: {
    badgeClass: "badge-purple",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  price_analysis: {
    badgeClass: "badge-warning",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
  },
  pros: {
    badgeClass: "badge-success",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  cons: {
    badgeClass: "badge-danger",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
  },
  alternatives: {
    badgeClass: "badge-accent",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
        <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
      </svg>
    ),
  },
  recommendation: {
    badgeClass: "badge-accent",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
};

const REVIEWS_ICON = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

const SENTIMENT_CONFIG = {
  positive: { label: "Mostly Positive", cls: "sentiment-positive" },
  negative: { label: "Mostly Negative", cls: "sentiment-negative" },
  mixed:    { label: "Mixed Reviews",   cls: "sentiment-mixed" },
} as const;

function buildReviewsMarkdown(r: ProductReviewsResult): string {
  const lines: string[] = [];

  if (r.summary) lines.push(r.summary, "");

  if (r.highlights?.length) {
    lines.push("**Key Highlights:**");
    r.highlights.forEach(h => lines.push(`- ${h}`));
    lines.push("");
  }

  if (r.sources?.length) {
    lines.push("**Sources:**");
    r.sources.forEach(s => {
      const snippet = s.snippet ? ` — *${s.snippet}*` : "";
      lines.push(`- [${s.title}](${s.url}) *(${s.platform})*${snippet}`);
    });
  }

  return lines.join("\n");
}

const VERDICT_CONFIG = {
  buy:      { label: "Buy It",   cls: "badge-success" },
  consider: { label: "Consider", cls: "badge-warning" },
  skip:     { label: "Skip It",  cls: "badge-danger"  },
} as const;

// ── Props ────────────────────────────────────────────────────────
interface AnalysisProps {
  sections: AnalysisSection[];
  productSummary?: string;
  verdict?: "buy" | "skip" | "consider";
  verdictConfidence?: "high" | "medium" | "low";
  reviews?: ProductReviewsResult | null;
  reviewsLoading?: boolean;
}

// ── Component ────────────────────────────────────────────────────
const Analysis: React.FC<AnalysisProps> = ({
  sections,
  productSummary,
  verdict,
  verdictConfidence,
  reviews,
  reviewsLoading,
}) => {
  const verdictCfg = verdict ? VERDICT_CONFIG[verdict] : null;
  const sentimentCfg = reviews?.overall_sentiment
    ? SENTIMENT_CONFIG[reviews.overall_sentiment]
    : null;

  const reviewsContent = reviewsLoading
    ? "*Fetching reviews from Reddit, forums, and e-commerce platforms…*"
    : reviews
    ? buildReviewsMarkdown(reviews)
    : "*No customer reviews found for this product.*";

  return (
    <div className="analysis-wrapper animate-fade-up">

      {/* Product summary + verdict banner */}
      {(productSummary || verdictCfg) && (
        <div className="analysis-banner">
          {productSummary && (
            <p className="analysis-summary">{productSummary}</p>
          )}
          {verdictCfg && (
            <div className="analysis-verdict-row">
              <span className={`badge ${verdictCfg.cls} analysis-verdict-badge`}>
                {verdictCfg.label}
              </span>
              {verdictConfidence && (
                <span className="analysis-confidence">
                  {verdictConfidence} confidence
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Analysis sections */}
      <div className="analysis-sections">
        {sections.map((section, index) => {
          const meta = SECTION_META[section.key] ?? {
            icon: undefined,
            badgeClass: "badge-accent",
          };
          return (
            <Accordion
              key={section.key}
              title={section.title}
              content={section.content}
              icon={meta.icon}
              badgeClass={meta.badgeClass}
              defaultOpen={index === 0}
              delay={index * 60}
            />
          );
        })}

        {/* Customer Reviews accordion */}
        <div className="reviews-accordion-wrapper">
          {sentimentCfg && (
            <span className={`reviews-sentiment-pill ${sentimentCfg.cls}`}>
              {sentimentCfg.label}
            </span>
          )}
          {reviewsLoading && (
            <span className="reviews-loading-pill">Loading reviews…</span>
          )}
          <Accordion
            key="customer_reviews"
            title="Customer Reviews"
            content={reviewsContent}
            icon={REVIEWS_ICON}
            badgeClass="badge-blue"
            defaultOpen={false}
            delay={sections.length * 60}
          />
        </div>
      </div>

      <style>{`
        .analysis-wrapper { padding: 12px 14px 80px; display: flex; flex-direction: column; gap: 12px; }
        .analysis-banner { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
        .analysis-summary { font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.5; }
        .analysis-verdict-row { display: flex; align-items: center; gap: 8px; }
        .analysis-verdict-badge { font-size: 12px; padding: 4px 10px; }
        .analysis-confidence { font-size: 11px; color: var(--text-muted); text-transform: capitalize; }
        .analysis-sections { display: flex; flex-direction: column; gap: 6px; }
        .reviews-accordion-wrapper { position: relative; }
        .reviews-sentiment-pill {
          position: absolute; top: 10px; right: 36px;
          font-size: 10px; font-weight: 600; padding: 2px 8px;
          border-radius: 999px; z-index: 1; pointer-events: none;
        }
        .reviews-loading-pill {
          position: absolute; top: 10px; right: 36px;
          font-size: 10px; font-weight: 600; padding: 2px 8px;
          border-radius: 999px; background: var(--bg-surface-3);
          color: var(--text-muted); z-index: 1; pointer-events: none;
        }
        .sentiment-positive { background: rgba(34,197,94,0.15); color: #22c55e; }
        .sentiment-negative { background: rgba(239,68,68,0.15); color: #ef4444; }
        .sentiment-mixed    { background: rgba(234,179,8,0.15);  color: #eab308; }
        .badge-blue { background: rgba(59,130,246,0.15); color: #3b82f6; }
      `}</style>
    </div>
  );
};

export default Analysis;
