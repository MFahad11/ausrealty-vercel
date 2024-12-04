import NavBar from "@/components/layout/Navba"
import Modal from "@/components/ui/Modal"
import { TabGroup } from "@/components/ui/TabGroup"
import Image from "next/image"
import { useState } from "react"

export default function ImageGallery() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState("")
  return (
    <>
    <NavBar
    backgroundColor="black"
    showBackButton={true}
    />
    {/* 
    @ts-ignore */}
  
    <Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    className="max-w-[800px]"
    >
    <div className="relative aspect-[16/9]">
      <Image
        src={selectedImage}
        alt="Property image"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>

      </Modal>
      <div
      className="max-w-4xl mx-auto"
      ><div
    className="mt-4 mb-6 ml-4"
    >
    <TabGroup
    tabs={[
      {
        id: "images",
        label: "Images",
        route:'/images'
      },
      {
        id: "floorplan",
        label: "Floorplan",
        route:'/floorplan'
      },
      {
        id: "video",
        label: "Video",
        route:'/video'
      },
    ]}
    />
    </div>
    <div className="container mx-auto px-1 pb-8 mt-0 pt-0">
      <div className="grid grid-cols-2 gap-2">
        {/* Top full-width image */}
        <div className="col-span-2">
          <div className="relative aspect-[16/9]"
          onClick={() => {
            setSelectedImage("https://res.cloudinary.com/dthqgnlbt/image/upload/v1733331535/DJI_20240913174112_0573_D-Edit_tidt8y.jpg")
            setIsOpen(true)
          }}
          >
            <Image
              src="https://res.cloudinary.com/dthqgnlbt/image/upload/v1733331535/DJI_20240913174112_0573_D-Edit_tidt8y.jpg"
              alt="Coastal property exterior"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>
        
        {/* Middle row - two equal columns */}
        <div className="relative aspect-square"
        onClick={() => {
          setSelectedImage("https://res.cloudinary.com/dthqgnlbt/image/upload/v1733331535/Drone_-_front_facade_-_print_1_leserc.jpg")
          setIsOpen(true)
        }}
        >
          <Image
            src="https://res.cloudinary.com/dthqgnlbt/image/upload/v1733331535/Drone_-_front_facade_-_print_1_leserc.jpg"
            alt="Property view"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="relative aspect-square"
      onClick={() => {
        setSelectedImage("https://res.cloudinary.com/dthqgnlbt/image/upload/v1733331535/Still_11_vanpe2.jpg")
        setIsOpen(true)
      }}
        >
          <Image
            src="https://res.cloudinary.com/dthqgnlbt/image/upload/v1733331535/Still_11_vanpe2.jpg"
            alt="Interior detail"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        {/* Bottom row - two equal columns */}
        
        <div className="col-span-2">
          <div className="relative aspect-[16/9]"
          onClick={() => {
            setSelectedImage("https://res.cloudinary.com/dthqgnlbt/image/upload/v1733331537/Still_16_dqnyod.jpg")
            setIsOpen(true)
          }}
          >
            <Image
              src="https://res.cloudinary.com/dthqgnlbt/image/upload/v1733331537/Still_16_dqnyod.jpg"
              alt="Coastal property exterior"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>
        
      </div>
    </div></div>
    </>
    
  )
}

