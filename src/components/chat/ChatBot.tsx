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
import ContentLoader from 'react-content-loader';
import { RiVoiceprintFill } from "react-icons/ri";
import {
  handleBuyingChat,
  handleIdentifyIntent,
  handleLeasingChat,
  handleRenChat,
  handleSellingChat,
  handleTranscription,
} from "@/utils/openai";
import { LuChevronDown, LuLoader2, LuMic, LuMicOff, LuRotateCcw } from "react-icons/lu";
import EmblaCarousel from "../ui/carousel";
import PageLoader from "../ui/PageLoader";
import { convertBlobToBase64, getSupportedMimeType } from "@/utils/helpers";
import AgentCard from "../property/AgentCard";
import AgentCarousel from "../ui/carousel/AgentCarousel";
import Button from "../ui/Button";
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
    videoUrl?: string;
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
      videoUrl?: string;
      isLoading?: boolean;
      agents?: any[];
      button?: boolean;
      buttonText?: string;
    }>
  >([]);
  const [intentExtracting, setIntentExtracting] = useState(false);
  const router = useRouter();
  const [fetchedProperties, setFetchedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [botThinking, setBotThinking] = useState(false);
  const [transcription, setTranscription] = useState("");
   const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef(null);
  const botResponseRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const checkSilenceRef = useRef<boolean>(false);
  useEffect(() => {
    setMessages([]);
    setFetchedProperties([]);
    const savedMessages = localStorage.getItem(prompt);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
      const isSendMessage = localStorage.getItem(`${prompt}_send_message`);
      if (isSendMessage) {
        const getStoredMessages = localStorage.getItem(prompt);
        if (getStoredMessages) {
          const getLatestMessage = JSON.parse(getStoredMessages);
          localStorage.removeItem(`${prompt}_send_message`);
          searchData(getLatestMessage[getLatestMessage.length - 1]?.content, false);
        }
      }
    } else {
      // if (title !== "SELL OR LEASE MY PROPERTY") {
        initializeChat();
      // }
    }
  }, [prompt]);
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(prompt, JSON.stringify(messages));
    }
    
  }, [messages]);


  useEffect(() => {
    resizeTextarea();
  }, [inputValue]);

  
  
  const startRecording = async () => {
    try {
      
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: true,
          sampleRate: 48000,
        },
      });
  
      
      // @ts-ignore
  
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      // @ts-ignore
  
      const source = audioContextRef.current.createMediaStreamSource(stream);
      // @ts-ignore
  
      analyserRef.current = audioContextRef.current.createAnalyser();
      // @ts-ignore
  
      analyserRef.current.fftSize = 2048;
      source.connect(analyserRef.current);
  
      
  
      const options = { mimeType: getSupportedMimeType() };
      
      // @ts-ignore
  
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];
      // @ts-ignore
  
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
      // @ts-ignore
  
          audioChunksRef.current.push(event.data);
        }
      };
      // @ts-ignore
  
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType });
        await processAudio(audioBlob);
      };
  
      // Set up silence detection
      // @ts-ignore
  
      const dataArray = new Float32Array(analyserRef.current.fftSize);
      // @ts-ignore
  
      let silenceStart = null;
      const SILENCE_DURATION = 2000; // 2 seconds
  
      const checkSilence = () => {
        if (!checkSilenceRef.current || !analyserRef.current) {
          
          return;
        }
  
        try {
          const isSilent = detectSilence(analyserRef.current, dataArray);
          
          if (isSilent) {
      // @ts-ignore
  
            if (!silenceStart) {
              silenceStart = Date.now();
              
            } else {
              const silenceDuration = Date.now() - silenceStart;
              
              
              if (silenceDuration > SILENCE_DURATION) {
                
                stopRecording();
                return;
              }
            }
          } else {
      // @ts-ignore
  
            if (silenceStart) {
              
            }
            silenceStart = null;
          }
      // @ts-ignore
  
          silenceTimeoutRef.current = setTimeout(checkSilence, 100);
        } catch (error) {
          
        }
      };
  
      // Start the recording
      // @ts-ignore
  
      mediaRecorderRef.current.start(1000);
      
      setIsRecording(true);
      setIsListening(true);
      console.log(isRecording)
      checkSilenceRef.current = true; // Start silence detection
      
      checkSilence(); // Start the silence detection loop
  
    } catch (error) {
      
      console.error('Error starting recording:', error);
      setIsListening(false);
    }
  };
  
  const stopRecording = () => {
    
    
    checkSilenceRef.current = false; // Stop silence detection
    console.log(mediaRecorderRef.current , isRecording);
    if (mediaRecorderRef.current) {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        
      }
      // @ts-ignore
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsListening(false);
      // @ts-ignore
  
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      if (audioContextRef.current) {
      // @ts-ignore
  
        audioContextRef.current.close().catch(error => {
          
        });
      }
      
      mediaRecorderRef.current = null;
      
    }
  };
  
  const detectSilence = (analyser: AnalyserNode, dataArray: Float32Array) => {
    try {
      analyser.getFloatTimeDomainData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const db = 20 * Math.log10(rms);
      
      // Only log every few iterations to avoid flooding
      if (Math.random() < 0.1) { // Log roughly 10% of the readings
        
      }
      
      return db < -45;
    } catch (error) {
      
      return false;
    }
  };
    // @ts-ignore
  
  
    // @ts-ignore
    const processAudio = async (audioBlob) => {
      
      try {
        // Convert the audio blob to base64
        const base64Audio = await convertBlobToBase64(audioBlob);
    
        // Create a new Blob from the base64 data
        const base64Response = await fetch(`data:audio/mp4;base64,${base64Audio}`);
        const processedBlob = await base64Response.blob();
    
        const transcribedText = await handleTranscription(processedBlob)
        setTranscription(transcribedText);
        handleSend(transcribedText.trim()); // Send final transcription to GPT
    
        
    
      } catch (error) {
        console.error('Error processing audio:', error);
      } finally {
       
      }
    };
  const [formData, setFormData] = useState({
    suburb: "",
    priceRange: "",
    bedrooms: "",
    mustHaves: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };
  const startListening = () => {
    // @ts-ignore
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";
    recognition.start();
    setIsListening(true);

    // recognition.onresult = (event:any) => {
    //   const transcript = event.results[0][0].transcript;
    //   setTranscription(transcript);
    //   setIsListening(false);
     
      
    //   recognition.stop();
    //   handleSend(
    //     transcript
    //   );
    // };

    recognition.onresult = (event:any) => {
      let interimTranscript = "";
  
      // Combine interim and final results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript + " ";
        }
      }
  
      // Update the transcription state
      setTranscription(finalTranscript + interimTranscript);
    };
   
    recognition.onerror = (event:any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript) {
        handleSend(finalTranscript.trim()); // Send final transcription to GPT
      }
    };
  };

  const initializeChat = async () => {
    // if (title !== "SELL OR LEASE MY PROPERTY") {
    //   if (firstMessage) {
    //     setMessages([
    //       {
    //         role: "system",
    //         content: firstMessage,
    //       },
    //       // {
    //       //     role: "user",
    //       //     content: firstMessage,
    //       // },
    //       // {
    //       //   role: "system",
    //       //   content: firstMessage?.includes('Sell')?`Great! Let’s get started. Just fill out a few quick details so we can connect you with the best agent for your area:`:`Great! Let’s get started. Just fill out a few quick details so we can connect you with the best properties. Otherwise, message us over what you’re looking for and we’ll show you what we have to offer.`,
    //       // }
    //     ]);
    //       // typewriterEffect(
    //       //   `Great! Let’s get started. Just fill out a few quick details so we can connect you with the best agent for your area:`, 0
    //       // )
    //   } else {
    //     // setMessages([
    //     //     {
    //     //       role: "system",
    //     //       content: 'Hi! Let us know how we can help you. Otherwise, please click one of the categories below to get started.',
    //     //     },
    //     //   ]);
    //   }
    //   // if(prompt){
    //   //   localStorage.setItem(prompt, JSON.stringify(messages));
    //   // }
    // }
    if (firstMessage) {
      setMessages([
        {
          role: "system",
          content: firstMessage,
          videoUrl:boxes[index]?.videoUrl
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
        // typewriterEffect(
        //   `Great! Let’s get started. Just fill out a few quick details so we can connect you with the best agent for your area:`, 0
        // )
    } else {
      // setMessages([
      //     {
      //       role: "system",
      //       content: 'Hi! Let us know how we can help you. Otherwise, please click one of the categories below to get started.',
      //     },
      //   ]);
    }
  };
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop

      // Show button when not at the bottom of the page
      const notAtBottom = scrollTop + windowHeight < documentHeight - 50 // 20px threshold
      setShowScrollButton(notAtBottom)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToElement = (ref:any) => {
    if (ref?.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  
  useEffect(() => {
    scrollToElement(messagesEndRef);
  }, []);
  
  useEffect(() => {
    // if the last message is user message, then call the below function
    if (messages[messages.length - 1]?.role === "user") {
      scrollToElement(messagesEndRef);
    }
    
  }, [messages]);

  const handleSend = async (inputValue:string) => {
    if (!inputValue.trim()) {
      // toast.error("Please type something");
      return;
    }
    const userMessage = { role: "user", content: inputValue };
    if (!indexPage) {
      
      setMessages([...messages, userMessage]);
      // scrollToElement(messagesEndRef);
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
      setBotThinking(false);
      setIntentExtracting(false);
    }
  };
  const searchData = async (userInput: string, extractIntent=true) => {
    let data: any;
    let redirecting=false;
    setBotThinking(true);
      if(extractIntent){
        const intent = await handleIdentifyIntent(userInput);
      if (intent?.response) {
        const { redirect = "/", prompt:extractedPrompt } = JSON.parse(intent?.response);
        
        if (extractedPrompt && extractedPrompt !== prompt) {
          setFetchedProperties([]);
          const getStoredMessages = localStorage.getItem(extractedPrompt);
          if (getStoredMessages) {
            const storedMessages = JSON.parse(getStoredMessages);
            localStorage.setItem(
              extractedPrompt,
              JSON.stringify([
                ...storedMessages,
                { role: "user", content: userInput },
              ])
            );
          } else {
            const messages = [{ role: "user", content: userInput }];
            localStorage.setItem(extractedPrompt, JSON.stringify(messages));
          }
          // remove the last message from the messages array for the current prompt
          const currentPromptMessages = localStorage.getItem(prompt);
          if (currentPromptMessages) {
            const messages = JSON.parse(currentPromptMessages);
            messages.pop();
            localStorage.setItem(prompt, JSON.stringify(messages));
            setMessages(messages);
          }


          localStorage.setItem(`${extractedPrompt}_send_message`, "true");
          setIntentExtracting(false);
          redirecting=true;
          router.push(`/chat/${redirect}`);
          
          // searchData(userInput);
        }
        // else{
        //   setIntentExtracting(false);
        //   setBotThinking(false);
        // }
      }
      }
      if(!indexPage && !redirecting){
        const body: {
          objective?: string;
          saleMode?: string;
        } | null = {};
       
        if (title === "LOOKING TO BUY") {
          body["objective"] = "sale";
          body["saleMode"] = "buy";
        } else if (title === "LOOKING TO RENT") {
          body["objective"] = "rent";
          body["saleMode"] = "rent";
        }
        try {
          let storedProperties = fetchedProperties || [];
          
          
          if(storedProperties.length===0){
            const response = await axiosInstance.post("/api/domain/listings", {
            extractedInfo: body,
            });
            if (response.data.success) {
              const properties = response.data.data;
              if (properties.length > 0) {
                setFetchedProperties(() => {
                  const updatedProperties = properties;
                  return updatedProperties;
                });
                storedProperties = properties;
              }
              // else{
              //   setMessages((prevMessages) => {
              //     const newMessage = {
              //       role: "system",
              //       content:
              //         "Unable to find any properties that match your criteria. But you can always provide more information to help us find the right property for you.",
              //     };
              //     const updatedMessages = [...prevMessages, newMessage];
              //     return updatedMessages;
              //   });
              // }
            }
          }
          if (title === "LOOKING TO BUY") {
            data = await handleBuyingChat(
              userInput,
              messages.map(({ content, role }) => ({
                content,
                role,
              })),
              storedProperties?.map((property: any) => ({
                id: property?.id,
                propertyTypes: property?.propertyTypes,
                channel: property?.channel,
                displayAddress: property?.addressParts?.displayAddress,
                postcode: property?.addressParts?.postcode,
                suburb: property?.addressParts?.suburb,
                bathrooms: property?.bathrooms,
                bedrooms: property?.bedrooms,
                carspaces: property?.carspaces,
                description: property?.description,
                features: property?.features,
                inspectionDetails: property?.inspectionDetails,
                priceDetails: property?.priceDetails,
                propertyId: property?.propertyId,
                headline: property?.headline,
                agents:"auseralty.com.au"
              }))
            );
          } else if (title === "LOOKING TO RENT") {
            data = await handleRenChat(
              userInput,
              messages.map(({ content, role }) => ({
                content,
                role,
              })),
              storedProperties?.map((property: any) => ({
                id: property?.id,
                propertyTypes: property?.propertyTypes,
                channel: property?.channel,
                displayAddress: property?.addressParts?.displayAddress,
                postcode: property?.addressParts?.postcode,
                suburb: property?.addressParts?.suburb,
                bathrooms: property?.bathrooms,
                bedrooms: property?.bedrooms,
                carspaces: property?.carspaces,
                description: property?.description,
                features: property?.features,
                inspectionDetails: property?.inspectionDetails,
                priceDetails: property?.priceDetails,
                propertyId: property?.propertyId,
                headline: property?.headline,
                agents:"auseralty.com.au"
              }))
            );
          }
          else if (title === "SELL MY PROPERTY") {
            data = await handleSellingChat(
              userInput,
              messages.map(({ content, role }) => ({
                content,
                role,
              }))
            )
          }
          else if (title === "LEASE MY PROPERTY") {
            data = await handleLeasingChat(
              userInput,
              messages.map(({ content, role }) => ({
                content,
                role,
              }))
            )
          }
          if (data?.extractedInfo) {
            
            setMessages((prevMessages) => {
              const newMessage = {
                role: "system",
                content: data?.response,
                // add the media array property in each property object again based on id or propertyId
                properties:
                  data?.extractedInfo?.map((info: any) => {
                   
                    const property = storedProperties.find(
                      (property: any) =>
                      {
                        return property.id == info.id ||
                        property.propertyId == info.propertyId
                      }
                    );
                    if (property) {
                      return {
                        ...property,
                        media:
                          property?.media?.length >= 1
                            ? property?.media
                            : null,
                      };
                    }
                    return null;
                  }) || [],
                isLoading: true,
              };
              const updatedMessages = [...prevMessages, newMessage];
              typewriterEffect(data?.response, updatedMessages.length - 1);
              return updatedMessages;
            });
          } 
          else if(data?.extractedAgents){
            setMessages((prevMessages) => {
              const newMessage = {
                role: "system",
                content: data?.response,
                
              };
              const agentMessage = {
                role: "system",
                content: "See below for the best agents to connect with",
                agents:data?.extractedAgents || [],
                isLoading: true,
              }
              const pricingToolMessage = {
                role: "system",
                content: "Alternatively, click below to try our pricing tool.",
                isLoading: true,
                button:true,
                buttonText:"Price Assessment"
              }
              let updatedMessages = [...prevMessages, newMessage];
              typewriterEffect(data?.response, updatedMessages.length - 1);
              updatedMessages = [...updatedMessages, agentMessage];
              typewriterEffect("See below for the best agents to connect with", updatedMessages.length - 1);
              updatedMessages = [...updatedMessages, pricingToolMessage];
              typewriterEffect("Alternatively, click below to try our pricing tool.", updatedMessages.length - 1);
              return updatedMessages;
            });

          }
          
          else {
            setMessages((prevMessages) => {
              const newMessage = { role: "system", content: data?.response };
              const updatedMessages = [...prevMessages, newMessage];
              typewriterEffect(data?.response, updatedMessages.length - 1);
              return updatedMessages;
            });
          }
          
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "An unexpected error occurred";
          toast.error(errorMessage);
          setBotThinking(false);
  
        }
      }
      if(indexPage){
        setIntentExtracting(false);
        setBotThinking(false);
      }

  };

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend(
        inputValue
      );
    }
  };

  const typewriterEffect = (text:string, index:number) => {
    setIsTyping(true);
    setBotThinking(false);
    let charIndex = 0;  // Start from 0, not -1
    
    const interval = setInterval(() => {
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        // Only update if we haven't reached the end of the text
        if (charIndex < text?.length) {
          updatedMessages[index] = {
            ...updatedMessages[index],
            content: text?.slice(0, charIndex + 1)  // Use slice instead of charAt
          };
          return updatedMessages;
        }
        return prevMessages;
      });
      // scrollToElement(botResponseRef);
      charIndex++;
      if (charIndex > text?.length) {
        // update the isLoading property to false
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          updatedMessages[index] = {
            ...updatedMessages[index],
            isLoading: false
          };
          return updatedMessages;
        }
        );
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 25);    
    
    return () => clearInterval(interval);
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
      {
        (indexPage && intentExtracting) && (
          <PageLoader />
        )
      }
      
      <div className="max-w-4xl w-full mx-auto flex flex-col flex-grow pb-14 overflow-y-auto">
        <div className=" m-0 w-full rounded-lg mt-4">
          {title === "MOMENTS FROM HOME" && <InstaGrid data={instaData} />}
          {(title === "SELL MY PROPERTY" || title === "LEASE MY PROPERTY" ||
            title === "LOOKING TO BUY" ||
            title === "LOOKING TO RENT") &&
        //     (title === "SELL OR LEASE MY PROPERTY" && messages?.length === 0 ? (
        //       <div className={`mb-4 text-left`}>
        //         <span
        //           className={`inline-block p-3 max-w-[80%] rounded-lg bg-white`}
        //         >
        //           <p>
        //             Hi! Let us know how we can help you. Otherwise, please click
        //             one of the categories below to get started.
        //           </p>
        //           <div className="mt-2 flex flex-wrap gap-2">
        //             <Link
        //               href="/sell-or-lease-my-property font-lato"
        //               className="text-black underline"
        //             >
        //               Sell My Property
        //             </Link>
        //             <Link
        //               href="/sell-or-lease-my-property font-lato"
        //               className="text-black underline"
        //             >
        //               Lease My Property
        //             </Link>
        //           </div>
        //         </span>
        //       </div>
        //     ) : (
        //       <>
        //         <div
        //           id="msg"
        //           ref={messagesContainerRef}
        //           className="enhanced-textarea overflow-y-auto pl-0 pb-32 "
        //         >
        //           {messages.map((message, index) => (
        //             <>
                    
        //             <div
        //               key={index}
        //               className={`mb-4 ${
        //                 message.role === "system" ? "text-left" : "text-right"
        //               }`}
                      
        //             >
                      
        //               <span
        //                 className={`inline-block rounded-lg max-w-[80%] p-3 ${
        //                   message.role === "system"
        //                     ? "bg-white rounded-br-none"
        //                     : "text-start bg-gray-200 rounded-bl-none mr-2"
        //                 }
                     
                      
        //               `}
        //               ref={
        //                   message.role === "system" && index === messages.length - 1
        //                     ? botResponseRef
        //                     : null
        //                 }
                      
        //               >
                        
        //                 <p className="text-[16px] font-light"
                        
        //                 >
                          
        //                   {message.content}</p>
        //               </span>
                      
        //               <div>
        //                 {message.properties &&
        //                   message.properties.length > 0 && (
        //                     <div className="mt-4">
        //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
        //                     {message.properties.map((property, index) => (
        //                       message.isLoading ? (                            
        //                       <ContentLoader viewBox="0 0 500 280" height={280} width={500} className="ml-2">
        //                         <rect x="3" y="3" rx="10" ry="10" width="400" height="180" />
        //                         <rect x="6" y="190" rx="0" ry="0" width="292" height="15" />
        //                         <rect x="4" y="215" rx="0" ry="0" width="239" height="15" />
        //                         <rect x="4" y="242" rx="0" ry="0" width="274" height="15" />
        //                       </ContentLoader>):(<div
        //                         key={index}
        //                         className="bg-white shadow-sm p-0 cursor-pointer border-lightgray border w-full"
        //                         onClick={() => {
        //                           router.push(
        //                             `/property/${property?.id}/media/images`
        //                           );
        //                         }}
        //                       >
        //                         {property?.media &&
        //                           Array.isArray(property?.media) && (
        //                             <EmblaCarousel
        //                               slides={property?.media}
        //                             />
        //                           )}
        //                         <div className="ml-4">
        //                           <div className="mt-4 flex flex-col space-y-2">
        //                             <h5 className="tracking-wide">
        //                               {property?.priceDetails.displayPrice}
        //                             </h5>

        //                             <h5 className="text-black font-light">
        //                               {
        //                                 property?.addressParts
        //                                   .displayAddress
        //                               }
        //                             </h5>
        //                           </div>

        //                           <div className="mb-6 text-sm">
        //                             <h4 className="text-black mb-0">
        //                               {/* 4B 4B 2C | House */}
        //                               {
        //                                 property?.bedrooms
        //                               }B {property?.bathrooms}B{" "}
        //                               {property?.carspaces}C |{" "}
        //                               {property?.propertyTypes?.length > 0
        //                                 ? property?.propertyTypes?.join(",")
        //                                 : "N/A"}
        //                             </h4>
        //                             <p className="leading-7">
        //                               Inspection{" "}
        //                               {dayjs(
        //                                 property?.dateAvailable
        //                               )?.format("DD/MM/YYYY")}
        //                             </p>
        //                           </div>
        //                         </div>
        //                       </div>)
        //                     ))}
        //                   </div>
        //                 </div>)
                              
                            
        //               }

                        
        //               </div>
        //             </div></>
        //           ))}

        //           {botThinking && (
        //             <div className="text-left mb-2 p-3 space-x-1 flex items-center max-w-[80%] ">
        // <div className="rounded-full h-3 w-3 bg-black animate-pulse"></div>
                    
        //             <p className="animate-pulse text-[16px] font-light">
                    
        //               Getting the information for you
        //             </p>
                    
        //           </div>
        //           )}
        //           <div ref={messagesEndRef} />
        //         </div>
                
        //       </>
        //     )
        //     )
        (<>
          <div
            id="msg"
            ref={messagesContainerRef}
            className="enhanced-textarea overflow-y-auto pl-0 pb-32 "
          >
            {messages.map((message, index) => (
              <>
              
              <div
                key={index}
                className={`mb-4 ${
                  message.role === "system" ? "text-left" : "text-right"
                }`}
                
              >
                {
                  message?.videoUrl && (
                    <div
                          key={index}
                          className="p-0 w-full"
                          
                        >

                          <video
                            className="w-full"
                            autoPlay
              muted
              loop
              playsInline
              preload="metadata"
                            src={message?.videoUrl}
                          />
                        
                        </div>
                  )
                }
                <span
                  className={`inline-block rounded-lg max-w-[80%] p-3 ${
                    message.role === "system"
                      ? "bg-white rounded-br-none ml-2"
                      : "text-start bg-gray-200 rounded-bl-none mr-2"
                  }
               
                
                `}
                ref={
                    message.role === "system" && index === messages.length - 1
                      ? botResponseRef
                      : null
                  }
                
                >
                  
                  <p className="text-[16px] font-light p-0 m-0"
                  
                  >
                    
                    {message.content}</p>
                </span>
                
                <div>
                  {message.properties &&
                    message.properties.length > 0 && (
                      <div className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {message.properties.map((property, index) => (
                        message.isLoading ? (                            
                        <ContentLoader viewBox="0 0 500 280" height={280} width={500} className="ml-2">
                          <rect x="3" y="3" rx="10" ry="10" width="400" height="180" />
                          <rect x="6" y="190" rx="0" ry="0" width="292" height="15" />
                          <rect x="4" y="215" rx="0" ry="0" width="239" height="15" />
                          <rect x="4" y="242" rx="0" ry="0" width="274" height="15" />
                        </ContentLoader>):(<div
                          key={index}
                          className="bg-white shadow-sm p-0 cursor-pointer border-lightgray border w-full"
                          onClick={() => {
                            router.push(
                              `/property/${property?.id}/media/images`
                            );
                          }}
                        >
                          {property?.media &&
                            Array.isArray(property?.media) && (
                              <EmblaCarousel
                                slides={property?.media}
                              />
                            )}
                          <div className="ml-4">
                            <div className="mt-4 flex flex-col space-y-2">
                              <h5 className="tracking-wide">
                                {property?.priceDetails.displayPrice}
                              </h5>

                              <h5 className="text-black font-light">
                                {
                                  property?.addressParts
                                    .displayAddress
                                }
                              </h5>
                            </div>

                            <div className="mb-6 text-sm">
                              <h4 className="text-black mb-0">
                                {/* 4B 4B 2C | House */}
                                {
                                  property?.bedrooms
                                }B {property?.bathrooms}B{" "}
                                {property?.carspaces}C |{" "}
                                {property?.propertyTypes?.length > 0
                                  ? property?.propertyTypes?.join(",")
                                  : "N/A"}
                              </h4>
                              <p className="leading-7">
                                Inspection{" "}
                                {dayjs(
                                  property?.dateAvailable
                                )?.format("DD/MM/YYYY")}
                              </p>
                            </div>
                          </div>
                        </div>)
                      ))}
                    </div>
                  </div>)
                        
                      
                }
                {message.agents &&
                    message.agents.length > 0 && (
                      <div className="mt-4 ">
                    
                      {message.isLoading ? (                            
                        <ContentLoader viewBox="0 0 500 280" height={280} width={500} className="ml-2">
                          <rect x="3" y="3" rx="10" ry="10" width="400" height="180" />
                          <rect x="6" y="190" rx="0" ry="0" width="292" height="15" />
                          <rect x="4" y="215" rx="0" ry="0" width="239" height="15" />
                          <rect x="4" y="242" rx="0" ry="0" width="274" height="15" />
                        </ContentLoader>):(
                          <AgentCarousel
                          agents={message.agents || []}
                          />
                          
                        )}
                    
                  </div>)  
                }
                {
                  message.button && (
                    <div
                    className="flex w-full "
                    ><Button
                    onClick={() => {}}
                      className="gray-button flex w-[22rem] md:w-[30rem] mx-auto justify-center items-center capitalize font-abchanel"
                      aria-label="Reset search"
                    >
                      {message.buttonText}
                    </Button></div>
                    
                  )
                }
                
                </div>
              </div></>
            ))}

            {botThinking && (
              <div className="text-left mb-2 p-3 space-x-1 flex items-center max-w-[80%] ">
  <div className="rounded-full h-3 w-3 bg-black animate-pulse"></div>
              
              <p className="animate-pulse text-[16px] font-light">
              
                Getting the information for you
              </p>
              
            </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
        </>)
            }
          {title === "INSIDE AUSREALTY" && (
            <ImageGrid data={INSIDE_AUSREALTY} isInsideAusrealty={true} />
          )}
          {title === "OUR PEOPLE" && <ImageGrid data={OUR_TEAM_DATA} />}
          {title === "LOCATIONS" && <ImageGrid data={LOOKING_TO_RENT} isLocation={true}/>}
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
              placeholder={placeholder
              }
              autoCapitalize="on"
              className="start-campaign-input w-full  z-10 flex-grow p-2 bg-lightgray rounded-md py-5 pl-3 pr-8 outline-none focus:outline-none resize-none overflow-y-hidden font-lato text-[16px] font-light"
            />
            {/* {
              inputValue.length > 0 ? (<button
              onClick={
                () => {
                  handleSend(
                    inputValue
                  );
                }
              }
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black  disabled:cursor-not-allowed transition-colors duration-200"
              disabled={indexPage ? intentExtracting : (botThinking || isTyping)?true:false}
            >
              <IoSend title="Send" className="w-5 h-5" />
            </button>
              ):
              (<button
                onClick={startListening}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-black  disabled:cursor-not-allowed transition-colors duration-200  p-2 rounded-full ${
          isListening ? 'bg-black text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
                disabled={indexPage ? intentExtracting : (botThinking || isTyping)?true:false}>
              <svg  width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-current">
      <rect x="11" y="1" width="2" height="22" rx="1" fill="currentColor" />
      <rect 
        x="7" 
        y="6" 
        width="2" 
        height="12" 
        rx="1" 
        fill="currentColor" 
        className={`transition-transform duration-300 ${isListening ? 'animate-voice-wave1' : ''}`}
        style={{ transformOrigin: 'center' }}
      />
      <rect 
        x="15" 
        y="6" 
        width="2" 
        height="12" 
        rx="1" 
        fill="currentColor"
        className={`transition-transform duration-300 ${isListening ? 'animate-voice-wave2' : ''}`}
        style={{ transformOrigin: 'center' }}
      />
      <rect 
        x="3" 
        y="8" 
        width="2" 
        height="8" 
        rx="1" 
        fill="currentColor"
        className={`transition-transform duration-300 ${isListening ? 'animate-voice-wave3' : ''}`}
        style={{ transformOrigin: 'center' }}
      />
      <rect 
        x="19" 
        y="8" 
        width="2" 
        height="8" 
        rx="1" 
        fill="currentColor"
        className={`transition-transform duration-300 ${isListening ? 'animate-voice-wave4' : ''}`}
        style={{ transformOrigin: 'center' }}
      />
    </svg>
              </button>)
              
            } */}
            <button
              onClick={
                () => {
                  handleSend(
                    inputValue
                  );
                }
              }
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black  disabled:cursor-not-allowed transition-colors duration-200"
              disabled={indexPage ? intentExtracting : (botThinking || isTyping)?true:false}
            >
              <IoSend title="Send" className="w-5 h-5" />
            </button>
            
            {!indexPage && (
              <button
                onClick={handleStartAgain}
                className="p-2 text-black transition-colors duration-200 rounded-full fixed right-2 top-20 -translate-y-2 bg-white hover:bg-gray-100 shadow-md border border-gray-200 focus:outline-none"
                aria-label="Reset search"
              >
                <LuRotateCcw title="Restart" className="w-6 h-6" />
              </button>
            )}
            {
              (!indexPage && showScrollButton)  && (
                <button
        onClick={
          () => {
            scrollToElement(messagesEndRef);

          }
        }
        className="p-2 text-black transition-colors duration-200 rounded-full fixed right-2 top-[82%] -translate-y-[82%] bg-white hover:bg-gray-100 shadow-md border border-gray-200 focus:outline-none"
        
        aria-label="Scroll to bottom"
      >
        <LuChevronDown className="w-6 h-6" />
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
                }
                ${(botThinking || isTyping) ? "cursor-not-allowed" : ""}
                `}
                onClick={() => {
                  if(!isTyping && !botThinking){
                    handleBoxClick(box, index);
                  }
                  
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
