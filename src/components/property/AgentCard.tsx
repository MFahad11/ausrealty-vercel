import Link from 'next/link'
import React, { useEffect, useRef } from 'react'
import { IoChevronDown } from 'react-icons/io5'
import {
  LuFacebook,
  LuGlobe,
  LuLinkedin,
  LuMail,
  LuPhone,
  LuTwitter
} from 'react-icons/lu'
import EmblaCarousel from '../ui/carousel/AgentCarousel'
import OutComeCard from './OutComeCard'
import { OUR_TEAM_DATA } from '@/constants/our-team'
import { LOOKING_TO_RENT } from '@/constants/looking-to-rent'
import useEmblaCarousel from 'embla-carousel-react'

const AgentCard = ({
  agent,
  index,
  showLinks = true,
  emblaMainRef
}: {
  agent: any
  index: number
  showLinks?: boolean
  emblaMainRef?: any
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [emblaRef] = useEmblaCarousel({ dragFree: true });

  return (
    <div
      key={index}
      className='bg-white border border-darkgray rounded-md shadow-md'
    >
      <div className='relative aspect-[3/4] w-full'>
        <img
          src={agent.photo || '/placeholder.svg'}
          alt={`${agent.firstName} ${agent.lastName}`}
          //   fill
          className='object-cover'
        />
        {!showLinks && (
          <div className='absolute top-4 right-4 bg-black text-white backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1'>
            <span className='text-sm'>
              {index + 1} of {LOOKING_TO_RENT.length}
            </span>
          </div>
        )}
      </div>

      <div className='p-6 space-y-4'>
        <div className='text-center'>
          <h2 className='text-xl font-light tracking-wider uppercase'>
            {agent.firstName} {agent.lastName}
          </h2>
          {agent.jobPosition && (
            <p className='text-sm text-gray-600 mt-1'>{agent.jobPosition}</p>
          )}
        </div>

        {agent.profileText && (
          <p className='text-sm text-gray-600 line-clamp-3'>
            {agent.profileText}
          </p>
        )}

        <div className='space-y-2'>
          {agent.phone && (
            <div className='flex items-center gap-2 text-sm'>
              <LuPhone className='w-4 h-4' />
              <a href={`tel:${agent.phone}`} className='hover:underline'>
                {agent.phone}
              </a>
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
        {showLinks ? (
          <>
            <div className='flex items-center justify-center gap-4 pt-4 border-t'>
              {agent.facebookUrl && (
                <Link
                  href={agent.facebookUrl}
                  className='text-gray-600 hover:text-black'
                >
                  <LuFacebook className='w-5 h-5' />
                </Link>
              )}
              {agent.twitterUrl && (
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
              )}
              {agent.personalWebsiteUrl && (
                <Link
                  href={agent.personalWebsiteUrl}
                  className='text-gray-600 hover:text-black'
                >
                  <LuGlobe className='w-5 h-5' />
                </Link>
              )}
            </div>

            <div className='flex justify-center gap-4 text-xs'>
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
            </div>
          </>
        ) : (
          <>
            <div className='flex items-center justify-between px-4 py-2 border-t border-b'>
              <p className='text-sm text-gray-700 uppercase tracking-wider font-abchanel'>
                Recent Maximum Outcomes
              </p>
              <IoChevronDown
                onClick={() => setIsOpen(!isOpen)}
                className={`w-4 h-4 text-gray-700 transition-transform duration-200 cursor-pointer${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </>
        )}
        
      </div>
      {isOpen && (
          <div>
            <EmblaCarousel agents={[]}
            childEmblaRef={emblaRef}
           
            >
              {LOOKING_TO_RENT.map((agent, index) => (
                <div className='embla__slide' key={index}>
                  <div className='embla__slide__number'>
                    <OutComeCard
                      index={index + 1}
                      total={LOOKING_TO_RENT.length}
                    />
                  </div>
                </div>
              ))}
            </EmblaCarousel>
          </div>
        )}
    </div>
  )
}

export default AgentCard
