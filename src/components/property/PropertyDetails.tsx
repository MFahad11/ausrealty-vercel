import dayjs from "dayjs";
import { useMemo, useState } from "react";

interface PropertyType {
  headline?: string;
  addressParts: {
    displayAddress: string;
    suburb: string;
    stateAbbreviation: string;
    postcode: string;
  };
  bedrooms: number;
  bathrooms: number;
  carspaces: number;
  priceDetails: {
    displayPrice: string;
  };
  description: string;
  propertyTypes: string[];
  status: string;
  dateListed: string;
  inspectionDetails: {
    isByAppointmentOnly: boolean;
  };
  objective: string;
  saleMode: string;
  channel: string;
  isNewDevelopment: boolean;
  saleDetails: {
    saleMethod: string;
  };
  dateUpdated: string;
  propertyId: string;
}

export default function PropertyDetails({ property }: { property: PropertyType }) {
  // Early return with loading state if property is undefined
  if (!property) {
    return <div className="max-w-4xl mx-auto px-4 py-8">Loading...</div>
  }

  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Property Header */}
      <div className="mb-8">
        <h1 className="mb-4">{property.headline || 'Property Details'}</h1>
        <p className="text-lg">{property.addressParts?.displayAddress}</p>
      </div>

      {/* Key Property Features */}
      <div className="flex flex-wrap gap-6 mb-8 font-lato">
        <div className="flex items-center gap-2  font-lato">
          <span className="font-semibold  font-lato">{property.bedrooms || 0}</span>
          <span>Beds</span>
        </div>
        <div className="flex items-center gap-2  font-lato">
          <span className="font-semibold">{property.bathrooms || 0}</span>
          <span>Baths</span>
        </div>
        <div className="flex items-center gap-2 font-lato">
          <span className="font-semibold">{property.carspaces || 0}</span>
          <span>Cars</span>
        </div>
        <div className="flex items-center gap-2 font-lato">
          <span className="font-semibold capitalize">{property.objective || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2 font-lato">
          <span className="font-semibold capitalize">{property.saleMode || 'N/A'}</span>
        </div>
      </div>

      {/* Price and Status */}
      <div className="mb-8 flex flex-wrap gap-2">
        <div className="inline-block bg-black text-white px-4 py-2 rounded-sm text-sm font-medium">
          {property.priceDetails?.displayPrice || 'Price not available'}
        </div>
        <div className="inline-block bg-black text-white px-4 py-2 rounded-sm text-sm font-medium capitalize">
          {property.status || 'Status not available'}
        </div>
        <div className="inline-block bg-black text-white px-4 py-2 rounded-sm text-sm font-medium capitalize">
          {property.channel || 'Channel not specified'}
        </div>
      </div>
      
      {/* Inspection Details */}
      {property.inspectionDetails?.isByAppointmentOnly && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-center font-medium">
            Inspections available by appointment only
          </p>
        </div>
      )}

      {/* Description Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">DESCRIPTION</h2>
        <div className="prose max-w-none text-gray-700 space-y-4">
          {useMemo(() => {
            const words = property.description?.split(' ') || [];
            const shortDescription = words.slice(0, 50).join(' ');
            const fullDescription = property.description || '';
            return (
              <>
                <p className="leading-relaxed">
                  {isExpanded ? fullDescription : shortDescription}
                  {!isExpanded && words.length > 50 && '...'}
                </p>
                {words.length > 50 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 text-black font-medium"
                  >
                    {isExpanded ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </>
            );
          }, [property.description, isExpanded])}
        </div>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Property Details</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600">Property Type</dt>
              <dd className="font-medium">{property.propertyTypes?.join(', ') || 'Not specified'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Sale Method</dt>
              <dd className="font-medium capitalize">{property.saleDetails?.saleMethod || 'Not specified'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">New Development</dt>
              <dd className="font-medium">{property.isNewDevelopment ? 'Yes' : 'No'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Listed Date</dt>
              <div className="font-medium">{dayjs(property.dateListed).format('DD/MM/YYYY')}</div>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Last Updated</dt>
              <dd className="font-medium">{
                dayjs(property.dateUpdated).format('DD/MM/YYYY')
                }</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Property ID</dt>
              <dd className="font-medium">{property.propertyId || 'Not available'}</dd>
            </div>
          </dl>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Location</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600">Suburb</dt>
              <dd className="font-medium">{property.addressParts?.suburb || 'Not specified'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">State</dt>
              <dd className="font-medium uppercase">{property.addressParts?.stateAbbreviation || 'Not specified'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Postcode</dt>
              <dd className="font-medium">{property.addressParts?.postcode || 'Not specified'}</dd>
            </div>
          </dl>
        </div>
      </div>

    </div>
  )
}
