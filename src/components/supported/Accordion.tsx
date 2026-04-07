import Markdown from "markdown-to-jsx";
import React, { useRef, useState } from "react";

interface AccordionProps {
  title: string;
  content: string;
  defaultOpen?: boolean;
  icon?: JSX.Element;
  badgeClass?: string;
  delay?: number;
}

const markdownOverrides = {
  h3: { props: { className: "acc-md-h3" } },
  h4: { props: { className: "acc-md-h4" } },
  li: { props: { className: "acc-md-li" } },
  a: {
    props: {
      target: "_blank",
      rel: "noopener noreferrer",
      className: "acc-md-link",
    },
  },
  p: { props: { className: "acc-md-p" } },
};

const Accordion: React.FC<AccordionProps> = ({
  title,
  content,
  defaultOpen = false,
  icon,
  badgeClass = "badge-accent",
  delay = 0,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`acc-wrapper ${isOpen ? "acc-open" : ""} animate-fade-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="acc-trigger"
        id={`accordion-${title.replace(/\s+/g, "-").toLowerCase()}`}
      >
        <div className="acc-trigger-left">
          {icon && (
            <span className={`badge ${badgeClass} acc-icon-badge`}>
              {icon}
            </span>
          )}
          <span className="acc-title">{title}</span>
        </div>
        <span className={`acc-chevron ${isOpen ? "acc-chevron-open" : ""}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>

      <div className={`acc-body ${isOpen ? "acc-body-open" : ""}`} ref={contentRef}>
        <div className="acc-content markdown-content">
          <Markdown
            options={{
              wrapper: "section",
              overrides: markdownOverrides,
            }}
          >
            {content}
          </Markdown>
        </div>
      </div>

      <style>{`
        .acc-wrapper {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: border-color 0.2s ease;
        }
        .acc-wrapper.acc-open {
          border-color: var(--border-accent);
        }
        .acc-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: var(--transition);
        }
        .acc-trigger:hover {
          background: var(--bg-surface-2);
        }
        .acc-trigger-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .acc-icon-badge {
          padding: 4px 6px;
          border-radius: 6px;
        }
        .acc-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          text-align: left;
        }
        .acc-chevron {
          color: var(--text-muted);
          transition: transform 0.25s ease;
          flex-shrink: 0;
        }
        .acc-chevron-open {
          transform: rotate(180deg);
          color: var(--accent);
        }
        .acc-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .acc-body-open {
          max-height: 600px;
        }
        .acc-content {
          padding: 0 14px 14px;
          border-top: 1px solid var(--border);
          padding-top: 12px;
        }
        .acc-md-h3, .acc-md-h4 {
          font-size: 13px;
          font-weight: 700;
          color: var(--accent);
          margin: 10px 0 6px;
        }
        .acc-md-p {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 6px;
          line-height: 1.7;
        }
        .acc-md-li {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 4px;
          line-height: 1.6;
        }
        .acc-md-link {
          color: var(--accent) !important;
          text-decoration: none;
        }
        .acc-md-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Accordion;
