import React, { useEffect, useState, useRef, FormEvent } from "react";
import { IoSend } from "react-icons/io5";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageGrid from "./ImageGrid";
import Form from "./Form";
import { useRouter } from "next/router";
import InstaGrid from "./InstaGrid";
import { OUR_TEAM_DATA } from "@/constants/our-team";
import { INSIDE_AUSREALTY } from "@/constants/inside-ausrealty";
import { LOOKING_TO_RENT } from "@/constants/looking-to-rent";
import Link from "next/link";
import dayjs from "dayjs";
import axiosInstance from "@/utils/axios-instance";
import {
  handleBuyingChat,
  handleIdentifyIntent,
  handleRenChat,
} from "@/utils/openai";
import { LuRotateCcw } from "react-icons/lu";
import EmblaCarousel from "../ui/carousel";
const ChatBot = ({
  title,
  firstMessage,
  prompt,
  placeholder,
  route,
  index,
  boxes,
  instaData,
  handleBoxClick,
  indexPage,
  scrollContainerRef,
  boxRefs,
}: {
  instaData: any;
  title: string;
  firstMessage: string;
  prompt: string;
  placeholder: string;
  route: string;
  index: number;
  boxes: Array<{
    title: string;
    description: string;
    prompt: string;
    firstMessage?: string;
    placeholder?: string;
    route?: string;
    index?: number;
  }>;
  indexPage?: boolean;
  handleBoxClick: (
    box: {
      title: string;
      description?: string;
      prompt: string;
    },
    index: number
  ) => void;
  scrollContainerRef: any;
  boxRefs: any;
}) => {
  const [messages, setMessages] = useState<
    Array<{
      role: string;
      content: string;
      properties?: any[];
      isLoading?: boolean;
    }>
  >([]);
  const [intentExtracting, setIntentExtracting] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    setMessages([]);
    const savedMessages = localStorage.getItem(prompt);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
      const isSendMessage = localStorage.getItem(`${prompt}_send_message`);
      if(isSendMessage){
        const getStoredMessages = localStorage.getItem(prompt);
        if(getStoredMessages){
          const getLatestMessage = JSON.parse(getStoredMessages);
          localStorage.removeItem(`${prompt}_send_message`);
          searchData(getLatestMessage[getLatestMessage.length-1]?.content);
        }
        else{
          toast.error("No messages found");
        }
      }
    } else {
      if (title !== "SELL OR LEASE MY PROPERTY") {
        initializeChat();
      }
    }
  }, [prompt]);
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(prompt, JSON.stringify(messages));
    }
    if (messagesEndRef.current && messages.length > 2) {
      // @ts-ignore
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    resizeTextarea();
  }, [inputValue]);
  const [formData, setFormData] = useState({
    suburb: "",
    priceRange: "",
    bedrooms: "",
    mustHaves: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };
  //   const chatgptAPICall = async (message, previousMessages) => {
  //     try {
  //       const response = await axios.post(
  //         `${process.env.REACT_APP_BACKEND_URL}/api/chat`,
  //         {
  //           userMessage: message,
  //           chatHistory: previousMessages,
  //           prompt: prompt,
  //         }
  //       );

  //       if (response.data.success) {
  //         return response.data.message;
  //       }
  //     } catch (error) {
  //       const errorMessage =
  //       error.response?.data?.message ||
  //         error.message ||
  //         "An unexpected error occurred";
  //       toast.error(errorMessage);
  //     }
  //   };
  const initializeChat = async () => {
    if (title !== "SELL OR LEASE MY PROPERTY") {
      if (firstMessage) {
        setMessages([
          {
            role: "system",
            content: firstMessage,
          },
          // {
          //     role: "user",
          //     content: firstMessage,
          // },
          // {
          //   role: "system",
          //   content: firstMessage?.includes('Sell')?`Great! Let’s get started. Just fill out a few quick details so we can connect you with the best agent for your area:`:`Great! Let’s get started. Just fill out a few quick details so we can connect you with the best properties. Otherwise, message us over what you’re looking for and we’ll show you what we have to offer.`,
          // }
        ]);
        //   typewriterEffect(
        //     `Great! Let’s get started. Just fill out a few quick details so we can connect you with the best agent for your area:`, 0
        //   )
      } else {
        // setMessages([
        //     {
        //       role: "system",
        //       content: 'Hi! Let us know how we can help you. Otherwise, please click one of the categories below to get started.',
        //     },
        //   ]);
      }
      // if(prompt){
      //   localStorage.setItem(prompt, JSON.stringify(messages));
      // }
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) {
      toast.error("Please type something");
      return;
    }
    const userMessage = { role: "user", content: inputValue };
    if (!indexPage) {
      setMessages([...messages, userMessage]);
    } else {
      setIntentExtracting(true);
    }
    setInputValue("");

    try {
      //   const botResponseText = await chatgptAPICall(inputValue, messages);
      //   if (!botResponseText) {
      //     throw new Error("Error in response");
      //   }

      // setIsTyping(true);
      // const botResponse = { role: "system", content: "" };
      // setMessages((prevMessages) => {
      //   const newMessages = [...prevMessages, botResponse];
      //   typewriterEffect(
      //       'Hi! Let us know how we can help you. Otherwise, please click one of the categories below to get started.'
      //       , newMessages.length - 1);
      //   return newMessages;
      // });

      // user input to api
      searchData(userMessage?.content);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";
      toast.error(errorMessage);
      setIsTyping(false);
      setIntentExtracting(false);
    }
  };
  const searchData = async (userInput: string) => {
    let data: any;
    setIsTyping(true);
    if (indexPage) {
      const data = await handleIdentifyIntent(userInput);
      if (data?.response) {
        const { redirect = "/",prompt } = JSON.parse(data?.response);
        setIntentExtracting(false);
        if(prompt){
          const getStoredMessages = localStorage.getItem(prompt);
          if(getStoredMessages){
            const storedMessages=JSON.parse(getStoredMessages);
            localStorage.setItem(prompt, JSON.stringify([...storedMessages, {role: "user", content: userInput}]));
          }else{
            const messages = [{role: "user", content: userInput}];
            localStorage.setItem(prompt, JSON.stringify(messages));
          }
          router.push(`/chat/${redirect}`);
          localStorage.setItem(`${prompt}_send_message`, 'true');
          // searchData(userInput);
        }
        else{
          toast.error("No prompt found");
        }
      }
    } 
    else {
      if (title === "LOOKING TO BUY") {
        data = await handleBuyingChat(
          userInput,
          messages.map(({ content, role, properties }) => ({
            content,
            role,
            properties: properties || [],
          }))
        );
      } else if (title === "LOOKING TO RENT") {
        data = await handleRenChat(
          userInput,
          messages.map(({ content, role, properties }) => ({
            content,
            role,
            properties: properties || [],
          }))
        );
      }
      if (data?.extractedInfo) {
        if (data?.extractedInfo?.intent) {
          router.push(`/chat/${data?.extractedInfo?.redirect}`);
          return;
        }
        setMessages((prevMessages) => {
          const newMessage = {
            role: "system",
            content: data?.response,
            properties: [],
            isLoading: true,
          };
          const updatedMessages = [...prevMessages, newMessage];
          return updatedMessages;
        });
        try {
          const response = await axiosInstance.post("/api/domain/listings", {
            extractedInfo: data?.extractedInfo,
          });
          if (response.data.success) {
            const properties = response.data.data;
            if (properties.length == 0) {
              setMessages((prevMessages) => {
                const newMessage = {
                  role: "system",
                  content:
                    "Unable to find any properties that match your criteria. But you can always provide more information to help us find the right property for you.",
                };
                const updatedMessages = [...prevMessages, newMessage];
                return updatedMessages;
              });
            } else {
              setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages];
                updatedMessages[prevMessages.length - 1].properties =
                  properties?.map((property: any) => ({
                    addressParts: property?.addressParts,
                    headline: property?.headline,
                    priceDetails: property?.priceDetails,
                    bedrooms: property?.bedrooms,
                    bathrooms: property?.bathrooms,
                    carspaces: property?.carspaces,
                    channel: property?.channel,
                    features: property?.features,
                    location: property?.location,
                    objective: property?.objective,
                    priceRange: property?.priceRange,
                    propertyTypes: property?.propertyTypes,
                    saleMode: property?.saleMode,
                    suburb: property?.sub,
                    media:
                      property?.media?.length >= 1 ? property?.media : null,
                    id: property?.id,
                  }));

                updatedMessages[prevMessages.length - 1].isLoading = false;
                return updatedMessages;
              });
            }
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "An unexpected error occurred";
          toast.error(errorMessage);
        }
      } else {
        setMessages((prevMessages) => {
          const newMessage = { role: "system", content: data?.response };
          const updatedMessages = [...prevMessages, newMessage];
          return updatedMessages;
        });
      }
    }
    setIsTyping(false);
  };
  const generateStory = async () => {
    if (messages.length < 10) {
      toast.error(
        "Please have atleast 5 conversations to generate a better story"
      );
      return;
    }
    setLoading(true);

    try {
      //   const response = await axios.post(
      //     `${process.env.REACT_APP_BACKEND_URL}/api/story`,
      //     {
      //       userMessage: prompt==='FOR_SOMEONE_PROMPT'?`Please write a story based on the conversation attached. Write the story as if the person is speaking directly to the person mention in the story (e.g., their mum, friend, or anyone relevant to the story). Ensure the tone feels like they're reminiscing with someone important to them. Use only the specified HTML tags for formatting the output. Ensure that the text is well-structured and formatted clearly with the following HTML tags:
      //         - <h4> for headings
      //         - <p> for paragraphs
      //         Ensure the story follows the structure provided. Do not use bold formatting for headings; instead, use the appropriate HTML tags as specified.`:`
      //         Please write a story based on the conversation attached. Use only the specified HTML tags for formatting the output. Ensure that the text is well-structured and formatted clearly with the following HTML tags:
      //         - <h4> for headings
      //         - <p> for paragraphs
      //         Ensure the story follows the structure provided. Do not use bold formatting for headings; instead, use the appropriate HTML tags as specified.`,
      //       chatHistory: messages,
      //       prompt:'GENERATE_STORY_PROMPT'
      //     }
      //   );
      //   if (response.data.success) {
      //     const result = response.data.message;
      //     localStorage.setItem(`introStoryLines_${prompt}`, response.data.introStory);
      //     setFinalMessg(result);
      //     setLoading(false);
      //     setStep(2);
      //     localStorage.setItem(stepKey, 2);
      //     localStorage.setItem(finalMessgKey, result);
      //   }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const typewriterEffect = (text: string, index: number) => {
    let charIndex = -1;
    const interval = setInterval(() => {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];

        if (updatedMessages[index].content.length < text.length) {
          updatedMessages[index].content += text.charAt(charIndex);
        }
        return updatedMessages;
      });
      charIndex++;
      if (charIndex === text.length) {
        clearInterval(interval);
      }
    }, 20);
  };

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = parseInt(
        window.getComputedStyle(textarea).lineHeight,
        10
      );
      const rows = Math.floor(scrollHeight / lineHeight);
      const maxRows = 5;

      if (rows > maxRows) {
        textarea.style.height = `${lineHeight * maxRows}px`;
        textarea.style.overflowY = "auto";
      } else {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflowY = "hidden";
      }
    }
  };

  const handleStartAgain = () => {
    setMessages([]);
    localStorage.removeItem(prompt);
    initializeChat();
  };
  return (
    <div className="w-full h-full flex flex-col justify-between">
      <ToastContainer />
      <div className="max-w-4xl min-w-4xl mx-auto flex flex-col flex-grow pb-14 overflow-y-auto">
        <div className=" m-0 w-full rounded-lg mt-4">
          {title === "MOMENTS FROM HOME" && <InstaGrid data={instaData} />}
          {(title === "SELL OR LEASE MY PROPERTY" ||
            title === "LOOKING TO BUY" ||
            title === "LOOKING TO RENT") &&
            (title === "SELL OR LEASE MY PROPERTY" && messages?.length === 0 ? (
              <div className={`mb-4 text-left`}>
                <span
                  className={`inline-block p-3 max-w-[80%] rounded-lg bg-white`}
                >
                  <p>
                    Hi! Let us know how we can help you. Otherwise, please click
                    one of the categories below to get started.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link
                      href="/sell-or-lease-my-property font-lato"
                      className="text-black underline"
                    >
                      Sell My Property
                    </Link>
                    <Link
                      href="/sell-or-lease-my-property font-lato"
                      className="text-black underline"
                    >
                      Lease My Property
                    </Link>
                  </div>
                </span>
              </div>
            ) : (
              <>
                <div
                  id="msg"
                  ref={messagesContainerRef}
                  className="enhanced-textarea overflow-y-auto pl-0 pb-32 "
                >
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`mb-4 ${
                        message.role === "system" ? "text-left" : "text-right"
                      }`}
                    >
                      <span
                        className={`inline-block rounded-lg max-w-[80%] p-3 ${
                          message.role === "system"
                            ? "bg-white rounded-br-none"
                            : "text-start bg-gray-200 rounded-bl-none mr-2"
                        }
                     
                      
                      `}
                      >
                        <p>{message.content}</p>
                      </span>
                      <div>
                        {message.properties &&
                          message.properties.length > 0 && (
                            <div className="mt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                {message.properties.map((property, index) => (
                                  <div
                                    key={index}
                                    className="bg-white shadow-sm p-0 cursor-pointer border-lightgray border w-full"
                                    onClick={() => {
                                      router.push(`/property/${property.id}/media/images`);
                                    }}
                                  >
                                    {(property?.media && Array.isArray(property?.media)) && (
                                      
                                        <EmblaCarousel
                                        slides={property?.media}
                                        />
                                    )}
                                    <div className="ml-4">
                                      <div className="mt-6">
                                        {/* <h4 className="mb-3 tracking-wide font-semibold">
                                          FOR {property.objective.toUpperCase()}
                                        </h4> */}
                                        <h5 className="text-black font-light">
                                          {property.addressParts.displayAddress}
                                        </h5>
                                      </div>

                                      <div className="mb-6 text-sm">
                                        <h4 className="text-black mb-0">
                                          {/* 4B 4B 2C | House */}
                                          {property?.bedrooms}B{" "}
                                          {property?.bathrooms}B{" "}
                                          {property?.carspaces}C |{" "}
                                          {property?.propertyTypes?.length > 0
                                            ? property?.propertyTypes?.join(",")
                                            : "N/A"}
                                        </h4>
                                        <p className="leading-7">
                                          Inspection {dayjs(property?.dateAvailable)?.format("DD/MM/YYYY")}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {message.isLoading && (
                          <div className="text-center mt-4">
                            <i className="fa-solid fa-spinner animate-spin"></i>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="text-left mb-2 ml-2">
                      <span className="inline-block p-3 max-w-[80%] bg-gray-200 rounded-lg animate-pulse">
                        Typing...
                      </span>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </>
            ))}
          {title === "INSIDE AUSREALTY" && (
            <ImageGrid data={INSIDE_AUSREALTY} isInsideAusrealty={true} />
          )}
          {title === "OUR PEOPLE" && <ImageGrid data={OUR_TEAM_DATA} />}
          {title === "LOCATION" && <ImageGrid data={LOOKING_TO_RENT} />}
        </div>
      </div>

      <div
        className={`z-10 w-full fixed left-0 right-0 bg-white px-6 bottom-0 pb-4 pt-2 text-center`}
      >
        <div className="flex flex-col gap-6">
          <div className="w-full max-w-md mx-auto relative">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={
                indexPage ? "How can we help? Tell us here" : placeholder
              }
              disabled={indexPage ? intentExtracting : false}
              autoCapitalize="on"
              
              className="start-campaign-input w-full  z-10 flex-grow p-2 bg-lightgray rounded-md py-5 pl-3 pr-8 outline-none focus:outline-none resize-none overflow-y-hidden"
            />
            <button
              onClick={handleSend}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black"
            >
              <IoSend title="Send" 
              className="w-5 h-5"
              />
            </button>
            {
              !indexPage && (
              <button
                onClick={handleStartAgain}
                className="p-2 text-black transition-colors duration-200 rounded-full fixed right-2 top-3/4 -translate-y-3/4 bg-white hover:bg-gray-100 shadow-md border border-gray-200 focus:outline-none"
                aria-label="Reset search"
              >
                <LuRotateCcw title="Restart" className="w-6 h-6" />
              </button>
              )
            }
            
            
          </div>

          <div
            className="overflow-x-auto whitespace-nowrap box-scrollbar scroll-smooth"
            ref={scrollContainerRef}
          >
            {boxes.map((box, index) => (
              <div
                key={index}
                ref={(el) => {
                  boxRefs.current[index] = el;
                }}
                className={`bg-lightgray rounded-xl flex-shrink-0 inline-flex flex-col items-center hover:bg-mediumgray cursor-pointer mr-4 py-2.5 px-6 ${
                  box.title === title ? "bg-mediumgray" : ""
                }`}
                onClick={() => {
                  handleBoxClick(box, index);
                }}
              >
                <div className="text-start text-xs relative">
                  <h6>{box.title}</h6>
                  <span className=" text-darkergray">{box.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
