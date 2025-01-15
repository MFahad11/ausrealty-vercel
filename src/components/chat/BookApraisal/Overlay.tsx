import { useState } from 'react'
import BookAppraisal from '.'
import { RxCross2 } from "react-icons/rx";

interface BookingOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export default function BookingOverlay({ isOpen, onClose }: BookingOverlayProps) {

  if (!isOpen) return null


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-[95vw] md:max-w-md mx-auto relative">
    <button 
      onClick={onClose}
      className="absolute right-4 top-4 p-2"
      aria-label="Close dialog"
    >
      <RxCross2 className="w-5 h-5" />
    </button>
    {/* @ts-ignore */}
    <BookAppraisal />
  </div>
</div>

  )
}

