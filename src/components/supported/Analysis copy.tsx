import React from "react";
import Markdown from "markdown-to-jsx";
import Accordion from "./Accordion";

interface AnalysisProp {
  textResult: string;
}

const Analysis: React.FC<AnalysisProp> = ({ textResult }) => {
  // Split the response into sections based on "### " headers
  const sections = textResult.split(/(?=### )/);
  const productName = sections.shift() || ''; // Extract the product name (first section)

  // Filter sections to only include up to and including "Recommendations"
  const filteredSections = [];
  let includeSection = true;

  for (const section of sections) {
    if (/### Recommendations/.test(section)) {
      filteredSections.push(section);
      includeSection = false; // Stop including any further sections
      break;
    }else if(/### Conclusion/.test(section)){
      filteredSections.push(section);
      includeSection = false; // Stop including any further sections
      break;
    }else if(/### Recommendation/.test(section)){
      filteredSections.push(section);
      includeSection = false; // Stop including any further sections
      break;
    }

    if (includeSection) {
      filteredSections.push(section);
    }
  }
  const excludeMarker = "Product Review and Price Comparison Report";
  
 
  return (
    <div className="text-black px-4 leading-8 text-base">
      <h1 className="text-xl font-bold mb-4">
        <Markdown>{productName}</Markdown>
      </h1>

      {
         
      filteredSections.map((section, index) => {
       
        const title = section.match(/###.*/)?.[0].replace(/### /, '') || `Section ${index + 1}`;
        let content = section.replace(/###.*/, '').trim();

        // If inside "Recommendations", remove content starting from "Product Review & Price Comparison:"
        // if (title.includes("Recommendations")) {
        //   const recommendationContent = content.split(excludeMarker)[0] || content;
        //   content = recommendationContent;
        // }else if(title.includes("Recommendation")){
        //   const recommendationContent = content.split(excludeMarker)[0] || content;
        //   content = recommendationContent;

        // }else if(title.includes("Conclusion")){
        //   const recommendationContent = content.split(excludeMarker)[0] || content;
        //   content = recommendationContent;

        // }
        return (
          <Accordion key={index} title={title} content={content} defaultOpen={index === 0} />
        );
      })}
    </div>
  );
};

export default Analysis;
