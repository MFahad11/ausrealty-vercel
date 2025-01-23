import React, { useEffect, useState, useRef, FormEvent } from 'react'
import { IoSend } from 'react-icons/io5'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ImageGrid from './ImageGrid'
import Form from './Form'
import { useRouter } from 'next/router'
import InstaGrid from './InstaGrid'
import { OUR_TEAM_DATA } from '@/constants/our-team'
import { INSIDE_AUSREALTY } from '@/constants/inside-ausrealty'
import { LOOKING_TO_RENT } from '@/constants/looking-to-rent'
import Link from 'next/link'
import dayjs from 'dayjs'
import axiosInstance from '@/utils/axios-instance'
import ContentLoader from 'react-content-loader'
import { RiVoiceprintFill } from 'react-icons/ri'
import {
  checkIsAddress,
  handleBuyingChat,
  handleIdentifyIntent,
  handleLeasingChat,
  handleRenChat,
  handleSellingChat,
  handleTranscription
} from '@/utils/openai'
import {
  LuChevronDown,
  LuLoader2,
  LuMic,
  LuMicOff,
  LuRotateCcw
} from 'react-icons/lu'
import PageLoader from '../ui/PageLoader'
import { convertBlobToBase64, getSupportedMimeType } from '@/utils/helpers'
import AgentCarousel from '../ui/carousel/AgentCarousel'
import Button from '../ui/Button'
import PropertyCarousel from '../ui/carousel/PropertyCarousel'
import QuickSearch from './QuickSearch'
import { useIsMessageStore } from '@/store/isMessageStore'

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
  boxRefs
}: {
  instaData: any
  title: string
  firstMessage: string
  prompt: string
  placeholder: string
  route: string
  index: number
  boxes: Array<{
    title: string
    description: string
    prompt: string
    firstMessage?: string
    placeholder?: string
    route?: string
    videoUrl?: string
    index?: number
  }>
  indexPage?: boolean
  handleBoxClick: (
    box: {
      title: string
      description?: string
      prompt: string
    },
    index: number
  ) => void
  scrollContainerRef: any
  boxRefs: any
}) => {
  const [messages, setMessages] = useState<
    Array<{
      role: string
      content: string
      properties?: any[]
      videoUrl?: string
      isLoading?: boolean
      agents?: any[]
      button?: boolean
      buttonText?: string
    }>
  >([])
  const [intentExtracting, setIntentExtracting] = useState(false)
  const router = useRouter()
  const [fetchedProperties, setFetchedProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [botThinking, setBotThinking] = useState(false)
  const [quickSearch,setQuickSearch]= useState(false)
  const [transcription, setTranscription] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const messagesEndRef = useRef(null)
  const botResponseRef = useRef(null)
  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const silenceTimeoutRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const checkSilenceRef = useRef<boolean>(false)
  const setIsMessage=useIsMessageStore((state) => state.setIsMessage);
  const isMessage=useIsMessageStore((state) => state.isMessage);
  const [propertyForm, setPropertyForm] = useState(false)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [agents,setAgents]=useState([])
  useEffect(() => {
    setMessages([])
    setFetchedProperties([])
    const savedMessages = localStorage.getItem(prompt)
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
      const isSendMessage = localStorage.getItem(`${prompt}_send_message`)
      if (isSendMessage) {
        const getStoredMessages = localStorage.getItem(prompt)
        if (getStoredMessages) {
          const getLatestMessage = JSON.parse(getStoredMessages)
          localStorage.removeItem(`${prompt}_send_message`)
          searchData(
            getLatestMessage[getLatestMessage.length - 1]?.content,
            false
          )
        }
      }
    } else {
      // if (title !== "SELL OR LEASE MY PROPERTY") {
      initializeChat()
      // }
    }
  }, [prompt])
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(prompt, JSON.stringify(messages))
      if(indexPage){
        setIsMessage(true);
      }
    }
  }, [messages])

  useEffect(() => {
    resizeTextarea()
  }, [inputValue])
  const fetchAgents=async ()=>{
    try {
      const response=await axiosInstance.get('/api/agent')
    if(response?.data?.success){
      setAgents(response?.data?.data)
    }
    } catch (error) {
      
    }
  }
  useEffect(()=>{

    if((title === 'SELL MY PROPERTY' || title === 'LEASE MY PROPERTY') && agents?.length==0){
      fetchAgents()
    }
  },[title])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: true,
          sampleRate: 48000
        }
      })

      // @ts-ignore

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      // @ts-ignore

      const source = audioContextRef.current.createMediaStreamSource(stream)
      // @ts-ignore

      analyserRef.current = audioContextRef.current.createAnalyser()
      // @ts-ignore

      analyserRef.current.fftSize = 2048
      source.connect(analyserRef.current)

      const options = { mimeType: getSupportedMimeType() }

      // @ts-ignore

      mediaRecorderRef.current = new MediaRecorder(stream, options)
      audioChunksRef.current = []
      // @ts-ignore

      mediaRecorderRef.current.ondataavailable = event => {
        if (event.data.size > 0) {
          // @ts-ignore

          audioChunksRef.current.push(event.data)
        }
      }
      // @ts-ignore

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: options.mimeType
        })
        await processAudio(audioBlob)
      }

      // Set up silence detection
      // @ts-ignore

      const dataArray = new Float32Array(analyserRef.current.fftSize)
      // @ts-ignore

      let silenceStart = null
      const SILENCE_DURATION = 2000 // 2 seconds

      const checkSilence = () => {
        if (!checkSilenceRef.current || !analyserRef.current) {
          return
        }

        try {
          const isSilent = detectSilence(analyserRef.current, dataArray)

          if (isSilent) {
            // @ts-ignore

            if (!silenceStart) {
              silenceStart = Date.now()
            } else {
              const silenceDuration = Date.now() - silenceStart

              if (silenceDuration > SILENCE_DURATION) {
                stopRecording()
                return
              }
            }
          } else {
            // @ts-ignore

            if (silenceStart) {
            }
            silenceStart = null
          }
          // @ts-ignore

          silenceTimeoutRef.current = setTimeout(checkSilence, 100)
        } catch (error) {}
      }

      // Start the recording
      // @ts-ignore

      mediaRecorderRef.current.start(1000)

      setIsRecording(true)
      setIsListening(true)
      checkSilenceRef.current = true // Start silence detection

      checkSilence() // Start the silence detection loop
    } catch (error) {
      console.error('Error starting recording:', error)
      setIsListening(false)
    }
  }

  const stopRecording = () => {
    checkSilenceRef.current = false 
    if (mediaRecorderRef.current) {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
      // @ts-ignore
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsListening(false)
      // @ts-ignore

      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())

      if (audioContextRef.current) {
        // @ts-ignore

        audioContextRef.current.close().catch(error => {})
      }

      mediaRecorderRef.current = null
    }
  }

  const detectSilence = (analyser: AnalyserNode, dataArray: Float32Array) => {
    try {
      analyser.getFloatTimeDomainData(dataArray)

      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i]
      }
      const rms = Math.sqrt(sum / dataArray.length)
      const db = 20 * Math.log10(rms)

      // Only log every few iterations to avoid flooding
      if (Math.random() < 0.1) {
        // Log roughly 10% of the readings
      }

      return db < -45
    } catch (error) {
      return false
    }
  }
  // @ts-ignore

  // @ts-ignore
  const processAudio = async audioBlob => {
    try {
      // Convert the audio blob to base64
      const base64Audio = await convertBlobToBase64(audioBlob)

      // Create a new Blob from the base64 data
      const base64Response = await fetch(`data:audio/mp4;base64,${base64Audio}`)
      const processedBlob = await base64Response.blob()

      const transcribedText = await handleTranscription(processedBlob)
      setTranscription(transcribedText)
      handleSend(transcribedText.trim()) // Send final transcription to GPT
    } catch (error) {
      console.error('Error processing audio:', error)
    } finally {
    }
  }
  const [formData, setFormData] = useState({
    suburb: '',
    priceRange: '',
    bedrooms: '',
    mustHaves: ''
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
  }
  const startListening = () => {
    // @ts-ignore
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    let finalTranscript = ''
    recognition.start()
    setIsListening(true)

    // recognition.onresult = (event:any) => {
    //   const transcript = event.results[0][0].transcript;
    //   setTranscription(transcript);
    //   setIsListening(false);

    //   recognition.stop();
    //   handleSend(
    //     transcript
    //   );
    // };

    recognition.onresult = (event: any) => {
      let interimTranscript = ''

      // Combine interim and final results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript + ' '
        }
      }

      // Update the transcription state
      setTranscription(finalTranscript + interimTranscript)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (finalTranscript) {
        handleSend(finalTranscript.trim()) // Send final transcription to GPT
      }
    }
  }

  const initializeChat = async () => {

    if (firstMessage) {
      setMessages([
        {
          role: 'system',
          content: firstMessage,
          videoUrl: boxes[index]?.videoUrl
        }
        
      ])
      
    }
  }
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

  const scrollToElement = (ref: any) => {
    if (ref?.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  useEffect(() => {
    scrollToElement(messagesEndRef)
  }, [])

  useEffect(() => {
    // if the last message is user message, then call the below function
    if (messages[messages.length - 1]?.role === 'user') {
      scrollToElement(messagesEndRef)
    }
  }, [messages])
  const getAllProperties = async () => {
      try {
        const response = await axiosInstance.post('/api/domain/listings')
        if (response.data.success) {
          const properties = response.data.data
          if (properties.length > 0) {
            setFetchedProperties(() => {
              const updatedProperties = properties
              return updatedProperties
            })
          }
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
        
      }
    }
  useEffect(() => {
    getAllProperties()

  }, [])
  const handleSend = async (inputValue: string) => {
    if (!inputValue.trim()) {
      // toast.error("Please type something");
      return
    }
    const userMessage = { role: 'user', content: inputValue }
    if (!indexPage) {
      setMessages([...messages, userMessage])
      // scrollToElement(messagesEndRef);
    } else {
      setIntentExtracting(true)
    }
    setInputValue('')

    try {


      // user input to api
      searchData(userMessage?.content)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred'
      toast.error(errorMessage)
      setIsTyping(false)
      setBotThinking(false)
      setIntentExtracting(false)
    }
  }
  const searchData = async (userInput: string, extractIntent = true) => {
    let data: any
    let redirecting = false
    setBotThinking(true)
    if (extractIntent) {
      const intent = await handleIdentifyIntent(userInput)
      const isAddress = await checkIsAddress(userInput)
      
    
    if(isAddress?.isAddress){
      const property = fetchedProperties.find((property:{
        addressParts:{
          suburb:string,
          postcode:string,
          displayAddress:string
        },
        agentInfo:{
          email:string,
          name:string
        }
      }) => {
        return (
          property.addressParts.suburb.toLowerCase() == isAddress?.suburb?.toLowerCase() &&
          property.addressParts.postcode == isAddress?.postcode &&
          property.addressParts.displayAddress.toLowerCase()?.includes(isAddress?.address.toLowerCase())
        )
      })
      // @ts-ignore
      property?.agentInfo?.map((agent) => {
        axiosInstance.post('/api/send-email', {
          to: agent.email,
          subject: `${property.addressParts.displayAddress} has been searched`,
          text: `Hello ${agent.name}, ${property.addressParts.displayAddress} has been searched.`
        })
      })
    }
      if (intent?.response) {
        const { redirect = '/', prompt: extractedPrompt,response } = JSON.parse(intent?.response)
        if (extractedPrompt && extractedPrompt !== prompt){
          const getStoredMessages = localStorage.getItem(extractedPrompt)
          if (getStoredMessages) {
            const storedMessages = JSON.parse(getStoredMessages)
            localStorage.setItem(
              extractedPrompt,
              JSON.stringify([
                ...storedMessages,
                { role: 'user', content: userInput }
              ])
            )
          } else {
            const messages = [{ role: 'user', content: userInput }]
            localStorage.setItem(extractedPrompt, JSON.stringify(messages))
          }
          // remove the last message from the messages array for the current prompt
          const currentPromptMessages = localStorage.getItem(prompt)
          if (currentPromptMessages) {
            const messages = JSON.parse(currentPromptMessages)
            if(messages.length > 1){
              messages.pop()
            }
            
            localStorage.setItem(prompt, JSON.stringify(messages))
            setMessages(messages)
          }
          localStorage.setItem(`${extractedPrompt}_send_message`, 'true')
          setIntentExtracting(false)
          redirecting = true
          router.push(`/chat/${redirect}`)
          
          
          

          // searchData(userInput);
        }
        
        else if(indexPage && prompt==='INDEX_PROMPT' && response){

          setMessages((prevMessages) => {
            const userMessage = {
              role: "user",
              content: userInput,
            }
            const newMessages = [...prevMessages, userMessage];
            return newMessages;
          })
          setIntentExtracting(false)
          setMessages((prevMessages) => {
            const newMessage = {
              role: "system",
              content: response

            };
            const updatedMessages = [...prevMessages, newMessage];
            typewriterEffect(response, updatedMessages.length - 1);
            return updatedMessages;
          });
        }
        else if (indexPage && prompt==='INDEX_PROMPT' &&redirect) {
          router.push(`/chat/${redirect}`)
          setIntentExtracting(false)
          setBotThinking(false)

        }
        // if the
        // else{
        //   setIntentExtracting(false);
        //   setBotThinking(false);
        // }
      }
    }

    if (!indexPage && !redirecting) {
      const body: {
        objective?: string
        saleMode?: string
      } | null = {}

      if (title === 'LOOKING TO BUY') {
        body['objective'] = 'sale'
        body['saleMode'] = 'buy'
      } else if (title === 'LOOKING TO RENT') {
        body['objective'] = 'rent'
        body['saleMode'] = 'rent'
      }
      try {
        let storedProperties = fetchedProperties || []
        storedProperties = storedProperties.filter((property) => {
          if(body.objective && property.objective !== body.objective){
            return false
          }
          if(body.saleMode && property.saleMode !== body.saleMode){
            return false
          }
          return true
        })
        if (title === 'LOOKING TO BUY') {
          data = await handleBuyingChat(
            userInput,
            messages.map(({ content, role }) => ({
              content,
              role
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
              website: 'auseralty.com.au',
              agentsResponsible: property?.agentInfo?.map((agent: any) => ({
                email: agent?.email,
                phone: agent?.mobile,
                firstName: agent?.firstName,
                lastName: agent?.lastName,
                suburbsCovered: agent?.suburbs,
              }))
            }))
          )
        } else if (title === 'LOOKING TO RENT') {
          data = await handleRenChat(
            userInput,
            messages.map(({ content, role }) => ({
              content,
              role
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
              website: 'auseralty.com.au',
              agentsResponsible: property?.agentInfo?.map((agent: any) => ({
                email: agent?.email,
                phone: agent?.mobile,
                firstName: agent?.firstName,
                lastName: agent?.lastName,
                suburbsCovered: agent?.suburbs,
              }))
            }))
          )
        } else if (title === 'SELL MY PROPERTY') {
          data = await handleSellingChat(
            userInput,
            messages.map(({ content, role }) => ({
              content,
              role
            })),
            agents
          )
        } else if (title === 'LEASE MY PROPERTY') {
          data = await handleLeasingChat(
            userInput,
            messages.map(({ content, role }) => ({
              content,
              role
            })),
            agents
          )
        }
        if (data?.extractedInfo) {
          setMessages(prevMessages => {
            const newMessage = {
              role: 'system',
              content: data?.response,
              // add the media array property in each property object again based on id or propertyId
              properties:
                data?.extractedInfo?.map((info: any) => {
                  const property = storedProperties.find((property: any) => {
                    return (
                      property.id == info.id ||
                      property.propertyId == info.propertyId
                    )
                  })
                  if (property) {
                    return {
                      ...property,
                      media:
                        property?.media?.length >= 1 ? property?.media : null
                    }
                  }
                  return null
                }) || [],
              isLoading: true
            }
            const updatedMessages = [...prevMessages, newMessage]
            typewriterEffect(data?.response, updatedMessages.length - 1)
            return updatedMessages
          })
        } else if (data?.extractedAgents) {
          setMessages(prevMessages => {
            const newMessage = {
              role: 'system',
              content: data?.response
            }

            const agentMessage = {
              role: 'system',
              content: 'See below for the best agents to connect with',
              agents: data?.extractedAgents || [],
              isLoading: true
            }
            const pricingToolMessage = {
              role: 'system',
              content: 'Alternatively, click below to try our pricing tool.',
              isLoading: true,
              button: true,
              buttonText: 'Price Assessment'
            }
            let updatedMessages = [...prevMessages, newMessage]
            typewriterEffect(data?.response, updatedMessages.length - 1)
            if(data?.extractedAgents?.length > 0){
              updatedMessages = [...updatedMessages, agentMessage]
            typewriterEffect(
              'See below for the best agents to connect with',
              updatedMessages.length - 1
            )
            updatedMessages = [...updatedMessages, pricingToolMessage]
            typewriterEffect(
              'Alternatively, click below to try our pricing tool.',
              updatedMessages.length - 1
            )
            }
            return updatedMessages
          })
        } else {
          setMessages(prevMessages => {
            const newMessage = { role: 'system', content: data?.response }
            const updatedMessages = [...prevMessages, newMessage]
            typewriterEffect(data?.response, updatedMessages.length - 1)
            return updatedMessages
          })
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'An unexpected error occurred'
        toast.error(errorMessage)
        setBotThinking(false)
      }
    }
    else if (indexPage) {
      setIntentExtracting(false)
      setBotThinking(false)
    }
  }

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value)
  }

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend(inputValue)
    }
  }

  const typewriterEffect = (text: string, index: number) => {
    setIsTyping(true)
    setBotThinking(false)
    let charIndex = 0 // Start from 0, not -1

    const interval = setInterval(() => {
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages]
        // Only update if we haven't reached the end of the text
        if (charIndex < text?.length) {
          updatedMessages[index] = {
            ...updatedMessages[index],
            content: text?.slice(0, charIndex + 1) // Use slice instead of charAt
          }
          return updatedMessages
        }
        return prevMessages
      })
      // scrollToElement(botResponseRef);
      charIndex++
      if (charIndex > text?.length) {
        // update the isLoading property to false
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages]
          updatedMessages[index] = {
            ...updatedMessages[index],
            isLoading: false
          }
          return updatedMessages
        })
        setIsTyping(false)
        clearInterval(interval)
      }
    }, 25)

    return () => clearInterval(interval)
  }

  const resizeTextarea = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const lineHeight = parseInt(
        window.getComputedStyle(textarea).lineHeight,
        10
      )
      const rows = Math.floor(scrollHeight / lineHeight)
      const maxRows = 5

      if (rows > maxRows) {
        textarea.style.height = `${lineHeight * maxRows}px`
        textarea.style.overflowY = 'auto'
      } else {
        textarea.style.height = `${scrollHeight}px`
        textarea.style.overflowY = 'hidden'
      }
    }
  }

  const handleStartAgain = () => {
    setMessages([])
    localStorage.removeItem(prompt)
    initializeChat()
  }
  return (
    <div className='w-full h-full flex flex-col justify-between'>
      <ToastContainer />
      {indexPage && intentExtracting && !isMessage && <PageLoader />}

      <div className='max-w-4xl w-full mx-auto flex flex-col flex-grow pb-14 overflow-y-auto'>
        <div className=' m-0 w-full rounded-lg mt-4'>
          {title === 'MOMENTS FROM HOME' && <InstaGrid data={instaData} />}
          {(title === 'SELL MY PROPERTY' ||
            title === 'LEASE MY PROPERTY' ||
            title === 'LOOKING TO BUY' ||
            title === 'LOOKING TO RENT' ||
            title === 'INDEX') && (
            
            <>
              <div
                id='msg'
                ref={messagesContainerRef}
                className='enhanced-textarea overflow-y-auto pl-0 pb-32 '
              >
                {(messages && messages?.length>=1) && messages.map((message, index) => (
                  <>
                    <div
                      key={index}
                      className={`mb-4 ${
                        message?.role === 'system' ? 'text-left' : 'text-right'
                      }`}
                    >
                      {message?.videoUrl && (
                        <div key={index} className='p-0 w-full'>
                          <video
                            className='w-full'
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload='metadata'
                            src={message?.videoUrl}
                          />
                        </div>
                      )}
                      <span
                        className={`inline-block rounded-lg max-w-[80%] p-3 ${
                          message?.role === 'system'
                            ? 'bg-white rounded-br-none ml-2'
                            : 'text-start bg-gray-200 rounded-bl-none mr-2'
                        }
               
                
                `}
                        ref={
                          message?.role === 'system' &&
                          index === messages.length - 1
                            ? botResponseRef
                            : null
                        }
                      >
                        <p className='text-[16px] font-light p-0 m-0'>
                          {message?.content}
                        </p>
                      </span>

                      <div>
                        {message?.properties && message?.properties.length > 0 && (
                          <div className='mt-4'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 mt-2'>
                              {message?.properties.map((property, index) =>
                                message?.isLoading ? (
                                  <ContentLoader
                                    viewBox='0 0 500 280'
                                    height={280}
                                    width={500}
                                    className='ml-2'
                                  >
                                    <rect
                                      x='3'
                                      y='3'
                                      rx='10'
                                      ry='10'
                                      width='400'
                                      height='180'
                                    />
                                    <rect
                                      x='6'
                                      y='190'
                                      rx='0'
                                      ry='0'
                                      width='292'
                                      height='15'
                                    />
                                    <rect
                                      x='4'
                                      y='215'
                                      rx='0'
                                      ry='0'
                                      width='239'
                                      height='15'
                                    />
                                    <rect
                                      x='4'
                                      y='242'
                                      rx='0'
                                      ry='0'
                                      width='274'
                                      height='15'
                                    />
                                  </ContentLoader>
                                ) : (
                                  <div
                                    key={index}
                                    className='bg-white shadow-sm p-0 border-lightgray border w-full  cursor-pointer'
                                    onClick={() => {
                                      if(title === 'LOOKING TO BUY'){
                                        router.push(`/property/buy/${property?.id}/media/images`)
                                      }
                                      else if(title === 'LOOKING TO RENT'){
                                        router.push(`/property/rent/${property?.id}/media/images`)

                                      }
                                      
                                    }}
                                  >
                                    {property?.media &&
                                      Array.isArray(property?.media) && (
                                        <PropertyCarousel
                                          slides={property?.media}
                                        />
                                      )}
                                    <div className='ml-4'
                                    
                                    >
                                      <div className='mt-4 flex flex-col space-y-2'>
                                        <h5 className='tracking-wide'>
                                          {property?.priceDetails.displayPrice}
                                        </h5>

                                        <h5 className='text-black font-light'>
                                          {
                                            property?.addressParts
                                              .displayAddress
                                          }
                                        </h5>
                                      </div>

                                      <div className='mb-6 text-sm'>
                                        <h4 className='text-black mb-0'>
                                          {/* 4B 4B 2C | House */}
                                          {property?.bedrooms}B{' '}
                                          {property?.bathrooms}B{' '}
                                          {property?.carspaces}C |{' '}
                                          {property?.propertyTypes?.length > 0
                                            ? property?.propertyTypes?.join(',')
                                            : 'N/A'}
                                        </h4>
                                        <p className='leading-7'>
                                          Inspection{' '}
                                          {dayjs(
                                            property?.dateAvailable
                                          )?.format('DD/MM/YYYY')}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                        {message?.agents && message?.agents.length > 0 && (
                          <div className='mt-4 '>
                            {message?.isLoading ? (
                              <ContentLoader
                                viewBox='0 0 500 280'
                                height={280}
                                width={500}
                                className='ml-2'
                              >
                                <rect
                                  x='3'
                                  y='3'
                                  rx='10'
                                  ry='10'
                                  width='400'
                                  height='180'
                                />
                                <rect
                                  x='6'
                                  y='190'
                                  rx='0'
                                  ry='0'
                                  width='292'
                                  height='15'
                                />
                                <rect
                                  x='4'
                                  y='215'
                                  rx='0'
                                  ry='0'
                                  width='239'
                                  height='15'
                                />
                                <rect
                                  x='4'
                                  y='242'
                                  rx='0'
                                  ry='0'
                                  width='274'
                                  height='15'
                                />
                              </ContentLoader>
                            ) : (
                              <AgentCarousel agents={message?.agents || []} 
                              isOverlayOpen={isOverlayOpen}
                              setIsOverlayOpen={setIsOverlayOpen}
                              />
                            )}
                          </div>
                        )}
                        {message?.button && (
                          <><div className='flex w-full '>
                            <Button
                              onClick={() => {
                                setQuickSearch(!quickSearch)
                                setPropertyForm(false)
                              }}
                              className='gray-button flex w-[22rem] md:w-[30rem] mx-auto justify-center items-center capitalize font-abchanel'
                              aria-label='Reset search'
                            >
                              {message?.buttonText}
                            </Button>
                          </div></>
                        )}
                        
                        
                        
                      </div>
                    </div>
                  </>
                ))}

                {botThinking && (
                  <div className='text-left mb-2 p-3 space-x-1 flex items-center max-w-[80%] '>
                    <div className='rounded-full h-3 w-3 bg-black animate-pulse'></div>

                    <p className='animate-pulse text-[16px] font-light'>
                      Getting the information for you
                    </p>
                  </div>
                )}
                {
                          quickSearch &&  <span
                          className={`inline-block rounded-lg max-w-[80%] p-3 bg-white rounded-br-none ml-2`}
                          ref={
                           index === messages.length - 1
                              ? botResponseRef
                              : null
                          }
                        >
                          <p className='text-[16px] font-light p-0 m-0'>
                          Can you please input your address in the text box below?
                          </p>
                        </span>
                        }
                {
                          quickSearch && <QuickSearch
                          setQuickSearch={setQuickSearch}
                          setPropertyForm={setPropertyForm}
                          propertyForm={propertyForm}
                          propertyData={fetchedProperties}
                          />
                }
                
                <div ref={messagesEndRef} />
              </div>
            </>
          )}
          {title === 'INSIDE AUSREALTY' && (
            <ImageGrid data={INSIDE_AUSREALTY} isInsideAusrealty={true} />
          )}
          {title === 'OUR PEOPLE' && <ImageGrid data={OUR_TEAM_DATA} />}
          {title === 'LOCATIONS' && (
            <ImageGrid data={LOOKING_TO_RENT} isLocation={true} />
          )}
        </div>
      </div>
      <div
        className={`z-10 w-full fixed left-0 right-0 bg-white px-6 bottom-0 pb-4 pt-2 text-center`}
      >
        <div className='flex flex-col gap-2'>
        
        {
          (!quickSearch || propertyForm) && (
            
            <>
            {
              (quickSearch && propertyForm) && (<Button
                className={`black-button w-full max-w-xs mx-auto`}
                onClick={
                  () => {
                    setIsOverlayOpen(true)
                  }
                }
              >
                Receive a More Accurate Indication
              </Button>)
            }
            
            <div className='w-full max-w-md mx-auto relative'>
            <input
              type='text'
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              autoCapitalize='on'
              className='start-campaign-input w-full  z-10 flex-grow p-2 bg-lightgray rounded-md py-5 pl-3 pr-8 outline-none focus:outline-none resize-none overflow-y-hidden font-lato text-[16px] font-light'
            />
            <button
              onClick={() => {
                handleSend(inputValue)
              }}
              className='absolute right-2 top-1/2 transform -translate-y-1/2 text-black  disabled:cursor-not-allowed transition-colors duration-200'
              disabled={
                indexPage
                  ? intentExtracting
                  : botThinking || isTyping
                  ? true
                  : false
              }
            >
              <IoSend title='Send' className='w-5 h-5' />
            </button>
            {!indexPage && (
              <button
                onClick={handleStartAgain}
                disabled={botThinking || isTyping}
                className='p-2 text-black transition-colors duration-200 rounded-full fixed right-2 top-20 -translate-y-2 bg-white hover:bg-gray-100 shadow-md border border-gray-200 focus:outline-none'
                aria-label='Reset search'
              >
                <LuRotateCcw title='Restart' className='w-6 h-6' />
              </button>
            )}
            {!indexPage && showScrollButton && (
              <button
                onClick={() => {
                  scrollToElement(messagesEndRef)
                }}
                className='p-2 text-black transition-colors duration-200 rounded-full fixed right-2 top-[82%] -translate-y-[82%] bg-white hover:bg-gray-100 shadow-md border border-gray-200 focus:outline-none'
                aria-label='Scroll to bottom'
              >
                <LuChevronDown className='w-6 h-6' />
              </button>
            )}
          </div></>
            
          )
        }
          

          <div
            className='overflow-x-auto whitespace-nowrap box-scrollbar scroll-smooth'
            ref={scrollContainerRef}
          >
            {boxes.map((box, index) => (
              <div
                key={index}
                ref={el => {
                  boxRefs.current[index] = el
                }}
                className={`bg-lightgray rounded-xl flex-shrink-0 inline-flex flex-col items-center hover:bg-mediumgray cursor-pointer mr-4 py-2.5 px-6 ${
                  box.title === title ? 'bg-mediumgray' : ''
                }
                ${botThinking || isTyping ? 'cursor-not-allowed' : ''}
                `}
                onClick={() => {
                  if (!isTyping && !botThinking) {
                    setQuickSearch(false)
                    handleBoxClick(box, index)
                  }
                }}
              >
                <div className='text-start text-xs relative'>
                  <h6>{box.title}</h6>
                  <span className=' text-darkergray'>{box.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBot
