import { useState, useRef, useEffect } from 'react'
import { RxCross2 } from "react-icons/rx";
import ChatBotHandler from './ChatBotHandler';

interface Message {
  id: number
  text: string
  sender: 'user' | 'agent'
  timestamp: string
}

export default function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! How can I help you today?",
      sender: "agent",
      timestamp: "12:00 PM"
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user' as const,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages([...messages, newMessage])
    setInputValue('')

    // Simulate agent response
    setTimeout(() => {
      const agentResponse = {
        id: messages.length + 2,
        text: "Thank you for your message. An agent will be with you shortly.",
        sender: 'agent' as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, agentResponse])
    }, 1000)
  }

  return (
    <div className="fixed bottom-20 left-1/2 max-w-4xl w-full -translate-x-1/2 z-50">
      <button
        onClick={() => setIsOpen(true)}
        className={`bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors ${
          isOpen ? 'hidden' : 'block'
        }`}
      >
        Chat with us
      </button>
      
      <div 
        ref={chatRef}
        className="bg-white w-full h-[500px] rounded-lg shadow-2xl border border-gray-200 flex-col overflow-hidden transition-all duration-300 ease-out opacity-0 translate-y-full"
        style={{ display: 'none' }}
      >
        {/* Chat Messages */}
        {/* <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <ChatBotHandler/>
        </div> */}

        

        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <RxCross2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

