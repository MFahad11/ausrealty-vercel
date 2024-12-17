import Link from 'next/link'
import { useState, useEffect } from 'react'
import { GrContact } from 'react-icons/gr'

export default function StickyContact() {
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
  
    useEffect(() => {
      const controlNavbar = () => {
        if (typeof window !== 'undefined') {
          if (window.scrollY > lastScrollY) {
            setIsVisible(false)
          } else {
            setIsVisible(true)
          }
          setLastScrollY(window.scrollY)
        }
      }
  
      if (typeof window !== 'undefined') {
        window.addEventListener('scroll', controlNavbar)
  
        return () => {
          window.removeEventListener('scroll', controlNavbar)
        }
      }
    }, [lastScrollY])
  
    return (
      <div
        className={`fixed top-52 right-0 z-50 transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-[200%]'
        }`}
      >
        <Link
          href="#"
          className="flex items-center justify-center w-12 h-12 text-white bg-black rounded-sm hover:bg-gray-800 transition-colors shadow-md"
          aria-label="Contact Us"
        >
          <GrContact className="w-6 h-6" title='Contact Us'/>
        </Link>
      </div>
    )
}

