import { useState } from 'react'
import BookAppraisal from './index'
import { RxCross2 } from "react-icons/rx";

interface BookingOverlayProps {
  isOpen: boolean
  onClose: () => void
  agent: any
  address?: string
  availableAgents?: any
}

export default function BookingOverlay({ isOpen, onClose,agent,address,availableAgents }: BookingOverlayProps) {

  if (!isOpen) return null
  // if available agents are not provided, show the first step otherwise show the zeroth step
  const [step, setStep] = useState(availableAgents?.length>=1?0:1)
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
  <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-[95vw] md:max-w-md mx-auto relative">
    {
      (step===1|| step===0) && ( <button 
      onClick={onClose}
      className="absolute right-4 top-4 p-2"
      aria-label="Close dialog"
    >
      <RxCross2 className="w-5 h-5" />
    </button>)
    }
   
    {/* @ts-ignore */}
    <BookAppraisal 
    setStep={setStep}
    step={step}
    onClose={onClose}
    agent={agent}
    address={address}
    availableAgents={availableAgents}
    />
  </div>
</div>

  )
}

