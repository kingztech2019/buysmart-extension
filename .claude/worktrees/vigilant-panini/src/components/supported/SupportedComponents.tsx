import axios from "axios";
import React, { useState } from "react";
import Analysis from "./Analysis";
import PageLoader from "../partials/PageLoader";

interface SupportedComponentsIn {
  data: any;
}

const SupportedComponents: React.FC<SupportedComponentsIn> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");
  const [reviewsData, setReviewsData] = useState("");
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const onSubmit = () => {
    setLoading(true);
    const token = localStorage.getItem("brainToken");
    const headers = {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const analysisConfig = {
      method: "post",
      url: `http://localhost:5000/api/v1/product-analysis`,
      headers: headers,
      data: { product_name: data?.data?.productName, price: data?.data?.price },
    };

    const reviewsConfig = {
      method: "post",
      url: `http://localhost:5000/api/v1/product-reviews`,
      headers: headers,
      data: { product_name: data?.data?.productName },
    };

    axios(analysisConfig)
      .then(function (response) {
        setResultData(response.data?.result);
        setLoading(false);
      })
      .catch(function (error) {
        setLoading(false);
        console.log(error);
      });

    setReviewsLoading(true);
    axios(reviewsConfig)
      .then(function (response) {
        setReviewsData(response.data?.result);
        setReviewsLoading(false);
      })
      .catch(function (error) {
        setReviewsLoading(false);
        console.log(error);
      });
  };
  return (
    <>
    {loading&&<PageLoader msg="Please Wait..."/>}
      {resultData == "" && (
        <div className="flex justify-center items-center mt-8">
          <div className="w-80   bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
            <img
              src={data?.data?.productImg}
              alt="Product"
              className="h-80 w-80 object-contain rounded-t-xl"
            />
            <div className="px-4 py-3 w-72">
              {/* <span className="text-gray-400 mr-3 uppercase text-xs">Brand</span> */}
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
         
          <div className="fixed  bottom-5 left-1/2 transform w-full flex justify-center items-center -translate-x-1/2 z-50">
            <button
              onClick={onSubmit}
              className="bg-[#033E3E] rounded-md px-3 py-2 text-lg font-black text-white"
            >
              View Recommendation
            </button>
          </div>
        </div>
      )}

      {resultData !== "" && (
        <div className="mt-8">
          <Analysis textResult={resultData} reviewsData={reviewsData} reviewsLoading={reviewsLoading} />
        </div>
      )}
    </>
  );
};

export default SupportedComponents;
