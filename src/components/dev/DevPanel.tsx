import React, { useState } from "react";

/**
 * DevPanel — only rendered in dev mode (import.meta.env.DEV).
 *
 * Lets you quickly inject mock product data into chrome.storage.local
 * to test both the "supported site" flow (product auto-detected) and
 * the "unsupported site" flow (manual search).
 */

const PRESETS = [
  {
    label: "Amazon — Sony Headphones",
    data: {
      supportedSiteData: {
        site: "amazon.com",
        data: {
          productName: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
          price: "$279.99",
          productImg:
            "https://m.media-amazon.com/images/I/61vJsT2SORL._AC_SL1500_.jpg",
        },
      },
      noData: null,
    },
  },
  {
    label: "eBay — iPhone 14 Pro",
    data: {
      supportedSiteData: {
        site: "ebay.com",
        data: {
          productName: "Apple iPhone 14 Pro 256GB Deep Purple — Unlocked",
          price: "$749.00",
          productImg:
            "https://i.ebayimg.com/images/g/XkEAAOSwi~JjzBxA/s-l1600.jpg",
        },
      },
      noData: null,
    },
  },
  {
    label: "No product found (NO_DATA)",
    data: {
      supportedSiteData: null,
      noData: "NO_DATA",
    },
  },
  {
    label: "Unsupported / new site",
    data: {
      supportedSiteData: null,
      noData: null,
    },
  },
];

const DevPanel: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [status, setStatus] = useState("");

  const inject = (preset: (typeof PRESETS)[number]) => {
    chrome.storage.local.set(
      {
        supportedSiteData: preset.data.supportedSiteData,
        noData: preset.data.noData,
      },
      () => {
        setStatus(`✅ Loaded: ${preset.label}`);
        setTimeout(() => setStatus(""), 2500);
      }
    );
  };

  const clear = () => {
    chrome.storage.local.remove(["supportedSiteData", "noData"], () => {
      setStatus("🗑️ Cleared storage");
      setTimeout(() => setStatus(""), 2000);
    });
  };

  if (!open) {
    return (
      <button className="dev-fab" onClick={() => setOpen(true)} title="Open DevPanel">
        🛠
      </button>
    );
  }

  return (
    <div className="dev-panel animate-fade-in">
      <div className="dev-panel-header">
        <span>🛠 Dev Panel</span>
        <button className="dev-close" onClick={() => setOpen(false)}>✕</button>
      </div>

      <p className="dev-hint">Inject mock data to test without Chrome extension:</p>

      <div className="dev-presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            className="dev-preset-btn"
            onClick={() => inject(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <button className="dev-clear-btn" onClick={clear}>
        Clear Storage
      </button>

      {status && <div className="dev-status">{status}</div>}

      <style>{`
        .dev-panel {
          position: fixed;
          bottom: 16px;
          right: 16px;
          width: 280px;
          background: #1a1a2e;
          border: 1px solid rgba(124,58,237,0.5);
          border-radius: 12px;
          z-index: 99999;
          font-family: 'Inter', monospace;
          font-size: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.2);
          overflow: hidden;
        }
        .dev-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: rgba(124,58,237,0.2);
          font-weight: 700;
          color: #c4b5fd;
          border-bottom: 1px solid rgba(124,58,237,0.3);
        }
        .dev-close {
          background: none;
          border: none;
          color: #c4b5fd;
          cursor: pointer;
          font-size: 13px;
          padding: 0;
          line-height: 1;
        }
        .dev-hint {
          padding: 8px 12px 4px;
          color: #8b949e;
          margin: 0;
        }
        .dev-presets {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 6px 8px;
        }
        .dev-preset-btn {
          width: 100%;
          text-align: left;
          padding: 7px 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          color: #f0f6fc;
          cursor: pointer;
          font-size: 11px;
          font-family: inherit;
          transition: all 0.15s ease;
        }
        .dev-preset-btn:hover {
          background: rgba(0,212,170,0.1);
          border-color: rgba(0,212,170,0.3);
          color: #00d4aa;
        }
        .dev-clear-btn {
          width: calc(100% - 16px);
          margin: 0 8px 8px;
          padding: 6px;
          background: rgba(248,81,73,0.1);
          border: 1px solid rgba(248,81,73,0.3);
          border-radius: 6px;
          color: #f85149;
          cursor: pointer;
          font-size: 11px;
          font-family: inherit;
          transition: all 0.15s ease;
        }
        .dev-clear-btn:hover {
          background: rgba(248,81,73,0.2);
        }
        .dev-status {
          margin: 0 8px 10px;
          padding: 6px 10px;
          background: rgba(63,185,80,0.1);
          border: 1px solid rgba(63,185,80,0.3);
          border-radius: 6px;
          color: #3fb950;
          font-size: 11px;
        }
        .dev-fab {
          position: fixed;
          bottom: 16px;
          right: 16px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #1a1a2e;
          border: 1px solid rgba(124,58,237,0.5);
          font-size: 18px;
          cursor: pointer;
          z-index: 99999;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
};

export default DevPanel;
