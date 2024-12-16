import { useState, useEffect } from 'react'

interface PeopleModalProps {
  isOpen: boolean
  onClose: () => void
  data:{
    name: string,
    role: string,
    contact: string,
    email:  string,
    specialisedServiceAreas:string []
  }
}

export default function PeopleModal({ isOpen, onClose,data }: PeopleModalProps) {
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
        className={`bg-white rounded-[31px] w-[361px] h-[323px] p-[36px_48px_37px_48px] flex flex-col items-start gap-4 transition-transform duration-300 ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>
            {data.name}
        </h2>
        <p>
            {data.role}
        </p>
        <p className="font-medium">
            {data.contact}
        </p>
        <p>
            {data.email}
        </p>
        {
            data?.specialisedServiceAreas?.length > 0 && (
                <div className="mt-4">
          <p>Specialised service areas:</p>
          {
            data.specialisedServiceAreas.map((area, index) => (
                <p>
                    {area}
                </p>
            ))
          }
        </div>
            )
        }
      </div>
    </div>
  )
}

