import { useState, useEffect } from 'react'
import Image from 'next/image'
import { LuChevronLeft, LuChevronRight, LuHeart, LuMessageCircle, LuX } from 'react-icons/lu'
type MediaItem = {
  caption: string
  children: { 
    data: {
    id: string
    media_url: string
    media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
    }[] 
}
comments_count: number
id: string
like_count: number
media_type:"CAROUSEL_ALBUM" | "IMAGE" | "VIDEO"
media_url: string
}
type MediaViewerProps = {
  isOpen: boolean
  onClose: () => void
  media: MediaItem | null
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
      (media?.media_type === 'CAROUSEL_ALBUM' && Array.isArray(media?.children?.data) && prev < media?.children?.data?.length - 1) ? prev + 1 : prev
    )
  }

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[10000] flex flex-col items-center justify-center">
      <div className="w-full max-w-screen-lg px-4 py-2 flex justify-between items-center">
        <div className="text-white text-sm">
          {media?.media_type === 'CAROUSEL_ALBUM' && Array.isArray(media.children?.data) && 
            `${currentIndex + 1} / ${media.children?.data.length}`
          }
        </div>
        <button
          onClick={()=>{
            setCurrentIndex(0)
            onClose()
          }}
          className="text-white hover:text-gray-300"
          aria-label="Close"
        >
          <LuX className="w-6 h-6" />
        </button>
      </div>
      <div className="relative w-full h-[calc(100vh-15rem)] flex items-center justify-center">
        {media?.media_type === 'CAROUSEL_ALBUM' && Array.isArray(media.children?.data) ? (
          <img
            src={media.children?.data[currentIndex]?.media_url}
            alt={`Viewed image ${currentIndex + 1}`}
            // layout="fill"
            className="object-contain"
            loading='eager'
          />
        ) : media?.media_type === 'VIDEO' ? (
          <video
            src={media.media_url as string}
            className="max-w-full max-h-full"
            controls
            autoPlay
          />
        ) : (
          <img
            src={media?.media_url as string}
            alt="Viewed image"
            // layout="fill"
            className="object-contain"
            loading='eager'
          />
        )}
        {media?.media_type === 'CAROUSEL_ALBUM' && Array.isArray(media.children?.data) && (
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
              disabled={currentIndex === media.children?.data.length - 1}
              aria-label="Next image"
            >
              <LuChevronRight className="w-8 h-8" />
            </button>
          </>
        )}
      </div>
      <div className="w-full max-w-screen-lg px-4 py-4 text-white">
        <div className="flex items-center space-x-4 mb-2">
          <div className="flex items-center">
            <LuHeart className="w-6 h-6 mr-1" />
            <span>{media?.like_count || 0}</span>
          </div>
          <div className="flex items-center">
            <LuMessageCircle className="w-6 h-6 mr-1" />
            <span>{media?.comments_count || 0}</span>
          </div>
        </div>
        {media?.caption && (
          
          <p className="text-sm">{
            media?.caption
          }</p>
        )}
      </div>
    </div>
  )
}
