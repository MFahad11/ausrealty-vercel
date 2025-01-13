import Image from 'next/image'
import { useState } from 'react'
import { LuCopy, LuVideo } from 'react-icons/lu'
import { MediaViewer } from './MediaViewer'
import PeopleModal from './PeopleModal'
import AusrealtyModal from './AusrealtyModal'


export default function ImageGrid(
  {data,className = 'grid-cols-3',
    isInsideAusrealty = false,
    isLocation = false
  }: {data: any[],
  className?: string
  isInsideAusrealty?: boolean
  isLocation?: boolean
}
) {
  const [selectedMedia, setSelectedMedia] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
    <div className="max-w-4xl lg:h-[555px] h-[474px] mx-auto px-4 py-8 enhanced-textarea overflow-y-auto">
      <div className={'grid gap-1 grid-cols-2 md:grid-cols-3'}>
        {data?.map((item, index) => (
          <div key={index} className="relative aspect-square overflow-hidden"
          onClick={() => {
            setSelectedMedia(item)
            setIsOpen(true)
          }}
          >
            <img
                  src={item?.image as string}
                  alt={`Grid item ${index + 1}`}
                  // fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, (max-width: 1200px) 33vw, 33vw"
                  loading='lazy'
                  width={300}
                    height={300}
                />
               
               {isInsideAusrealty && (
        <div className="absolute
        w-full h-full flex items-center justify-center top-0
        bottom-0 left-0 right-0  p-2 text-center">
          <h1
           className="text-white 
           ">
            {item?.year}
          </h1>
        </div>
      )}
      {isLocation && (
        <div className="absolute
        w-full h-full flex items-center justify-center top-0
        bottom-0 left-0 right-0  p-2 text-center">
          <h4
           className="text-white 
           ">
            {item?.suburb}
          </h4>
        </div>
      )}
          </div>
          // <h1>{item?.image}</h1>
        ))}
      </div>
    </div>
    {
     (!isInsideAusrealty && !isLocation) && (
    <PeopleModal 
    isOpen={
      isOpen
    }
    onClose={() => {
      setIsOpen(false)
      setSelectedMedia(null)
    }}
    data={
      {
        name: selectedMedia?.name as string,
        role: selectedMedia?.role as string,
        contact: selectedMedia?.contact   as string,
        email: selectedMedia?.email as string,
        specialisedServiceAreas: selectedMedia?.specialisedServiceAreas as string[]
      }
    }
    />)}
    {
      isInsideAusrealty && (<AusrealtyModal
    isOpen={
      isOpen
    }
    onClose={() => {
      setIsOpen(false)
      setSelectedMedia(null)
    }}
    text={selectedMedia?.text as string}
    />)
    }
    {
      isLocation && (<AusrealtyModal
    isOpen={
      isOpen
    }
    onClose={() => {
      setIsOpen(false)
      setSelectedMedia(null)
    }}
    text={selectedMedia?.address as string}
    />)
    }
    
      </>
    
  )
}
