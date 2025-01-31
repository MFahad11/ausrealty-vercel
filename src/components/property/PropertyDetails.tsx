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
    inspections: {
      openingDateTime: string;
      closingDateTime: string;
    }[];
    pastInspections: {
      openingDateTime: string;
      closingDateTime: string;
    }[];
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

export default function PropertyDetails({
  property,
}: {
  property: PropertyType;
}) {
  // Early return with loading state if property is undefined
  if (!property) {
    return <div className="max-w-4xl mx-auto px-4 py-8">Loading...</div>;
  }

  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Property Header */}
      <div className="mb-8">
        <h1 className="mb-4">{property.headline || "Property Details"}</h1>
        <p className="text-lg">{property.addressParts?.displayAddress}</p>
      </div>

      {/* Key Property Features */}
      <div className="flex flex-wrap gap-6 mb-8 font-lato">
        <div className="flex items-center gap-2  font-lato">
          <span className="font-semibold  font-lato">
            {property.bedrooms || 0}
          </span>
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
          <span className="font-semibold capitalize">
            {property.objective || "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-2 font-lato">
          <span className="font-semibold capitalize">
            {property.saleMode || "N/A"}
          </span>
        </div>
      </div>

      {/* Price and Status */}
      <div className="mb-8 flex flex-wrap gap-2">
        <div className="inline-block bg-black text-white px-4 py-2 rounded-sm text-sm font-medium">
          {property.priceDetails?.displayPrice || "Price not available"}
        </div>
        <div className="inline-block bg-black text-white px-4 py-2 rounded-sm text-sm font-medium capitalize">
          {property.status || "Status not available"}
        </div>
        <div className="inline-block bg-black text-white px-4 py-2 rounded-sm text-sm font-medium capitalize">
          {property.channel || "Channel not specified"}
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
      <div className="space-y-2 mb-6">
        {property.inspectionDetails.inspections.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Upcoming Inspections:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {property.inspectionDetails.inspections.map(
                (inspection, index) => (
                  <li key={index}>
                    {dayjs.utc(inspection.openingDateTime).format(
                      "MMMM D, YYYY h:mm A"
                    )}{" "}
                    - {dayjs.utc(inspection.closingDateTime).format("h:mm A")}
                  </li>
                )
              )}
            </ul>
          </div>
        )}
        {property.inspectionDetails.pastInspections.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Past Inspections:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {property.inspectionDetails.pastInspections.map(
                (inspection, index) => (
                  <li key={index}>
                    {dayjs.utc(inspection.openingDateTime).format(
                      "MMMM D, YYYY h:mm A"
                    )}{" "}
                    - {dayjs.utc(inspection.closingDateTime).format("h:mm A")}
                  </li>
                )
              )}
            </ul>
          </div>
        )}
        {property.inspectionDetails.inspections.length === 0 &&
          property.inspectionDetails.pastInspections.length === 0 &&
          null}
      </div>
      {/* Description Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight mb-6">DESCRIPTION</h2>
        <div className="prose max-w-none text-gray-700 space-y-4">
          {useMemo(() => {
            const description = property.description || "";

            // Split the description into lines
            const lines = description.split("\n");

            // Extract the main paragraph and identify bullet points
            const mainParagraph: string[] = [];
            const bulletPoints: string[] = [];
            const otherSections: string[] = [];

            lines.forEach((line) => {
              const trimmedLine = line.trim();

              if (trimmedLine.startsWith("-")) {
                // Add to bullet points
                bulletPoints.push(trimmedLine.replace(/^-\s*/, ""));
              } else if (trimmedLine.toLowerCase().includes("disclaimer")) {
                // Add disclaimers or other sections
                otherSections.push(trimmedLine);
              } else if (trimmedLine) {
                // Add to the main paragraph
                mainParagraph.push(trimmedLine);
              }
            });

            // Shorten the main paragraph for "Read More" functionality
            const words = mainParagraph.join(" ").split(" ");
            const shortDescription = words.slice(0, 50).join(" ");
            const fullDescription = mainParagraph.join(" ");

            return (
              <>
                {/* Main Paragraph */}
                <p className="leading-relaxed">
                  {isExpanded ? fullDescription : shortDescription}
                  {!isExpanded && words.length > 50 && "..."}
                </p>

                {/* Bullet Points */}
                {isExpanded && bulletPoints.length > 0 && (
                  <ul className="list-disc pl-5 space-y-2">
                    {bulletPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                )}

                {/* Other Sections (e.g., Disclaimers) */}
                {isExpanded &&
                  otherSections.map((section, index) => (
                    <p key={index} className="italic text-gray-600">
                      {section}
                    </p>
                  ))}

                {/* Read More / Read Less Button */}
                {words.length > 10 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 text-black font-medium"
                  >
                    {isExpanded ? "Read Less" : "Read More"}
                  </button>
                )}
              </>
            );
          }, [property.description, isExpanded])}
        </div>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Property Details</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600">Property Type</dt>
              <dd className="font-medium">
                {property.propertyTypes?.join(", ") || "Not specified"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Sale Method</dt>
              <dd className="font-medium capitalize">
                {property.saleDetails?.saleMethod || "Not specified"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">New Development</dt>
              <dd className="font-medium">
                {property.isNewDevelopment ? "Yes" : "No"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Listed Date</dt>
              <div className="font-medium">
                {dayjs(property.dateListed).format("DD/MM/YYYY")}
              </div>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Last Updated</dt>
              <dd className="font-medium">
                {dayjs(property.dateUpdated).format("DD/MM/YYYY")}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Property ID</dt>
              <dd className="font-medium">
                {property.propertyId || "Not available"}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Location</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600">Suburb</dt>
              <dd className="font-medium">
                {property.addressParts?.suburb || "Not specified"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">State</dt>
              <dd className="font-medium uppercase">
                {property.addressParts?.stateAbbreviation || "Not specified"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Postcode</dt>
              <dd className="font-medium">
                {property.addressParts?.postcode || "Not specified"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
