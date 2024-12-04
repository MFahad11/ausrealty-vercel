import Image from "next/image"

export default function GalleryPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main large image */}
        <div className="col-span-full">
          <div className="relative h-[400px] md:h-[600px] w-full">
            <Image
              src="/main-property.jpg"
              alt="Coastal property exterior with pool"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </div>
        
        {/* Bottom grid of smaller images */}
        <div className="relative h-[300px] md:h-[400px] w-full">
          <Image
            src="/property-angle.jpg"
            alt="Property from different angle"
            fill
            className="object-cover rounded-lg"
          />
        </div>
        
        <div className="relative h-[300px] md:h-[400px] w-full">
          <Image
            src="/indoor-pool.jpg"
            alt="Indoor pool with arched details"
            fill
            className="object-cover rounded-lg"
          />
        </div>
        
        <div className="relative h-[300px] md:h-[400px] w-full">
          <Image
            src="/coastal-view.jpg"
            alt="View of the harbor with boats"
            fill
            className="object-cover rounded-lg"
          />
        </div>
        
      </div>
    </main>
  )
}

