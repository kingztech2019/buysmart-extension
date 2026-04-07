import React from "react";
import "./Loader.css";

interface PageLoaderProps {
  msg?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ msg = "Analyzing..." }) => {
  return (
    <div className="page-loader-overlay animate-fade-in">
      <div className="page-loader-card">
        <div className="loader-spinner" />
        <div className="loader-content">
          <p className="loader-msg">{msg}</p>
          <p className="loader-sub">Searching the web & consulting AI...</p>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;