import React, { useEffect, useState } from "react";
import Header from "./components/partials/Header";
import SupportedComponents from "./components/supported/SupportedComponents";
import UnsupportedComponents from "./components/unsupported/UnsupportedComponents";

// Lazy-load DevPanel — only bundled during dev builds
const DevPanel = import.meta.env.DEV
  ? React.lazy(() => import("./components/dev/DevPanel"))
  : null;

const App: React.FC = () => {
  const [siteData, setSiteData] = useState<any>(null);
  const [noData, setNoData]     = useState<any>(null);

  useEffect(() => {
    const fetchData = () => {
      chrome.storage.local.get("supportedSiteData", (result) => {
        setSiteData(result.supportedSiteData ?? null);
      });
      chrome.storage.local.get("noData", (result) => {
        setNoData(result.noData ?? null);
      });
    };

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;
      if (changes.supportedSiteData !== undefined) {
        setSiteData(changes.supportedSiteData.newValue ?? null);
      }
      if (changes.noData !== undefined) {
        setNoData(changes.noData.newValue ?? null);
      }
    });

    fetchData();
  }, []);

  const showSupported = siteData && noData !== "NO_DATA";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Header />
      <div style={{ flex: 1, overflow: "hidden" }}>
        {showSupported ? (
          <SupportedComponents data={siteData} />
        ) : (
          <UnsupportedComponents data={noData} />
        )}
      </div>

      {/* Dev-only testing panel — tree-shaken from production build */}
      {DevPanel && (
        <React.Suspense fallback={null}>
          <DevPanel />
        </React.Suspense>
      )}
    </div>
  );
};

export default App;
