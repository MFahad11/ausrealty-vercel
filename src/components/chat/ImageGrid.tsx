import Image from 'next/image'
import { LuCopy, LuVideo } from 'react-icons/lu'

type MediaItem = {
  type: 'image' | 'video' | 'multiple'
  src: string | string[]
}

export default function ImageGrid() {
  const mediaItems: MediaItem[] = [
    { type: 'image', src: 'https://res.cloudinary.com/dthqgnlbt/image/upload/v1733331535/DJI_20240913174112_0573_D-Edit_tidt8y.jpg' },
    { type: 'video', src: 'https://ausrealty-next.s3.ap-southeast-2.amazonaws.com/STARTS+WITH+BELIEF+(5).mp4' },
    { type: 'multiple', src: [
      'https://res.cloudinary.com/dthqgnlbt/image/upload/v1733331535/Drone_-_front_facade_-_print_1_leserc.jpg',
      '/placeholder.svg?height=600&width=600',
      '/placeholder.svg?height=600&width=600',
      '/placeholder.svg?height=600&width=600'
    ]},
    { type: 'image', src: '/placeholder.svg?height=600&width=600' },
    { type: 'video', src: 'https://ausrealty-next.s3.ap-southeast-2.amazonaws.com/STARTS+WITH+BELIEF+(5).mp4' },
    { type: 'image', src: 'https://res.cloudinary.com/dthqgnlbt/image/upload/v1733331535/DJI_20240913174112_0573_D-Edit_tidt8y.jpg' },
    { type: 'multiple', src: [
      '/placeholder.svg?height=600&width=600',
      'https://res.cloudinary.com/dthqgnlbt/image/upload/v1733331535/Drone_-_front_facade_-_print_1_leserc.jpg'
    ]},
    { type: 'image', src: '/placeholder.svg?height=600&width=600' },
    { type: 'video', src: 'https://ausrealty-next.s3.ap-southeast-2.amazonaws.com/STARTS+WITH+BELIEF+(5).mp4' },
    { type: 'image', src: '/placeholder.svg?height=600&width=600' },
    { type: 'multiple', src: [
      'https://res.cloudinary.com/dthqgnlbt/image/upload/v1733331535/DJI_20240913174112_0573_D-Edit_tidt8y.jpg',
      '/placeholder.svg?height=600&width=600',
      '/placeholder.svg?height=600&width=600'
    ]},
    { type: 'image', src: '/placeholder.svg?height=600&width=600' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-3 gap-1">
        {mediaItems.map((item, index) => (
          <div key={index} className="relative aspect-square overflow-hidden">
            {item.type === 'multiple' ? (
              <div className="grid grid-cols-2 gap-1 h-full w-full">
                {(item.src as string[]).slice(0, 4).map((src, i) => (
                  <Image
                    key={i}
                    src={src}
                    alt={`Grid item ${index + 1} - ${i + 1}`}
                    fill={i === 0}
                    layout={i === 0 ? 'fill' : 'responsive'}
                    width={i === 0 ? undefined : 300}
                    height={i === 0 ? undefined : 300}
                    className={`object-cover ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
                    sizes="(max-width: 768px) 33vw, (max-width: 1200px) 33vw, 33vw"
                  />
                ))}
              </div>
            ) : (
              <Image
                src={item.src as string}
                alt={`Grid item ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 33vw, 33vw"
              />
            )}
            
            {item.type === 'video' && (
              <div className="absolute top-2 left-2">
                <LuVideo className="w-4 h-4 text-white drop-shadow-lg" />
              </div>
            )}
            {item.type === 'multiple' && (
              <div className="absolute top-2 left-2">
                <LuCopy className="w-4 h-4 text-white drop-shadow-lg" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
