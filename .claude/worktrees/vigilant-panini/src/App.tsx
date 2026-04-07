import React, { useEffect, useState } from "react";
import Header from "./components/partials/Header";
 import SupportedComponents from "./components/supported/SupportedComponents";
import UnsupportedComponents from "./components/unsupported/UnsupportedComponents";

const App: React.FC = () => {
  const [siteData, setSiteData] = useState<any>(null);
  const [noData,setNoData] = useState<any>(null)

  useEffect(() => {
    const fetchData = () => {
      chrome.storage.local.get("supportedSiteData", (result) => {
        if (result.supportedSiteData) {
          setSiteData(result.supportedSiteData);
        } else {
          setSiteData(null);
        }
      });
      chrome.storage.local.get("noData", (result) => {
        if (result.noData) {
          setNoData(result.noData);
        } else {
          setNoData(null);
        }
      });
    };

    chrome.cookies.get({ url: 'http://localhost:3000', name: 'token' }, (cookie) => {
      if (cookie) {
        console.log(cookie,"COOKIES");
        
        // Use the token to make authenticated requests
      } else {
        // User is not authenticated
        console.log("GET OUT JOOR");
      }
    });

    // Listen for changes in storage to update the state in real-time
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.supportedSiteData) {
        setSiteData(changes.supportedSiteData.newValue);
      }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.noData) {
        setNoData(changes.noData.newValue);
      }
    });

    fetchData();
  }, []);

  console.log(noData, "SITE");

  return (
    <>
      <Header />
      <div className="h-full">
        {siteData &&noData!=="NO_DATA" ? (
          <div>
            <SupportedComponents data={siteData} />
          </div>
        ) : (
          <div>
            <UnsupportedComponents data={noData} />
          </div>
        )}
      </div>
    </>
  );
};

export default App;
