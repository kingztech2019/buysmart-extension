import axios from "axios";
import React, { useState } from "react";
import Analysis from "./Analysis";
import PageLoader from "../partials/PageLoader";

interface SupportedComponentsIn {
  data: any;
}

export interface AnalysisSection {
  key: string;
  title: string;
  content: string;
}

export interface ProductAnalysisData {
  product_summary?: string;
  verdict?: string;
  verdict_confidence?: string;
  sections: AnalysisSection[];
  sources?: any[];
}

export interface ReviewSource {
  platform: string;
  title: string;
  url: string;
  snippet?: string;
}

export interface ProductReviewsData {
  overall_sentiment?: string;
  summary?: string;
  highlights?: string[];
  sources?: ReviewSource[];
}

const SupportedComponents: React.FC<SupportedComponentsIn> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<ProductAnalysisData | null>(null);
  const [reviewsData, setReviewsData] = useState<ProductReviewsData | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const onSubmit = () => {
    setLoading(true);
    const token = localStorage.getItem("brainToken");
    const headers = {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const productName = data?.data?.productName;
    const price = data?.data?.price;

    // Fetch analysis and reviews in parallel
    const analysisPromise = axios({
      method: "post",
      url: `http://localhost:8000/api/v1/product-analysis`,
      headers,
      data: { product_name: productName, price },
    });

    const reviewsPromise = axios({
      method: "post",
      url: `http://localhost:8000/api/v1/product-reviews`,
      headers,
      data: { product_name: productName },
    });

    // Analysis result shown as soon as it arrives
    analysisPromise
      .then((response) => {
        setAnalysisData(response.data);
        setLoading(false);
        console.log("[Analysis]", response.data);
      })
      .catch((error) => {
        setLoading(false);
        console.error("[Analysis] error:", error);
      });

    // Reviews fetched independently — show a spinner inside the accordion
    setReviewsLoading(true);
    reviewsPromise
      .then((response) => {
        setReviewsData(response.data);
        setReviewsLoading(false);
        console.log("[Reviews]", response.data);
      })
      .catch((error) => {
        setReviewsLoading(false);
        console.error("[Reviews] error:", error);
      });
  };

  return (
    <>
      {loading && <PageLoader msg="Please Wait..." />}
      {!analysisData && (
        <div className="flex justify-center items-center mt-8">
          <div className="w-80 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
            <img
              src={data?.data?.productImg}
              alt="Product"
              className="h-80 w-80 object-contain rounded-t-xl"
            />
            <div className="px-4 py-3 w-72">
              <p className="text-base font-medium text-black text-justify block capitalize">
                {data?.data?.productName}
              </p>
              <div className="flex items-center">
                <p className="text-lg font-black text-[#033E3E] cursor-auto my-3">
                  {data?.data?.price}
                </p>
              </div>
            </div>
          </div>

          <div className="fixed bottom-5 left-1/2 transform w-full flex justify-center items-center -translate-x-1/2 z-50">
            <button
              onClick={onSubmit}
              className="bg-[#033E3E] rounded-md px-3 py-2 text-lg font-black text-white"
            >
              View Recommendation
            </button>
          </div>
        </div>
      )}

      {analysisData && (
        <div className="mt-8">
          <Analysis
            analysisData={analysisData}
            reviewsData={reviewsData}
            reviewsLoading={reviewsLoading}
          />
        </div>
      )}
    </>
  );
};

export default SupportedComponents;
