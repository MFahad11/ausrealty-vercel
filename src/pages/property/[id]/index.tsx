import NavBar from '@/components/layout/Navba'
import Image from 'next/image'

export default function PropertyListing() {
  return (
    <>
    <NavBar
    showBackButton={true}
    />
    <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center">
      {/* Hero Image Section */}
      <div className="relative min-w-[437px] min-h-[386px] w-full">
        <Image
          src="/property-image.png"
          alt="Waterfront property exterior"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="py-6 ml-6">
        <div className="mb-2">
          <h3 className="mb-3 tracking-wide font-semibold">
            FOR SALE
          </h3>
          <h4
          className='text-black'
          >
          12 Dodson Avenue, Cronulla, NSW 2230
          </h4>
        </div>

        {/* Property Details */}
        <div className="mb-6 text-sm">
          <h4
          className='text-black'
          >4B 4B 2C | House</h4>
          <p
          className="leading-7"
          >Inspection Sat 30 Nov</p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h4 className=" text-black mb-6 uppercase leading-7">
            LEVEL STREET TO WATER MASTERPIECE, OFFERING BREATH-TAKING VIEWS
          </h4>
          <p className="leading-7">
            "When designing this home, I focused on craftsmanship and durability. The Venetian plaster walls add texture, while the large windows were positioned to flood the interior with natural light and perfectly frame the waterfront views. The pool area was integrated into the design, with the surrounding stonework and glass balustrades enhancing the seamless flow between the home and the water. Every detail, from the lighting to the layout, was chosen to maximise the connection to the environment, blending indoor and outdoor living effortlessly." - Owner - This newly completed residence, designed by Dezcon, encapsulates Mediterranean-inspired elegance with a seamless flow between indoor and outdoor spaces. The architectural excellence and attention to detail make this waterfront home a masterpiece, offering a perfect balance of luxury and functionality for families seeking comfort and style- Offers four resort-style bedrooms, each with its own ensuite. The master suite stands out with its bespoke dressing room, double basin ensuite, and access to a private balcony - Bathrooms feature comfort and style, with premium Parisi fixtures and underfloor heating adding a luxurious touch- The kitchen, a chef's delight, features integrated SMEG appliances, a Viola marble finish, and an expansive butler's pantry. It is designed for both functionality and aesthetics, making it the perfect space for both casual meals and lavish entertaining- The expansive living and dining areas are bathed in natural light, with floor-to-ceiling glass showcasing breathtaking water views. The gas fireplace and custom joinery enhance the elegance, while the outdoor terraces provide an ideal setting for gatherings, complete with a European-inspired heated pool and boat ramp- Additional features include herringbone oak flooring, Venetian plaster walls and ceilings, and cutting-edge technology such as a VRV zoned air-conditioning system, KNX system works for lighting, access, curtains and temperature control including the gas fireplace, and a complete home security system. The property also includes a double garage with a remote turning circle, offering convenience for daily living- Located just moments from Cronulla's vibrant cafes, shops, and beaches, this home provides the ultimate in coastal lifestyle, combining privacy with proximity to the best of the area.
          </p>
        </div>
      </div></div>
    </div></>
  )
}

