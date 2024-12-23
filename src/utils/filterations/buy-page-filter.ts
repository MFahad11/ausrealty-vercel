type Property = {
  objective: string;
  propertyTypes: string[];
  status: string;
  saleMode: string;
  channel: string;
  addressParts: {
    stateAbbreviation: string;
    displayType: string;
    street: string;
    suburb: string;
    postcode: string;
    displayAddress: string;
  };
  bathrooms: number;
  bedrooms: number;
  carspaces: number;
  priceDetails?: {
    displayPrice: string;
  };
};

type Filter = {
  objective?: string;
  saleMode?: string;
  channel?: string;
  suburb?: string;
  features?: string[];
  location?: string;
  address?: string;
  priceRange?: string; // "min-max" or "value"
  propertyTypes?: string[];
  bedrooms?: number;
  bathrooms?: number;
  carspaces?: number;
};

function filterProperties(properties: Property[], filter: Filter): Property[] {
  // Helper function to check for range match
  function matchesRange(value: number, range?: string): boolean {
    if (!range) return true; // No range specified, always match

    const [min, max] = range.split("-").map((v) => parseFloat(v));

    if (!isNaN(min) && value < min) return false; // Below min
    if (!isNaN(max) && value > max) return false; // Above max

    return true; // Matches range
  }

  // Filter logic
  return properties.filter((property) => {
    // Location-related filtering
    let matchesLocation = false;
    let matchesAddress = false;
    let matchesSuburb = false;
    
    if (filter.suburb || filter.address || filter.location) {
      const matchesSuburb =
        filter.suburb && (property.addressParts.suburb.toLowerCase().includes(filter.suburb.toLowerCase()) || property.addressParts.suburb.toLowerCase()===filter?.suburb?.toLowerCase())
      const matchesAddress =
        filter.address && (property.addressParts.street.toLowerCase().includes(filter.address.toLowerCase()) || property.addressParts.street.toLowerCase()===filter?.address?.toLowerCase())
      const matchesLocation =
        filter.location && (property.addressParts.displayAddress.toLowerCase().includes(filter.location.toLowerCase()) || property.addressParts.displayAddress.toLowerCase()===filter?.location?.toLowerCase())
      
      if (!matchesSuburb && !matchesAddress && !matchesLocation) {
        
        return false; // Reject if none of the location filters match
      }
    }

    // Match objective
    if (filter.objective && property.objective !== filter.objective) {
      console.log('objective', matchesSuburb)
      return false;
    }

    // Match saleMode
    if (filter.saleMode && property.saleMode !== filter.saleMode) {
      console.log('saleMode', matchesSuburb)
      return false;
    }

    // Match channel
    if (filter.channel && property.channel !== filter.channel) {
      console.log('channel', matchesSuburb)
      return false;
    }

    // Match propertyTypes
    if (
      filter.propertyTypes &&
      filter.propertyTypes.length > 0 &&
      !filter.propertyTypes.some((type) => property.propertyTypes.includes(type))
    ) {
      console.log('propertyTypes', matchesSuburb)
      return false;
    }

    // Match bedrooms
    if (filter.bedrooms && property.bedrooms !== filter.bedrooms) {
      console.log('bedrooms', matchesSuburb)
      return false;
    }

    // Match bathrooms
    if (filter.bathrooms && property.bathrooms !== filter.bathrooms) {
      console.log('bathrooms', matchesSuburb)
      return false;
    }

    // Match carspaces
    if (filter.carspaces && property.carspaces !== filter.carspaces) {
      console.log('carspaces', matchesSuburb)
      return false;
    }

    // Match price range
    if (
      filter.priceRange &&
      property.priceDetails?.displayPrice &&
      !matchesRange(parseFloat(property.priceDetails.displayPrice.replace(/[^0-9.]/g, "")), filter.priceRange)
    ) {
      console.log('priceRange', matchesSuburb)
      return false;
    }
    
    console.log('outside', matchesSuburb)

    return true; // Property matches all filters
  });
}

export default filterProperties;
