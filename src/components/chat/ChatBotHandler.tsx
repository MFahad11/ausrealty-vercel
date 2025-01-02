import ChatBot from "@/components/chat/ChatBot";
import ImageGrid from "@/components/chat/ImageGrid";
import NavBar from "@/components/layout/Navbar";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useState, useRef,  useEffect, useCallback } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChatBotHandler = (
  {data,indexPage=false
  }: {data: any, indexPage?: boolean}
) => {
  const [step, setStep] = useState(1);
  const [finalMessg, setFinalMessg] = useState("");
  const [selectedBox, setSelectedBox] = useState("");
  const [isBoxLoading, setIsBoxLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const router=useRouter();
  const tab = router.query.tab;
  const placeholders = [
    "How we can help?",
    "Ask us anything"
  ];
 
  
  const [boxes, ] = useState<{
    title: string;
    description: string;
    prompt: string;
    firstMessage?: string;
    placeholder?: string;
    route?: string;
    index?: number;
  }[]>([
    {
      title: "SELL OR LEASE MY PROPERTY",
      description: "See what your home is worth",
      prompt:"SELL_MY_PROPERTY_PROMPT",
      firstMessage: "Would you like a price assessment or information regarding the sale or rental of your property?",
      placeholder: "Type your address or location and/or specific features",
      route: "sell-or-lease-my-property",
      index: 0,
    },

    {
      title: "LOOKING TO BUY",
      description: "See what properties we have available",
      prompt:'LOOKING_TO_BUY_PROMPT',
        firstMessage: "Hi, let us know how we can help you. Any particular suburb or features you're looking for?",
        placeholder : "Search for a property e.g. suburb, special features, location",
        route: "looking-to-buy",
        index: 1,
    },
    {
      title:"LOOKING TO RENT",
      description: "See what properties we have available",
      prompt:'LOOKING_TO_RENT_PROMPT',
      firstMessage: "Hi, let us know how we can help you. Any particular suburb or features you're looking for?",
      placeholder : "type the suburb or area & any property features you're looking for",
      route: "looking-to-rent",
      index: 2,
      
    },
    {
      title:"LOCATION",
      description: "Find a property in your desired location",
      prompt:'LOCATION_PROMPT',
      route: "location",
      index:3,

    },
    {
      title: "MOMENTS FROM HOME",
      description: "Stories from people just like you",
      prompt:'MOMENTS_FROM_HOME_PROMPT',
      route: "moments-from-home",
      index: 4,
    },
    {
      title: "INSIDE AUSREALTY",
      description: "Learn more about us",
      prompt:'INSIDE_AUSREALTY_PROMPT',
      route: "inside-ausrealty",
      index: 5,
    },
    {
      title: "OUR PEOPLE",
      description: "Meet our team",
      prompt:'OUR_PEOPLE_PROMPT',
      route: "our-people",
      index: 6,
      placeholder:"Search here by name, location or office"
    },

  ]); 
  useEffect(() => {
    const typingSpeed = 100; // Speed of typing in milliseconds
    const deletingSpeed = 50; // Speed of deleting in milliseconds
    const pauseBetweenWords = 1700; // Pause before starting to delete
    
    const getCurrentPlaceholder = () => placeholders[currentPlaceholderIndex];
    
    if (!isDeleting && currentText !== getCurrentPlaceholder()) {
      // Typing
      const timeout = setTimeout(() => {
        setCurrentText(getCurrentPlaceholder().substring(0, currentText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } 
    else if (!isDeleting && currentText === getCurrentPlaceholder()) {
      // Pause before deleting
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseBetweenWords);
      return () => clearTimeout(timeout);
    }
    else if (isDeleting && currentText !== '') {
      // Deleting
      const timeout = setTimeout(() => {
        setCurrentText(currentText.substring(0, currentText.length - 1));
      }, deletingSpeed);
      return () => clearTimeout(timeout);
    }
    else if (isDeleting && currentText === '') {
      // Move to next placeholder
      setIsDeleting(false);
      setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }
  }, [currentText, isDeleting, currentPlaceholderIndex, placeholders]);
  useEffect(() => {
    if (tab) {
      // @ts-ignore
    const title=tab?.replace(/-/g, " ").toUpperCase();
    setSelectedBox(title);
    const index=boxes.findIndex((box) => box.title === title);
    scrollToCenter(index);
    }
  }, [tab]);
  
  // set a use effect to clear stale data from local storage if the local storage not contains or the updatedData is false
  useEffect(() => {
    const updatedData = localStorage.getItem("updatedData");
    if (!updatedData || updatedData === "false") {
      localStorage.clear();
      localStorage.setItem("updatedData", "true");
    }
  }
  , []);
  
  const boxRefs = useRef<
    Array<HTMLDivElement | null>
  >([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(
    null
  );
  
  
 
  const scrollToCenter = (index:number) => {
    const selectedBoxElement = boxRefs.current[index];
    const scrollContainer = scrollContainerRef.current;

    if (selectedBoxElement && scrollContainer) {
      const containerWidth = scrollContainer.clientWidth; // Width of the scroll container
      const boxWidth = selectedBoxElement.clientWidth; // Width of the selected box
      const boxOffset = selectedBoxElement.offsetLeft; // Left position of the selected box

      // Calculate the scroll position to center the box
      const scrollPos = boxOffset - containerWidth / 2 + boxWidth / 2 - 20;

      // Smooth scrolling to the calculated position
      scrollContainer.scrollTo({ left: scrollPos, behavior: "smooth" });
    }
  };

  const handleBoxClick = (box:{
    title: string;
    description: string;
    prompt: string;
  }, index:number) => {
    
        const tabName = box.title.toLowerCase().replace(/\s+/g, "-");
       
        router.push(`/chat/${tabName}`);
  };

  return (
        <ChatBot
            title={selectedBox}
            firstMessage={boxes.find((box) => {
            
                return box.title === selectedBox})?.firstMessage || ""}
            prompt={boxes.find((box) => box.title === selectedBox)?.prompt || ""}
            placeholder={currentText}
            route={boxes.find((box) => box.title === selectedBox)?.route || ""}
            index={boxes.find((box) => box.title === selectedBox)?.index || 0}
            // @ts-ignore
            handleBoxClick={handleBoxClick}
            boxes={boxes}
            instaData={data}
            indexPage={indexPage}
            scrollContainerRef={scrollContainerRef}
            boxRefs={boxRefs}
            />
  );
};

export default ChatBotHandler;
