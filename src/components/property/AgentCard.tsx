import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { IoChevronDown } from 'react-icons/io5'
import {
  LuFacebook,
  LuGlobe,
  LuInstagram,
  LuLinkedin,
  LuMail,
  LuMessageSquare,
  LuPhone,
  LuTwitter
} from 'react-icons/lu'
import AgentCarousel from '../ui/carousel/AgentCarousel'
import OutComeCard from './OutComeCard'
import { OUR_TEAM_DATA } from '@/constants/our-team'
import { LOOKING_TO_RENT } from '@/constants/looking-to-rent'
import useEmblaCarousel from 'embla-carousel-react'
import Button from '../ui/Button'
import BookingOverlay from '../chat/BookApraisal/Overlay'
import OutcomeCarousel from '../ui/carousel/OutComeCarousel'
import { useRouter } from 'next/router'

const AgentCard = ({
  agent,
  index,
  showLinks = true,
  emblaMainRef,
  isOverlayOpen, setIsOverlayOpen,totalAgents,setAgent
}: {
  agent: any
  index: number
  showLinks?: boolean
  emblaMainRef?: any
  isOverlayOpen: boolean
  setIsOverlayOpen: any
  totalAgents: number
  setAgent: any
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  return (
    <>
    <div
      key={index}
      className='bg-white border border-darkgray rounded-md shadow-md pb-4'
    >
<div className="relative w-full">
  <img
    src={agent.picture || '/placeholder.svg'}
    alt={`${agent.firstName} ${agent.lastName}`}
    className="w-full h-full aspect-square object-cover object-top"
  />
  {!showLinks && (
    <div className="absolute top-4 right-4 bg-black text-white backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
      <span className="text-sm">
        {index + 1} of {totalAgents}
      </span>
    </div>
  )}
</div>



      <div className='p-6 space-y-4'>
        <div className='text-center'>
          <h2 className='text-xl font-light tracking-wider uppercase'>
            {agent.firstName} {agent.lastName}
          </h2>
          {agent.title && (
            <p className='text-sm text-gray-600 mt-1'>{agent.title}</p>
          )}
        </div>

        {agent.profileText && (
          <p className='text-sm text-gray-600 line-clamp-3'>
            {agent.profileText}
          </p>
        )}

        <div className='space-y-2'>
        {agent.phone && (
  <div className="space-y-1">
    <div className="flex items-center gap-2 text-sm">
      <LuPhone className="w-4 h-4" />
      <a
        href={`tel:${agent.phone.replace(/^\+92/, '+64')}`}
        className="hover:underline"
      >
        {agent.phone.replace(/^\+92/, '+64')}
      </a>
    </div>
    <Link
      href={`https://wa.me/${agent.phone.replace(/^\+92/, '+64').replace(/\s+/g, '')}`}
      className="text-xs text-gray-600 hover:underline ml-6"
    >
      Message on WhatsApp
    </Link>
  </div>
)}


          {agent.email && (
            <div className='flex items-center gap-2 text-sm'>
              <LuMail className='w-4 h-4' />
              <a href={`mailto:${agent.email}`} className='hover:underline'>
                {agent.email}
              </a>
            </div>
          )}
        </div>
        <>
          <div className='flex items-center justify-start gap-4 pt-2'>
              {agent.facebookUrl && (
                <Link
                  href={agent.facebookUrl}
                  className='text-gray-600 hover:text-black'
                >
                  <LuFacebook className='w-5 h-5' />
                </Link>
              )}
              {agent.instagramUrl && (
                    <Link href={agent.instagramUrl} className="text-gray-600 hover:text-black">
                      <LuInstagram className="w-5 h-5" />
                    </Link>
                  )}
                   {/* <button 
                    onClick={() => window.location.href = `sms:${agent.phone}`}
                    className="text-gray-600 hover:text-black"
                  >
                    <LuMessageSquare className="w-5 h-5" />
                  </button> */}
              {/* {agent.twitterUrl && (
                <Link
                  href={agent.twitterUrl}
                  className='text-gray-600 hover:text-black'
                >
                  <LuTwitter className='w-5 h-5' />
                </Link>
              )}
              {agent.linkedInUrl && (
                <Link
                  href={agent.linkedInUrl}
                  className='text-gray-600 hover:text-black'
                >
                  <LuLinkedin className='w-5 h-5' />
                </Link>
              )} */}
              {agent.personalWebsiteUrl && (
                <Link
                  href={agent.personalWebsiteUrl}
                  className='text-gray-600 hover:text-black'
                >
                  <LuGlobe className='w-5 h-5' />
                </Link>
              )}
            </div>

            {/* <div className='flex justify-center gap-4 text-xs'>
              {agent.saleActive && (
                <span className='px-3 py-1 bg-black text-white uppercase'>
                  Sales
                </span>
              )}
              {agent.rentalActive && (
                <span className='px-3 py-1 bg-black text-white uppercase'>
                  Rentals
                </span>
              )}
            </div> */}
            {/* <div className='flex items-center justify-between px-4 py-2 border-t border-b cursor-pointer' onClick={() => setIsOpen(!isOpen)}>
              
              <p className='text-sm text-gray-700 uppercase tracking-wider font-abchanel'>
                Recent Maximum Outcomes
              </p>
              <IoChevronDown
                
                className={`w-4 h-4 text-gray-700 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div> */}
          </>
      </div>
      {isOpen && (
        <div>
          <OutcomeCarousel outcomes={LOOKING_TO_RENT}/>
        </div>
      )}
      {/* Reserve button */}
      <Button
        onClick={() => {
          setIsOverlayOpen(true)
          setAgent(agent)
        }}
        className='gray-button flex w-full max-w-[22rem] md:max-w-[30rem] mx-auto justify-center items-center font-abchanel'
        aria-label='Reset search'
      >
        RESERVE APPOINTMENT
      </Button>
    </div></>
    
  )
}

export default AgentCard
