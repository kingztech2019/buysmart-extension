import Markdown from 'markdown-to-jsx';
import React, { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';


interface AccordionProps {
  title: string;
  content: string;
  defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, content,defaultOpen }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (isOpen) {
      const links = document.querySelectorAll(`li.font-normal a`);
      links.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });
    }
  }, [isOpen]);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

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

  return (

    <div className="border border-gray-300 rounded mb-2">
    <button
      onClick={toggleAccordion}
      className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 focus:outline-none flex justify-between items-center"
    >
     
         <Markdown options={{ wrapper: "section",overrides:{
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
        {title}
      </Markdown>
       
      <span>{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
    </button>
    {isOpen && (
      <div className="p-4">
        {/* <div dangerouslySetInnerHTML={{ __html: content }} /> */}
        <Markdown options={{ wrapper: "section",overrides:{
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
        {content}
      </Markdown>
      </div>
    )}
  </div>
     
  );
};

export default Accordion;
