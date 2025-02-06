import Link from 'next/link'
import { useState, useEffect } from 'react'
import { LuMail, LuMapPin, LuPhone, LuX } from 'react-icons/lu'

interface PeopleModalProps {
  isOpen: boolean
  onClose: () => void
  data:{
    name: string,
    role: string,
    contact: string,
    email:  string,
    specialisedServiceAreas:string [],
    image: string,
    company: string
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
    className={`z-[10000] fixed inset-0 bg-black/60 flex items-center justify-center transition-all duration-300 ${
      isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
    }`}
    onClick={onClose}
  >
    <div
      className={`bg-white rounded-[32px] w-[360px] p-6 transition-all duration-300 ${
        isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      
      {/* Contact Information */}
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-wide">{data.name}</h2>

        <div className="space-y-2">
          <p className="font-medium">{data.role}</p>
          {
            data && data?.company && (<div className="flex items-center gap-2 text-sm">
    <p>{data?.company}</p>
  </div>)
          }
          {
            data && data?.contact && (<div className="space-y-1">
    <div className="flex items-center justify-center gap-2 text-sm">
      <LuPhone className="w-4 h-4" />
      <a
        href={`tel:${data?.contact?.replace(/^\+92/, '+64')}`}
        className="hover:underline"
      >
        {data?.contact?.replace(/^\+92/, '+64')}
      </a>
    </div>
    <Link
      href={`https://wa.me/${data?.contact?.replace(/^0/, '61').replace(/\s+/g, '')}`}
      className="text-xs text-gray-600 hover:underline ml-6"
    >
      Message on WhatsApp
    </Link>
  </div>)
          }
          
          <a href={`mailto:${data.email}`} className="block text-sm hover:text-black transition-colors break-words">
            {data.email}
          </a>
          
        </div>

        {data?.specialisedServiceAreas?.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Specialised service areas:</p>
            <div className="space-y-1">
              {data.specialisedServiceAreas.map((area, index) => (
                <p key={index} className="text-sm font-medium">
                  {area}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  )
}

