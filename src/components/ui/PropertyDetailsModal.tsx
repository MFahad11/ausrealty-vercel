import EmblaCarousel from './carousel'
import Modal from './Modal'

export const PropertyDetailsModal = ({
  isOpen,
  onClose,
  property
}: {
  isOpen: boolean
  onClose: () => void
  property: any
}) => {
  if (!property) return null

  const {
    address,
    price,
    propertyType,
    bedrooms,
    bathrooms,
    carspaces,
    landArea,
    buildingArea,
    buildType,
    frontage,
    developmentPotential,
    features,
    media
  } = property

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Property Details'>
      <div className='space-y-6'>
        {/* <h4 className="font-semibold text-lg">{headline}</h4>
          <p className="text-gray-700">{description}</p> */}

        <table className='w-full text-sm'>
          <tbody>
            <tr className='bg-white'>
              <td className='p-2 '>Address</td>
              <td className='p-2'>{address}</td>
            </tr>
            <tr className='bg-lightgray'>
              <td className='p-2 '>Price</td>
              <td className='p-2'>${price?.toLocaleString()}</td>
            </tr>
            <tr className='bg-white'>
              <td className='p-2 '>Property Type</td>
              <td className='p-2'>{propertyType}</td>
            </tr>
            <tr className='bg-lightgray'>
              <td className='p-2 '>Bedrooms</td>
              <td className='p-2'>{bedrooms}</td>
            </tr>
            <tr className='bg-white'>
              <td className='p-2 '>Bathrooms</td>
              <td className='p-2'>{bathrooms}</td>
            </tr>
            <tr className='bg-lightgray'>
              <td className='p-2 '>Carspaces</td>
              <td className='p-2'>{carspaces}</td>
            </tr>

            <tr className='bg-white'>
              <td className='p-2 '>Area</td>
              <td className='p-2'>{landArea} m²</td>
            </tr>
          </tbody>
        </table>

        {/* Media Slider */}
        <div className='mt-6'>
          <h4 className='text-center'>Property Images</h4>
          {media?.length > 0 && (
            <EmblaCarousel>
              {media.map(
                (
                  img: {
                    url: string
                  },
                  idx: number
                ) => (
                  <div key={idx} className='w-full h-[200px]'>
                    <img
                      src={img.url || '/placeholder-image.jpg'}
                      alt={`property-${idx}`}
                      className='w-full h-full object-cover'
                    />
                  </div>
                )
              )}
            </EmblaCarousel>
          )}
        </div>
      </div>
    </Modal>
  )
}
