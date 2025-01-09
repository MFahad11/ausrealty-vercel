import React, { useState, useEffect, useCallback } from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
type media={
    category: string;
    url: string;
    type: string;
}
type PropType = {
  slides: media[]
  options?: EmblaOptionsType

}

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(options)
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true
  })

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return
      emblaMainApi.scrollTo(index)
    },
    [emblaMainApi, emblaThumbsApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return
    setSelectedIndex(emblaMainApi.selectedScrollSnap())
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap())
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex])

  useEffect(() => {
    if (!emblaMainApi) return
    onSelect()

    emblaMainApi.on('select', onSelect).on('reInit', onSelect)
  }, [emblaMainApi, onSelect])

  return (
    <div
    className='property'
    ><div className="embla">
      <div className="embla__viewport" ref={emblaMainRef}>
        <div className="embla__container">
          {slides.map((item,index) => (
            
            <div className="embla__slide" key={index}>
              {/* <div className="">{index + 1}</div> */}
              <div className="relative md:w-full md:h-64 aspect-16x9 overflow-hidden mb-1 embla__slide__number">
                {item?.category ===
                "image" ? (
                  <img
                    src={item?.url}
                    alt={item?.category}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={item?.url}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
                <div className="absolute top-4 right-4 bg-black text-white backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
          
          <span className="text-sm">
            {
              index + 1
            } of {
              slides.length
            }
          </span>
        </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div></div>
    
  )
}

export default EmblaCarousel
