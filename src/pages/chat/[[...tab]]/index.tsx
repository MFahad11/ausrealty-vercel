import ChatBot from "@/components/chat/ChatBot";
import ImageGrid from "@/components/chat/ImageGrid";
import NavBar from "@/components/layout/Navba";
import { useRouter } from "next/router";
import React, { useState, useRef,  useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChatbotPage = () => {
  const [step, setStep] = useState(1);
  const [finalMessg, setFinalMessg] = useState("");
  const [selectedBox, setSelectedBox] = useState("MOMENTS FROM HOME");
  const [isBoxLoading, setIsBoxLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router=useRouter();
  const tab = router.query.tab;
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
      firstMessage: "Sell my property",
      placeholder: "type the address and if youre looking to sell or lease",
      route: "sell-or-lease-my-property",
      index: 0,
    },

    {
      title: "LOOKING TO BUY",
      description: "See what properties we have available",
      prompt:'LOOKING_TO_BUY_PROMPT',
        firstMessage: "Looking to buy",
        placeholder : "type the suburb or area & any property features you're looking for",
        route: "looking-to-buy",
        index: 1,
    },
    
    {
      title: "MOMENTS FROM HOME",
      description: "Images of your home",
      prompt:'MOMENTS_FROM_HOME_PROMPT',
      route: "moments-from-home",
      index: 2,
    },
    {
      title: "INSIDE AUSREALTY",
      description: "Learn more about us",
      prompt:'INSIDE_AUSREALTY_PROMPT',
      route: "inside-ausrealty",
      index: 3,
    },
    {
      title: "OUR PEOPLE",
      description: "Meet our team",
      prompt:'OUR_PEOPLE_PROMPT',
      route: "our-people",
      index: 4,
    },

  ]); 

  useEffect(() => {
    if (tab) {
    const title=tab[0].replace(/-/g, " ").toUpperCase();
    setSelectedBox(title);
    const index=boxes.findIndex((box) => box.title === title);
    scrollToCenter(index);
    }
  }, [tab]);
  
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
    console.log(box.title);
        const tabName = box.title.toLowerCase().replace(/\s+/g, "-");
        console.log(tabName);
        router.push(`/chat/${tabName}`);
  };

  return (
    <>
    <NavBar />
      <ToastContainer />
     
      
          <div
        className={`w-full fixed left-0 right-0 bg-white px-6 flex items-center justify-center bottom-0 pb-2 `}
        style={{ zIndex: 1001, overflow: "visible" }} // Ensure overflow is visible
      >
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto whitespace-nowrap box-scrollbar scroll-smooth"
        >
          {boxes.map((box, index) => (
            <div
              key={index}
              ref={(el) => {
                boxRefs.current[index] = el;
              }}
              className={`rounded-lg flex-shrink-0 inline-flex flex-col mr-4 px-4 py-3 justify-center relative
               min-w-[227px] cursor-pointer
                ${
                  box.title === selectedBox
                    ? "bg-mediumgray"
                    : "border border-black"
                }
                
                
                `}
              onClick={() => {
                
                handleBoxClick(box, index);
              }}
            >
              <div
                className={`relative text-start`}
              >
                {!isBoxLoading || box.title !== selectedBox ? (
                  <div className="text-xs m-0 flex flex-col">
                    <div className="flex">
                     
                      <h6
                      className="mb-1 font-abchanel font-bold"
                      >{box.title}</h6>
                    </div>
                    <span 
                    className=" text-darkergray font-arial"
                    >{box.description}</span>
                  </div>
                ) : (
                  <i className="fa-solid fa-spinner animate-spin"></i>
                )}
              </div>
            </div>
          ))}
        </div>
        
      </div>
      <div className="flex flex-col items-center">
        <ChatBot
            title={selectedBox}
            firstMessage={boxes.find((box) => {
            
                return box.title === selectedBox})?.firstMessage || ""}
            prompt={boxes.find((box) => box.title === selectedBox)?.prompt || ""}
            placeholder={boxes.find((box) => box.title === selectedBox)?.placeholder || "Type here"}
            route={boxes.find((box) => box.title === selectedBox)?.route || ""}
            index={boxes.find((box) => box.title === selectedBox)?.index || 0}
            // @ts-ignore
            handleBoxClick={handleBoxClick}
            boxes={boxes}
            />
      
      </div>

          
      
    </>
  );
};

export default ChatbotPage;
