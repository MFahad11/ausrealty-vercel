import { useState, useEffect } from 'react'

interface AusrealtyModalProps {
  isOpen: boolean
  onClose: () => void
  text:string
}

export default function AusrealtyModal({ isOpen, onClose,text }: AusrealtyModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible) return null

  return (
    <div 
      className={`z-[10000] fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-[31px] w-[361px]  p-[62px_48px_48px_48px] flex flex-col items-start gap-4 transition-transform duration-300  ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <p>
            {text}
        </p>
       
      </div>
    </div>
  )
}

