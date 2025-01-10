import React from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'

type PropType = {
  slides?: number[]
  options?: EmblaOptionsType
  children?: React.ReactNode
}

const EmblaCarousel: React.FC<PropType> = props => {
  const { slides, options } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

  return (
    <div className='general'>
      <div className='embla'>
        <div className='embla__viewport' ref={emblaRef}>
          <div className='embla__container'>
            {
              /* {slides.map((index) => (
            <div className="embla__slide" key={index}>
              <div className="embla__slide__number">{index + 1}</div>
            </div>
          ))} */
              props.children
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmblaCarousel
