import { useState, useEffect } from 'react'
import Image from 'next/image'
import { LuChevronLeft, LuChevronRight, LuX } from 'react-icons/lu'

type MediaViewerProps = {
  isOpen: boolean
  onClose: () => void
  media: { type: 'image' | 'video' | 'multiple'; src: string | string[] }
}

export function MediaViewer({ isOpen, onClose, media }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrevious()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => 
      (media.type === 'multiple' && Array.isArray(media.src) && prev < media.src.length - 1) ? prev + 1 : prev
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[10000] flex flex-col items-center justify-center">
      <div className="w-full max-w-screen-lg px-4 py-2 flex justify-between items-center">
        <div className="text-white text-sm">
          {media.type === 'multiple' && Array.isArray(media.src) && 
            `${currentIndex + 1} / ${media.src.length}`
          }
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300"
          aria-label="Close"
        >
          <LuX className="w-6 h-6" />
        </button>
      </div>
      <div className="relative w-full h-[calc(100vh-4rem)] flex items-center justify-center">
        {media.type === 'multiple' && Array.isArray(media.src) ? (
          <Image
            src={media.src[currentIndex]}
            alt={`Viewed image ${currentIndex + 1}`}
            layout="fill"
            objectFit="contain"
          />
        ) : media.type === 'video' ? (
          <video
            src={media.src as string}
            className="max-w-full max-h-full"
            controls
            autoPlay
          />
        ) : (
          <Image
            src={media.src as string}
            alt="Viewed image"
            layout="fill"
            objectFit="contain"
          />
        )}
        {media.type === 'multiple' && Array.isArray(media.src) && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 text-white hover:text-gray-300 disabled:opacity-50"
              disabled={currentIndex === 0}
              aria-label="Previous image"
            >
              <LuChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 text-white hover:text-gray-300 disabled:opacity-50"
              disabled={currentIndex === media.src.length - 1}
              aria-label="Next image"
            >
              <LuChevronRight className="w-8 h-8" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
