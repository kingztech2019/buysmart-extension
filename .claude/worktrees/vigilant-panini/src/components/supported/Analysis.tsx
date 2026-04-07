import React from "react";
import Markdown from "markdown-to-jsx";
import Accordion from "./Accordion";
import ReviewsAccordion from "./ReviewsAccordion";

interface AnalysisProp {
  textResult: string;
  reviewsData?: string;
  reviewsLoading?: boolean;
}
const Analysis: React.FC<AnalysisProp> = ({ textResult, reviewsData, reviewsLoading }) => {
  const markdown =
    "### Product Analysis: Itel A50 64+2 Misty Black\n\n#### Key Specifications:\n- **Processor:** Unisoc T603 Octa-core\n- **RAM:** 2GB\n- **Storage:** 64GB (expandable)\n- **Display:** 6.6-inch IPS LCD, 720x1612 resolution\n- **Camera:** 8MP rear, 5MP front\n- **Battery:** 5000mAh with 10W fast charging\n- **Operating System:** Android 14 (Go edition)\n- **Connectivity:** 4G, Bluetooth, GPS, USB Type-C 2.0\n- **Additional Features:** Fingerprint sensor, face unlock\n\n#### Customer Feedback Summary:\n- **Performance:** Generally positive feedback on the performance given the price point. The Unisoc T603 processor and 2GB RAM are sufficient for basic tasks and light multitasking.\n- **Camera:** Mixed reviews. The 8MP rear and 5MP front cameras are considered adequate for basic photography but not exceptional.\n- **Battery Life:** Highly praised. The 5000mAh battery is noted for its longevity, lasting a full day with moderate use.\n- **Display:** The 6.6-inch HD+ display is appreciated for its size and clarity, though the 720p resolution is considered standard for this price range.\n- **Build Quality:** Positive remarks on the build quality and design, especially the fingerprint sensor and face unlock features.\n- **Value for Money:** Most users find the Itel A50 to be a good value for its price, especially for budget-conscious consumers.\n\n### Price Comparison:\n- **Nigeria:**\n  - **FinetMobile:** \u20a691,000.00\n  - **Jumia:** \u20a691,000.00\n\n- **Ghana:**\n  - **AllRoundReview:** GHs880.98\n\n- **India:**\n  - **AllRoundReview:** INR4,791.99\n\n- **US:**\n  - **AllRoundReview:** $57.38\n\n- **UK:**\n  - **AllRoundReview:** \u00a345.25\n\n- **Philippines:**\n  - **NoypiGeeks:** Php3,199\n  - **PhilNews:** Php3,000\n\n### Recommendation:\nBased on the analysis of customer feedback and the specifications, the Itel A50 64+2 Misty Black is a solid choice for budget-conscious consumers looking for a basic smartphone with decent performance, good battery life, and essential features like a fingerprint sensor and face unlock. The camera quality is average but acceptable for the price range.\n\n### Cheapest Platform:\n- **Philippines:** The cheapest price for the Itel A50 is Php3,000 on PhilNews.\n- **US:** The cheapest price is $57.38 on AllRoundReview.\n- **UK:** The cheapest price is \u00a345.25 on AllRoundReview.\n- **India:** The cheapest price is INR4,791.99 on AllRoundReview.\n- **Nigeria:** Both FinetMobile and Jumia offer the Itel A50 for \u20a691,000.00.\n\nFor the best deal, if you are in the Philippines, purchasing from PhilNews at Php3,000 is the most cost-effective option. For other regions, AllRoundReview provides competitive pricing.";
  const formattedText = markdown.replace(/\n/g, "<br />");
   // Split the response into sections based on headers
   const sections = textResult.split(/(?=### )/);
   const productName = sections.shift() || '';
  return (
    <div className="text-black px-4 leading-8 text-base">
      <h1 className="text-xl font-bold mb-4">
        <Markdown children={productName}>

        </Markdown>
      </h1>

      {sections.map((section, index) => {
        const title = section.match(/### .*/)?.[0] || `Section ${index + 1}`;
        const content = section.replace(/### .*/, '').trim();
        return <Accordion key={index} title={title} content={content}  defaultOpen={index === 0}/>;
      })}
      <ReviewsAccordion reviewsData={reviewsData} reviewsLoading={reviewsLoading} />
      {/* <Markdown options={{ wrapper: "section",overrides:{
        h4: {
            props: {
              className: 'mt-4 font-bold text-lg text-[#8A56EA]',
            },
          },
          h3: {
            props: {
              className: 'mt-4 font-black text-lg text-[#8A56EA]',
            },
          },
           
          li: {
            props: {
              className: 'font-normal',
            },
          },
      } }} className=" ">
        {markdown}
      </Markdown> */}
    </div>
  );
};

export default Analysis;
