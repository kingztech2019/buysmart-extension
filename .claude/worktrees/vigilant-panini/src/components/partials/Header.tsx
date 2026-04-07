import React, { useState } from "react";

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeSidebar = () => {
    window.parent.postMessage("close-sidebar", "*");
  };

   

  return (
    <div id="my-sidebar" className="relative h-full  text-white">
      <div className="flex items-center  justify-between  p-4 bg-[#26A69A]">
        <button
          onClick={closeSidebar}
          className="text-white focus:outline-none text-5xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-9"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </button>
        <span className="text-xl font-bold">BUY SMART</span>
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="text-white focus:outline-none text-4xl"
          >
            &#9776;
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg">
              <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                Option 1
              </a>
              <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                Option 2
              </a>
              <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                Option 3
              </a>
            </div>
          )}
        </div>
      </div>

      
    </div>
  );
};

export default Header;
