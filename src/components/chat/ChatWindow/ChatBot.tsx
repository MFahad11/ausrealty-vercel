import Button from '@/components/ui/Button'
import { handlePropertyDetailChat } from '@/utils/openai'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState, useRef, FormEvent } from 'react'
import { IoSend } from 'react-icons/io5'
import { LuShare2 } from 'react-icons/lu'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
const ChatBot = ({
  title,
  firstMessage,
  prompt,
  placeholder,
  route,
  index,
  boxes,
  handleBoxClick,
  indexPage,
  scrollContainerRef,
  boxRefs,
  defaultSettings,
  messages, setMessages,botThinking, setBotThinking,isTyping, setIsTyping,open, setOpen,property,handleShare,address
}: {
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
  defaultSettings: boolean
  messages: {
    role: string
    content: string
  }[]
  setMessages: any
  botThinking: boolean
  setBotThinking: any
  isTyping: boolean
  setIsTyping: any
  open: boolean
  setOpen: any
  property:any
  handleShare: any
  address?:string
}) => {
  const [intentExtracting, setIntentExtracting] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
   const router=useRouter()
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(prompt, JSON.stringify(messages))
     
    }
  }, [messages])

  useEffect(() => {
    resizeTextarea()
  }, [inputValue])



  const initializeChat = async () => {

    if (firstMessage) {
      setMessages([
        {
          role: 'system',
          content: firstMessage
        }
        
      ])
      
    }
  }

  const handleSend = async (inputValue: string) => {
    if (!inputValue.trim()) {
      // toast.error("Please type something");
      return
    }
    const userMessage = { role: 'user', content: inputValue }
    if(messages.length==0){
      setMessages([{
        role:'system',
        content:firstMessage
      },
      userMessage
    ])
    }else{
      setMessages([...messages, userMessage])
    }
    
      // scrollToElement(messagesEndRef);
    setInputValue('')

    try {
      setOpen(true)

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
    const botMessage= await handlePropertyDetailChat(userInput,messages,{
      ...property,
      inspectionDetails: {
      ...property.inspectionDetails,
      inspections: property.inspectionDetails.inspections.map((inspection: any) => ({
        ...inspection,
        openingDateTime: dayjs(inspection.openingDateTime)
          .tz('Australia/Sydney')
          .format('YYYY-MM-DDTHH:mm:ss'),
        closingDateTime: dayjs(inspection.closingDateTime)
          .tz('Australia/Sydney')
          .format('YYYY-MM-DDTHH:mm:ss')
      })),
      pastInspections: property.inspectionDetails.pastInspections.map((inspection: any) => ({
        ...inspection,
        openingDateTime: dayjs(inspection.openingDateTime)
          .tz('Australia/Sydney')
          .format('YYYY-MM-DDTHH:mm:ss'),
        closingDateTime: dayjs(inspection.closingDateTime)
          .tz('Australia/Sydney')
          .format('YYYY-MM-DDTHH:mm:ss')
      })),
      isByAppointmentOnly: property.inspectionDetails.isByAppointmentOnly
      },
      agentInfo: property?.agentInfo?.map((agent: any) => ({
        email: agent?.email,
        phone: agent?.mobile,
        firstName: agent?.firstName,
        lastName: agent?.lastName,
        suburbsCovered: agent?.suburbs,
      }))
    })
    if(botMessage){
      setMessages((prevMessages:{
        role:string,
        content:string
      }[])=>{
        const updatedMessages = [...prevMessages,{role:'system',content:botMessage?.response,link:botMessage?.link}]
        typewriterEffect(botMessage?.response, updatedMessages.length - 1)
        return updatedMessages
      })
      
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
      setMessages((prevMessages:{
        role:string,
        content:string,
      }[]) => {
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
        setMessages((prevMessages:{
          role:string,
          content:string
        }[]) => {
          const updatedMessages = [...prevMessages]
          updatedMessages[index] = {
            ...updatedMessages[index],          }
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
  <div
        className='flex justify-center items-center gap-4 z-10 w-full fixed left-0 right-0 bottom-[10.8rem]'
        
        >
        <Button
                  // key={tab.id}
                  onClick={handleShare}
                  className="md:hidden bg-black rounded-md text-white px-6 gap-2 py-2 text-sm transition-colors flex justify-center items-center "
                  
                >
                  <LuShare2/>
                  Share
                </Button>
          {
            // the page url contain the word /buy then don't show the apply button
            !router.pathname.includes('/buy') && (
              <Link
              target="_blank"
              href={`https://2apply.com.au/Form?AgentAccountName=ausrealty&Address=${address}`}
                // key={tab.id}
                // onClick={handleShare}
                  className="md:hidden bg-black rounded-md text-white px-6 gap-2 py-2 text-sm transition-colors flex justify-center items-center">
                  Apply
                </Link>)
          }
                
        </div>
      <div
        className={`z-10 w-full fixed left-0 right-0 bg-white px-6 bottom-0 pb-4 pt-2 text-center`}
      >
        <div className='flex flex-col gap-2'>
        
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

            
          </div>
          

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
          {/* Privacy and Term & Condition links */}
          <div className='flex flex-row items-center gap-4 justify-center w-full'>
            <Link
              href='/privacy'
              // target='_blank'
              className='text-xs text-darkergray underline'
            >
              Privacy Policy
            </Link>
            <Link
              href='/terms'
              // target='_blank'
              className='text-xs text-darkergray underline'
            >
              Terms & Conditions
            </Link>
            </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBot
