import React, { useCallback, useState } from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import BookingOverlay from '@/components/chat/BookApraisal/Overlay'
import { NextButton, PrevButton, usePrevNextButtons } from './ArrowButtons'
import OutComeCard from '@/components/property/OutComeCard'
type PropType = {
  outcomes: any[]
  children?: React.ReactNode
  options?: EmblaOptionsType
  childEmblaRef?: any
  stopPropagation?: (e: React.TouchEvent | React.MouseEvent) => void
}

const OutcomeCarousel: React.FC<PropType> = props => {
  const { outcomes, childEmblaRef } = props
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({
    watchDrag: false,
  })
  
  const {
    onNextButtonClick,
    onPrevButtonClick,
    prevBtnDisabled,
    nextBtnDisabled
  }=usePrevNextButtons(emblaMainApi)
  return (
    <>
       <div className='agent'>
      <div className='embla'>
        <div
          className='embla__viewport'
          ref={childEmblaRef ? childEmblaRef : emblaMainRef}
        >
          <div className='embla__container'>
            {outcomes.map((agent, index) => (
                          <div className='embla__slide' key={index}>
                            <div className='embla__slide__number relative'>
                              <OutComeCard
                                index={index + 1}
                                total={outcomes.length}
                              />
                            </div>
                            <div className="embla__controls w-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="embla__buttons">
                      <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled}
                      />
                      <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled}
                      />
                    </div>
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

export default OutcomeCarousel
