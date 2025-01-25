import React, { useCallback, useState } from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import AgentCard from '@/components/property/AgentCard'
import BookingOverlay from '@/components/chat/BookApraisal/Overlay'
type PropType = {
  agents: any[]
  children?: React.ReactNode
  options?: EmblaOptionsType
  childEmblaRef?: any
  stopPropagation?: (e: React.TouchEvent | React.MouseEvent) => void
  isOverlayOpen: boolean
  setIsOverlayOpen: (isOpen: boolean) => void
  setAgent: any
  agent: any
}

const AgentCarousel: React.FC<PropType> = props => {
  const { options, childEmblaRef } = props
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel()

  return (
    <>
    <BookingOverlay isOpen={props?.isOverlayOpen} onClose={() => props?.setIsOverlayOpen(false)} 
      agent={props?.agent}
      />
       <div className='agent'>
      <div className='embla'>
        <div
          className='embla__viewport'
          ref={childEmblaRef ? childEmblaRef : emblaMainRef}
        >
          <div className='embla__container'>
            {props?.children
              ? props.children
              : props?.agents.map((agent, index) => (
                  <div className='embla__slide' key={index}>
                    <div className='embla__slide__number'>
                      <AgentCard
                        agent={agent}
                        index={index}
                        showLinks={false}
                        isOverlayOpen={props?.isOverlayOpen}
                        setIsOverlayOpen={props?.setIsOverlayOpen}
                        totalAgents={props?.agents.length}
                        setAgent={props?.setAgent}
                      />
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
    </>
   
  )
}

export default AgentCarousel
