interface AddressParts {
    suburb: string;
    stateAbbreviation: string;
    postcode: string;
    street: string;
    displayAddress: string;
  }
  
  interface PropertyListing {
    objective: string;
    propertyTypes: string[];
    status: string;
    addressParts: AddressParts;
    bathrooms: number;
    bedrooms: number;
    carspaces: number;
    description: string;
    headline: string;
    [key: string]: any;
  }
  
  // Common property type variations for flexible matching
  const propertyTypeMap: Record<string, string[]> = {
    'apartmentUnitFlat': ['apartment', 'unit', 'flat', 'apartmentunitflat'],
    'house': ['house', 'home', 'residence'],
    'townhouse': ['townhouse', 'town house', 'villa'],
    'studio': ['studio', 'bachelor'],
    'duplex': ['duplex', 'semi-detached'],
    'penthouse': ['penthouse', 'luxury apartment'],
    'terrace': ['terrace', 'terrace house'],
    'villa': ['villa', 'villa unit'],
    'acreage': ['acreage', 'land', 'rural'],
    'blockOfUnits': ['block of units', 'apartment block', 'unit block']
  };
  
  /**
   * Search through property listings based on user input
   * @param listings Array of property listings
   * @param searchTerm User input search term
   * @returns Filtered array of property listings
   */
  const filterProperties = (
    listings: PropertyListing[],
    searchTerm: string
  ): PropertyListing[] => {
    // If no search term, return all listings
    if (!searchTerm?.trim()) {
      return listings;
    }
  
    const normalizedSearch = searchTerm.toLowerCase().trim();
    const searchTerms = normalizedSearch.split(/\s+/);
  
    return listings.filter(listing => {
      // Normalize property types for searching
      const propertyTypeVariations = listing.propertyTypes.flatMap(type => {
        const variations = propertyTypeMap[type] || [type.toLowerCase()];
        // Add the original type as well
        return [...variations, type.toLowerCase()];
      });
  
      // Convert relevant listing data to searchable string
      const searchableContent = [
        // Location-based search
        listing.addressParts.suburb,
        listing.addressParts.stateAbbreviation,
        listing.addressParts.postcode,
        listing.addressParts.street,
        listing.addressParts.displayAddress,
        
        // Property types with variations
        ...propertyTypeVariations,
        
        // Property features
        listing.objective,
        listing.status,
        
        // Additional features from description
        listing.description,
        listing.headline,
        
        // Number-based searches
        `${listing.bedrooms} bed`,
        `${listing.bedrooms} beds`,
        `${listing.bedrooms} bedroom`,
        `${listing.bedrooms} bedrooms`,
        `${listing.bathrooms} bath`,
        `${listing.bathrooms} baths`,
        `${listing.bathrooms} bathroom`,
        `${listing.bathrooms} bathrooms`,
        `${listing.carspaces} car`,
        `${listing.carspaces} cars`,
        `${listing.carspaces} carspace`,
        `${listing.carspaces} carspaces`,
        `${listing.carspaces} parking`,
        
        // Common feature keywords from description
        ...(listing.description.toLowerCase().match(/air.*conditioning|balcony|storage|modern|new|luxury|train|station|shops|school/g) || [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
  
      // Check if ALL search terms match (AND operation)
      return searchTerms.every(term => {
        // Handle number ranges
        if (term.includes('+') || term.includes('-')) {
          const numMatch = term.match(/(\d+)([+-])(?:\d+)?/);
          if (numMatch) {
            const baseNum = parseInt(numMatch[1]);
            const operator = numMatch[2];
            
            if (term.includes('bed')) {
              return operator === '+' 
                ? listing.bedrooms >= baseNum
                : listing.bedrooms >= baseNum && listing.bedrooms <= parseInt(term.split('-')[1]);
            }
            if (term.includes('bath')) {
              return operator === '+' 
                ? listing.bathrooms >= baseNum
                : listing.bathrooms >= baseNum && listing.bathrooms <= parseInt(term.split('-')[1]);
            }
            if (term.includes('car')) {
              return operator === '+' 
                ? listing.carspaces >= baseNum
                : listing.carspaces >= baseNum && listing.carspaces <= parseInt(term.split('-')[1]);
            }
          }
        }
  
        // Handle exact number matches
        const numMatch = term.match(/^(\d+)(bed|bath|car)/);
        if (numMatch) {
          const num = parseInt(numMatch[1]);
          const type = numMatch[2];
          if (type === 'bed') return listing.bedrooms === num;
          if (type === 'bath') return listing.bathrooms === num;
          if (type === 'car') return listing.carspaces === num;
        }
  
        // Special handling for property types
        for (const [originalType, variations] of Object.entries(propertyTypeMap)) {
          if (variations.includes(term)) {
            return listing.propertyTypes.some(type => 
              type.toLowerCase() === originalType.toLowerCase()
            );
          }
        }
  
        // Regular text search
        return searchableContent.includes(term);
      });
    });
  };
  export default filterProperties;