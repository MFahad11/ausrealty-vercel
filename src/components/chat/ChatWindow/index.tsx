import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react'
import { LuChevronDown } from 'react-icons/lu';
import { RxCross2 } from "react-icons/rx";

interface Message {
  role: 'system' | 'user';
  content: string;
  link?: string;
}

export default function ChatWindow({messages,isOpen, setIsOpen,botThinking, setBotThinking,isTyping,link}:{
    messages:Message[]
    isOpen:boolean
    setIsOpen:React.Dispatch<React.SetStateAction<boolean>>
    botThinking:boolean
    setBotThinking:React.Dispatch<React.SetStateAction<boolean>>
    isTyping:boolean
    link?:string
    
}) {
  
  const chatRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const botResponseRef = useRef<HTMLDivElement>(null)
    const [showScrollButton, setShowScrollButton] = useState(false)
  
const router=useRouter();
  useEffect(() => {
    if (isOpen && chatRef.current) {
      chatRef.current.style.display = 'flex'
      setTimeout(() => {
        if (chatRef.current) {
          chatRef.current.style.transform = 'translateY(0)'
          chatRef.current.style.opacity = '1'
        }
      }, 50)
    } else if (!isOpen && chatRef.current) {
      chatRef.current.style.transform = 'translateY(100%)'
      chatRef.current.style.opacity = '0'
      setTimeout(() => {
        if (chatRef.current) {
          chatRef.current.style.display = 'none'
        }
      }, 300)
    }
  }, [isOpen])
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

  return (
    <div className="fixed bottom-[8.7rem] md:bottom-[10rem] left-1/2 max-w-4xl w-full -translate-x-1/2 z-50">
      <div 
        ref={chatRef}
        
        className="bg-white w-full h-[500px] rounded-md  border border-gray-200 flex-col overflow-hidden transition-all duration-300 ease-out opacity-0 translate-y-full"
        style={{ display: 'none' }}

      >
        <div className='max-w-4xl w-full mx-auto flex flex-col flex-grow pb-6 overflow-y-auto mt-10'>
        <div
                id='msg'
                ref={messagesContainerRef}
                className='enhanced-textarea overflow-y-auto pl-0 '
              >
                {(messages && messages?.length>=1) && messages.map((message, index) => (
                  
                  <>
                    <div
                      key={index}
                      className={`mb-2 ${
                        message.role === 'system' ? 'text-left' : 'text-right'
                      }`}
                    >
                      
                      <span
                        className={`inline-block rounded-lg max-w-[80%] p-3 ${
                          message.role === 'system'
                            ? 'bg-white rounded-br-none ml-2'
                            : 'text-start bg-gray-200 rounded-bl-none mr-2'
                        }
               
                
                `}
                        ref={
                          message.role === 'system' &&
                          index === messages.length - 1
                            ? botResponseRef
                            : null
                        }
                      >
                        <p className='text-[16px] font-light p-0 m-0'>
                          {message.content}
                        </p>
                      </span>

                      

                    </div>
                    {
                        (message?.link && router.pathname?.includes('/rent')
                        ) && (
                          <a
                          href=''
                        className={`inline-block rounded-lg max-w-[80%] p-3 ${
                          message.role === 'system'
                            ? 'bg-white rounded-br-none ml-2'
                            : 'text-start bg-gray-200 rounded-bl-none mr-2'
                        }
               
                
                `}
                // @ts-ignore
                        ref={
                          message.role === 'system' &&
                          index === messages.length - 1
                            ? botResponseRef
                            : null
                        }
                      >
                        <a className='text-[16px] font-light p-0 m-0'
                        target='_blank'
                        href={link}
                        >
                          Apply
                        </a>
                      </a>
                        )
                      }
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
                
                
                
                <div ref={messagesEndRef} />
              </div>
      </div>

        {(showScrollButton && messages?.length>=4) && (
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

        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-8 right-4  border-b border-lightgray"
          disabled={botThinking || isTyping}
        >
          <RxCross2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

