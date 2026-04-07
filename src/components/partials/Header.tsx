import React, { useState } from "react";

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeSidebar = () => {
    window.parent.postMessage("close-sidebar", "*");
  };

  return (
    <header className="bs-header">
      {/* Gradient accent line at top */}
      <div className="bs-header-accent-bar" />

      <div className="bs-header-inner">
        {/* Left: Close button */}
        <button
          onClick={closeSidebar}
          className="bs-icon-btn"
          title="Close sidebar"
          id="close-sidebar-btn"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Center: Logo + Brand */}
        <div className="bs-brand">
          <div className="bs-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="bs-brand-name">
            Buy<span className="bs-brand-accent">Smart</span>
          </span>
          <span className="badge badge-accent" style={{ fontSize: '9px', padding: '2px 6px' }}>AI</span>
        </div>

        {/* Right: Menu */}
        <div className="bs-menu-wrapper">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="bs-icon-btn"
            title="Menu"
            id="header-menu-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1" fill="currentColor"/>
              <circle cx="12" cy="12" r="1" fill="currentColor"/>
              <circle cx="12" cy="19" r="1" fill="currentColor"/>
            </svg>
          </button>

          {menuOpen && (
            <div className="bs-dropdown animate-fade-in" id="header-dropdown">
              <a
                href="https://github.com/buysmart-extension"
                target="_blank"
                rel="noopener noreferrer"
                className="bs-dropdown-item"
                onClick={() => setMenuOpen(false)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a
                href="https://openrouter.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="bs-dropdown-item"
                onClick={() => setMenuOpen(false)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Get API Key
              </a>
              <div className="divider" style={{ margin: '4px 0' }} />
              <div className="bs-dropdown-version">v1.0.0 · Open Source</div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .bs-header {
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .bs-header-accent-bar {
          height: 2px;
          background: linear-gradient(90deg, var(--accent) 0%, var(--accent-secondary) 100%);
          background-size: 200% 200%;
          animation: gradient-shift 4s ease infinite;
        }
        .bs-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
        }
        .bs-brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bs-logo {
          width: 32px;
          height: 32px;
          background: var(--accent-dim);
          border: 1px solid var(--border-accent);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
        }
        .bs-brand-name {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .bs-brand-accent {
          color: var(--accent);
        }
        .bs-icon-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition);
        }
        .bs-icon-btn:hover {
          background: var(--bg-surface-2);
          border-color: var(--border);
          color: var(--text-primary);
        }
        .bs-menu-wrapper {
          position: relative;
        }
        .bs-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          width: 180px;
          background: var(--bg-surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          padding: 6px;
          z-index: 200;
        }
        .bs-dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          color: var(--text-secondary) !important;
          text-decoration: none !important;
          transition: var(--transition);
          cursor: pointer;
        }
        .bs-dropdown-item:hover {
          background: var(--bg-surface-3);
          color: var(--text-primary) !important;
          text-decoration: none !important;
        }
        .bs-dropdown-version {
          padding: 4px 10px;
          font-size: 11px;
          color: var(--text-muted);
        }
      `}</style>
    </header>
  );
};

export default Header;
