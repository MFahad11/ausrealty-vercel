import React, { useState } from "react";

const Tooltip = ({ text, tooltip,className }:{
  text: string,
  tooltip: string,
  className?: string
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)} // For keyboard accessibility
      onBlur={() => setIsVisible(false)} // For keyboard accessibility
    >
      <span tabIndex={0} className="cursor-pointer underline">
        {text}
      </span>

      {isVisible && (
        <div
          className={`
            absolute 
            bg-gray-800
            text-lightgray
            text-xs 
            rounded 
            py-1 
            px-2 
            shadow-lg 
            z-50 
            transition-opacity 
            duration-300 
            ease-in-out
            whitespace-normal
            break-words
            ${className}
            `}
          style={{
            top: "100%", // Ensure it shows below the element
            left: "50%", // Center horizontally
            transform: "translateX(-50%)", // Translate to align properly
            marginTop: "8px", // Space between tooltip and text
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
