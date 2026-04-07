import React from "react";

interface PriceComparisonCardProps {
  sources: Array<{
    title: string;
    url: string;
    content?: string;
    engine?: string;
  }>;
}

const PriceComparisonCard: React.FC<PriceComparisonCardProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="pcc-wrapper animate-fade-up">
      <div className="pcc-header">
        <div className="pcc-title-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span>Sources & References</span>
        </div>
        <span className="badge badge-accent">{sources.length} found</span>
      </div>

      <div className="pcc-list">
        {sources.slice(0, 6).map((source, i) => {
          let domain = "";
          try {
            domain = new URL(source.url).hostname.replace("www.", "");
          } catch {
            domain = source.engine || "web";
          }

          return (
            <a
              key={i}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pcc-item"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="pcc-item-favicon">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                  alt={domain}
                  width="14"
                  height="14"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="pcc-item-content">
                <span className="pcc-item-title">{source.title || domain}</span>
                <span className="pcc-item-domain">{domain}</span>
              </div>
              <svg className="pcc-item-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M17 7H7M17 7v10"/>
              </svg>
            </a>
          );
        })}
      </div>

      <style>{`
        .pcc-wrapper {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin: 12px 0;
        }
        .pcc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-surface-2);
        }
        .pcc-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .pcc-list {
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .pcc-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: var(--radius-sm);
          text-decoration: none !important;
          transition: var(--transition);
          animation: fadeInUp 0.3s ease both;
        }
        .pcc-item:hover {
          background: var(--bg-surface-2);
        }
        .pcc-item-favicon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-surface-3);
          border-radius: 4px;
          flex-shrink: 0;
        }
        .pcc-item-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .pcc-item-title {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pcc-item-domain {
          font-size: 11px;
          color: var(--text-muted);
        }
        .pcc-item-arrow {
          color: var(--text-muted);
          flex-shrink: 0;
          opacity: 0;
          transition: var(--transition);
        }
        .pcc-item:hover .pcc-item-arrow {
          opacity: 1;
          color: var(--accent);
        }
      `}</style>
    </div>
  );
};

export default PriceComparisonCard;
