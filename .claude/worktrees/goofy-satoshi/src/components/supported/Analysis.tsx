import React from "react";
import Markdown from "markdown-to-jsx";
import Accordion from "./Accordion";
import { ProductAnalysisData, ProductReviewsData } from "./SupportedComponents";

interface AnalysisProp {
  analysisData: ProductAnalysisData;
  reviewsData?: ProductReviewsData | null;
  reviewsLoading?: boolean;
}

const sentimentColor: Record<string, string> = {
  positive: "#22c55e",
  negative: "#ef4444",
  mixed: "#f59e0b",
};

const sentimentLabel: Record<string, string> = {
  positive: "Mostly Positive",
  negative: "Mostly Negative",
  mixed: "Mixed Reviews",
};

function buildReviewsContent(reviewsData: ProductReviewsData): string {
  const sentiment = reviewsData.overall_sentiment || "mixed";
  const color = sentimentColor[sentiment] || "#f59e0b";
  const label = sentimentLabel[sentiment] || "Mixed Reviews";

  const lines: string[] = [];

  lines.push(`**Overall Sentiment:** <span style="color:${color};font-weight:700">${label}</span>\n`);

  if (reviewsData.summary) {
    lines.push(`${reviewsData.summary}\n`);
  }

  if (reviewsData.highlights && reviewsData.highlights.length > 0) {
    lines.push(`\n**Key Highlights:**`);
    reviewsData.highlights.forEach((h) => lines.push(`- ${h}`));
  }

  if (reviewsData.sources && reviewsData.sources.length > 0) {
    lines.push(`\n**Sources:**`);
    reviewsData.sources.forEach((s) => {
      const snippet = s.snippet ? ` — *${s.snippet}*` : "";
      lines.push(`- [${s.title}](${s.url}) *(${s.platform})*${snippet}`);
    });
  }

  return lines.join("\n");
}

const Analysis: React.FC<AnalysisProp> = ({ analysisData, reviewsData, reviewsLoading }) => {
  const verdictColors: Record<string, string> = {
    buy: "bg-green-100 text-green-800",
    skip: "bg-red-100 text-red-800",
    consider: "bg-yellow-100 text-yellow-800",
  };

  const reviewsContent = reviewsData ? buildReviewsContent(reviewsData) : "";

  return (
    <div className="text-black px-4 leading-8 text-base">
      {/* Product summary + verdict badge */}
      {analysisData.product_summary && (
        <div className="mb-4 flex flex-col gap-2">
          <h1 className="text-lg font-bold">
            <Markdown>{analysisData.product_summary}</Markdown>
          </h1>
          {analysisData.verdict && (
            <span
              className={`inline-block self-start px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                verdictColors[analysisData.verdict] || "bg-gray-100 text-gray-700"
              }`}
            >
              Verdict: {analysisData.verdict}
              {analysisData.verdict_confidence
                ? ` (${analysisData.verdict_confidence} confidence)`
                : ""}
            </span>
          )}
        </div>
      )}

      {/* Analysis sections */}
      {analysisData.sections.map((section, index) => (
        <Accordion
          key={section.key}
          title={`### ${section.title}`}
          content={section.content}
          defaultOpen={index === 0}
        />
      ))}

      {/* Customer Reviews accordion */}
      <Accordion
        key="customer_reviews"
        title="### Customer Reviews"
        content={
          reviewsLoading
            ? "*Fetching reviews from Reddit, forums, and e-commerce platforms...*"
            : reviewsContent || "*No reviews found for this product.*"
        }
        defaultOpen={false}
      />
    </div>
  );
};

export default Analysis;
