import Image from 'next/image'
import { useState } from 'react'
import { LuCopy, LuVideo } from 'react-icons/lu'
import { MediaViewer } from './MediaViewer'
import { cn } from '@/utils/helpers'
type InstaItem = {
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
type MediaItem = {
  name: string,
  role: string,
  contact: string,
  email:  string,
  specialisedServiceAreas:string [],
  image: string
}

export default function InstaGrid(
  {data,className = 'grid-cols-3'}: {data: {
    media:{
      data: InstaItem[],
      page:{
        cursors: {
            before: string,
            after: string
        },
        next: string
    }
    },
    id: string
  },
  className?: string
}
) {
  const [selectedMedia, setSelectedMedia] = useState<InstaItem | null>(null)
  return (
    <><div className="max-w-4xl lg:h-[555px] h-[474px]  mx-auto px-4 py-4 enhanced-textarea overflow-y-auto">
      <div className={cn(
          'grid gap-1',
          className
        )}>
        {data?.media?.data?.map((item, index) => (
          item?.media_url &&
          <div key={index} className="relative aspect-square overflow-hidden"
          onClick={() => setSelectedMedia(item)}
          >
            {item.media_type === 'CAROUSEL_ALBUM' ? (
              <div className="grid grid-cols-2 gap-1 h-full w-full">
                {(item?.children?.data).slice(0, 4).map((src, i) => (
                  src?.media_type === 'VIDEO' ? (<video
                    src={src?.media_url}
                    className="object-cover w-full h-full"
                    loop
                    muted
                    playsInline
                    autoPlay
                  />):(<img
                    key={i}
                    src={src?.media_url}
                    alt={`Grid item ${index + 1} - ${i + 1}`}
                    // fill={i === 0}
                    // layout={i === 0 ? 'fill' : 'responsive'}
                    width={i === 0 ? undefined : 300}
                    height={i === 0 ? undefined : 300}
                    className={`object-cover ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
                    sizes="(max-width: 768px) 33vw, (max-width: 1200px) 33vw, 33vw"
                    
                    loading='lazy'
                  />)

                ))}
              </div>
            ) : (
              item?.media_type === 'VIDEO' ? (
                <video
                  src={item?.media_url as string}
                  className="object-cover w-full h-full"
                  loop
                  muted
                  playsInline
                  autoPlay
                />
              ) : (
                <img
                  src={item?.media_url as string}
                  alt={`Grid item ${index + 1}`}
                  // fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, (max-width: 1200px) 33vw, 33vw"
                  loading='lazy'
                  
                />
              )
            )}
            
            {item?.media_type === 'VIDEO' && (
              <div className="absolute top-2 left-2">
                <LuVideo className="w-4 h-4 text-white drop-shadow-lg" />
              </div>
            )}
            {item?.media_type === 'CAROUSEL_ALBUM' && (
              <div className="absolute top-2 left-2">
                <LuCopy className="w-4 h-4 text-white drop-shadow-lg" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    <MediaViewer
        isOpen={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        media={selectedMedia}
      />
      </>
    
  )
}
