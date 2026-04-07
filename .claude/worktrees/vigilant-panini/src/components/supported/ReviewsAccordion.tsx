import Markdown from 'markdown-to-jsx';
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface ReviewsAccordionProps {
  reviewsData?: string;
  reviewsLoading?: boolean;
}

const markdownOverrides = {
  h4: { props: { className: 'mt-4 font-bold text-lg text-[#8A56EA]' } },
  h3: { props: { className: 'mt-4 font-black text-lg text-[#8A56EA]' } },
  li: { props: { className: 'font-normal' } },
};

const ReviewsAccordion: React.FC<ReviewsAccordionProps> = ({ reviewsData, reviewsLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-300 rounded mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 focus:outline-none flex justify-between items-center"
      >
        <Markdown options={{ wrapper: 'section', overrides: markdownOverrides }}>
          ### Customer Reviews Across Platforms
        </Markdown>
        <span>{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>

      {isOpen && (
        <div className="p-4">
          {reviewsLoading && (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <div className="w-6 h-6 border-4 border-[#8A56EA] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Fetching reviews from Reddit, forums & platforms...</p>
            </div>
          )}

          {!reviewsLoading && !reviewsData && (
            <p className="text-sm text-gray-400 italic">No reviews found for this product.</p>
          )}

          {!reviewsLoading && reviewsData && (
            <Markdown options={{ wrapper: 'section', overrides: markdownOverrides }}>
              {reviewsData}
            </Markdown>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsAccordion;
