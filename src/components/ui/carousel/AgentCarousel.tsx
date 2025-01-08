import React, { useState } from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import AgentCard from '@/components/property/AgentCard'
type PropType = {
  agents: any[]
    children?: React.ReactNode
  options?: EmblaOptionsType
}

const EmblaCarousel: React.FC<PropType> = (props) => {
    const { options } = props
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(options)
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true
  })

  return (
    <div className='agent'><div className="embla">
      <div className="embla__viewport"  ref={emblaMainRef}>
        <div className="embla__container">
            {
                props?.children ? props.children : (
                    props?.agents.map((agent,index) => (
                        <div className="embla__slide" key={index}>
                          <div className="embla__slide__number">
                            
                            <AgentCard agent={agent} 
                                        index={index}
                                        showLinks={false}
                                      
                                      />
                                      </div>
                        </div>
                      ))
                )
            }
          
        </div>
      </div>
    </div></div>
    
  )
}

export default EmblaCarousel
