import React from "react";

interface unsupportedProps {
  data: string;
}
const UnsupportedComponents: React.FC<unsupportedProps> = (data) => {
  console.log(data,"DTA");
  
  return (
    <div>
      <div className="p-4 border-t border-gray-400 mt-4 px-7 py-3">
        <div className="rounded-lg bg-slate-600 px-3 py-3">
          <div className="font-extrabold text-xl text-center">Heads up!</div>
          {data?.data==null ? 
            <p className="font-medium text-base text-justify">
              This site/page isn't supported by our Chrome Extension, but you
              can still search and get recommendation for your product. Some
              popular sites we currently support include <b>Amazon</b>,{" "}
              <b>Ebay</b>,<b>Aliexpress</b>, <b>Walmart</b>, <b>Jumia</b> and{" "}
              <b>Alibaba</b>
            </p>
           : (
            <p className="font-medium text-base text-justify">
              We see you are on one of our supported sites. Head over to a job
              post and this form will auto-populate
            </p>
          )}
        </div>
      </div>
      <div className="px-5 py-2 mt-12">
        <label
          className="font-medium py-2 text-base text-black"
          htmlFor="web_url"
        >
          E-commerce Platform URL
        </label>
        <div className="py-1">
          <input
            type="text"
            id="web_url"
            placeholder="https://awof.com"
            className="appearance-none rounded-md bg-transparent w-full text-black outline-0 py-3 px-3 border border-gray-500"
          />
        </div>
      </div>
      <div className="px-5 py-2 mt-3">
        <label
          className="font-medium py-2 text-base text-black"
          htmlFor="product_name"
        >
          Product Name
        </label>
        <div className="py-1">
          <input
            type="text"
            id="product_name"
            placeholder="brown female shoe"
            className="appearance-none rounded-md bg-transparent w-full text-black outline-0 py-3 px-3 border border-gray-500"
          />
        </div>
      </div>
      <div className="fixed bottom-5 left-1/2 transform w-full flex justify-center items-center -translate-x-1/2 z-50">
        <button className="bg-[#033E3E] rounded-md px-3 py-2 text-lg font-black text-white">
          View Recommendation
        </button>
      </div>
    </div>
  );
};
export default UnsupportedComponents;
