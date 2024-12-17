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
const ChatBot = ({
    title,
    firstMessage,
    prompt,
    placeholder,
    route,
    index,
    boxes,
    instaData,
    handleBoxClick
}:{
    instaData: any
    title: string,
    firstMessage: string,
    prompt: string
    placeholder: string
    route: string
    index: number
    boxes: Array<{
      title: string;
      description: string;
      prompt: string;
      firstMessage?: string;
      placeholder?: string;
      route?: string;
      index?: number;
    }>
    handleBoxClick: (box:{
      title: string;
      description?: string;
      prompt: string;
    }, index:number) => void
}) => {
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef<
    HTMLDivElement | null
  >(null);
  const textareaRef = useRef<
    HTMLTextAreaElement | null
  >(null);
  const tabKeywords = {
    "sell-or-lease-my-property": ["sell", "lease"],
    "looking-to-buy": ["buy", "purchase"],
    "moments-from-home": ["moments", "home"],
    "inside-ausrealty": ["inside", "ausrealty"],
    "our-people": ["people"],
  }
  useEffect(() => {
    const checkTabMatch = () => {
      const words = inputValue.trim().split(/\s+/); // Split input into words
      const lastWord = words[words.length - 1].toLowerCase();
  
      for (const [tab, keywords] of Object.entries(tabKeywords)) {
        if (keywords.some((keyword) => lastWord === keyword)) {
          if (route !== tab) {
            const index = boxes.findIndex((box) => box.route === tab);
            handleBoxClick(
              {
                title: boxes[index].title,
                description: boxes[index].description,
                prompt: boxes[index].prompt,
              },
              index
            );
          }
          break;
        }
      }
    };
  
    if (inputValue.trim() || inputValue.trim().endsWith("?")|| inputValue.trim().endsWith(".") || inputValue.trim().endsWith("!")|| inputValue.trim().endsWith(",")) {
      const debounceTimeout = setTimeout(() => {
        checkTabMatch(); // Call the function here
      }, 500); // Adjust debounce delay as needed
  
      return () => {
        clearTimeout(debounceTimeout); // Clear the timeout on cleanup
      };
    }
  }, [inputValue]);
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(prompt, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    resizeTextarea();
  }, [inputValue]);
  const [formData, setFormData] = useState({
    suburb: '',
    priceRange: '',
    bedrooms: '',
    mustHaves: ''
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
  }
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
      if(firstMessage){
        setMessages([
            {
              role: "system",
              content: 'Hi! Let us know how we can help you. Otherwise, please click one of the categories below to get started.',
            },
            {
                role: "user",
                content: firstMessage,
            },
            {
              role: "system",
              content: firstMessage?.includes('Sell')?`Great! Let’s get started. Just fill out a few quick details so we can connect you with the best agent for your area:`:`Great! Let’s get started. Just fill out a few quick details so we can connect you with the best properties. Otherwise, message us over what you’re looking for and we’ll show you what we have to offer.`,
            }
          ]);
        //   typewriterEffect(
        //     `Great! Let’s get started. Just fill out a few quick details so we can connect you with the best agent for your area:`, 0
        //   )
      }
      else{
        setMessages([
            {
              role: "system",
              content: 'Hi! Let us know how we can help you. Otherwise, please click one of the categories below to get started.',
            },
            
          ]);
      }
      if(prompt){
        localStorage.setItem(prompt, JSON.stringify(messages));
      }
      
  }
  useEffect(() => {
    setMessages([]);
    const savedMessages = localStorage.getItem(prompt);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      initializeChat();
    }
    
  }, [
    prompt,
  ]);
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

    setIsTyping(true);
    const userMessage = { role: "user", content: inputValue };
    setMessages([...messages, userMessage]);
    setInputValue("");

    try {
    //   const botResponseText = await chatgptAPICall(inputValue, messages);
    //   if (!botResponseText) {
    //     throw new Error("Error in response");
    //   }

      setIsTyping(false);
      const botResponse = { role: "system", content: "" };
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages, botResponse];
        typewriterEffect(
            'Hi! Let us know how we can help you. Otherwise, please click one of the categories below to get started.'
            , newMessages.length - 1);
        return newMessages;
      });
    } catch (error:any) {
      const errorMessage =
      error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";
      toast.error(errorMessage);
      setIsTyping(false);
    }
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
    } catch (error:any) {
      const errorMessage =
      error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleInputChange = (e:any) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e:any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const typewriterEffect = (text:string, index:number) => {

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
    // localStorage.removeItem(prompt);
    initializeChat();
  };
  return (
    <div className="w-full h-full flex flex-col justify-between">
      <ToastContainer />
      <div className="max-w-4xl mx-auto flex flex-col flex-grow mb-2">
        <div className="p-2 m-0 w-full rounded-lg mt-4">
        {
          title === "MOMENTS FROM HOME" && (
            <InstaGrid data={instaData}/>
          )
        }
        {
          (title==='SELL OR LEASE MY PROPERTY' || title==='LOOKING TO BUY') && (<div
            id="msg"
            ref={messagesContainerRef}
            className="enhanced-textarea overflow-y-auto p-3 pl-0 pb-32"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.role === "system" ? "text-left" : "text-right"
                }`}
              >
                <span
                  className={`inline-block p-3 max-w-[80%] rounded-lg ${
                    message.role === "system"
                      ? "bg-white rounded-br-none"
                      : "text-start bg-gray-200 rounded-bl-none"
                  }`}
                >
                  <p>{message.content}</p>
                </span>
              </div>
            ))}
            <div
                className={`mb-4 text-left`}
              >
                <span
                  className={`inline-block  pl-5 pr-8 py-6  max-w-[90%] bg-gray-200 rounded-md `}
                >
                  <Form fields={[
                    {
                      label: 'Preferred Suburb (s)',
                      name: 'suburb',
                      type: 'text',
                      placeholder: 'Type here...'
                    },
                    {
                      label: 'Price Range (e.g., $1M - $1.5M)',
                      name: 'priceRange',
                      type: 'text',
                      placeholder: 'Type here...'
                    },
                    {
                      label: 'Number of Bedrooms',
                      name: 'bedrooms',
                      type: 'text',
                      placeholder: 'Type here...'
                    },
                    {
                      label: 'Must-Haves (e.g., pool, waterfront)',
                      name: 'mustHaves',
                      type: 'text',
                      placeholder: 'Type here...'
                    }
                  ]} />
                </span>
              </div>
              <div
                className={`mb-4 text-left`}
              >
                <span
                  className={`inline-block pl-5 pr-8 py-6  max-w-[80%] bg-gray-200 rounded-md `}
                >
                  <Form fields={[
                    {
                      label: 'Your Name',
                      name: 'name',
                      type: 'text',
                      placeholder: 'Type here...'
                    },
                    {
                      label: 'Contact Number',
                      name: 'contactNumber',
                      type: 'text',
                      placeholder: 'Type here...'
                    },
                    {
                      label: 'Email Address',
                      name: 'email',
                      type: 'text',
                      placeholder: 'Type here...'
                    },
                    {
                      label: 'Property Address',
                      name: 'propertyAddress',
                      type: 'text',
                      placeholder: 'Type here...'
                    },
                    {
                      label: 'Estimated Value or Recent Appraisal (if you have one)',
                      name: 'estimatedValue',
                      type: 'text',
                      placeholder: 'Type here...'
                    },{
                      label: 'Reason for Selling (e.g., downsizing, relocating, etc.)',
                      name: 'reasonForSelling',
                      type: 'text',
                      placeholder: 'Type here...'
                    }
                  ]} />
                </span>
              </div>


            {isTyping && (
              <div className="text-left mb-2">
                <span className="inline-block p-3 max-w-[80%] bg-gray-200 rounded-lg animate-pulse">
                  Typing...
                </span>
              </div>
            )}
          </div>)
        }
        {
          title === "INSIDE AUSREALTY" && (
            <ImageGrid data={INSIDE_AUSREALTY}
            isInsideAusrealty={true}
            
            />
          )
        }
        {
          title === "OUR PEOPLE" && (
            <ImageGrid data={OUR_TEAM_DATA}
            
            />
          )
        }
        {
          title==="LOOKING TO RENT"&&(
            <ImageGrid data={LOOKING_TO_RENT}
            
            />
          )
        }
         
        </div>
      </div>
            
      <div className="max-w-4xl mx-auto fixed bottom-[4.64rem] left-0 right-0 w-full bg-white py-2 px-6">
      <div className="relative flex items-center justify-between border border-gray-600 rounded-full px-4 py-3 shadow-md">
  <textarea
    ref={textareaRef}
    value={inputValue}
    onChange={handleInputChange}
    onKeyPress={handleKeyPress}
    placeholder={placeholder?.length>=40?placeholder?.slice(0,41):placeholder}
    className="flex-grow bg-transparent text-sm outline-none resize-none overflow-y-hidden"
    rows={1}
  />
  <button
    onClick={handleSend}
    className=" text-black"
  >
    <IoSend />
  </button>
</div>
      </div>
    </div>
  );
};

export default ChatBot;
