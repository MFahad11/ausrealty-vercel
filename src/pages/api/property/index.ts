import { NextApiRequest, NextApiResponse } from "next";
import UserProperty from "@/models/userProperty";
import { escapeRegex, extractStreetAddress, getSuburbMedianPrice } from "@/utils/helpers";
import axios from "axios";
import dbConnectBeleef from "@/utils/db";

async function getExtendedPropertyDetails(propertyId:string) {
    try {
      const response = await axios.get(
        `https://api.pricefinder.com.au/v1/properties/${propertyId}/extended`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${process.env.PRICE_FINDER_KEY}`,
          },
        }
      );
  
      return response.data;
    } catch (error) {
      console.error("Error fetching extended property details:", error);
    }
  }
async function getSoldMatches(suburb:string
    , postcode:string, maxBed: number
    , minBed: number
    , type: string
) {
    try {
      async function getSuburbId(suburb:string, postcode:string) {
        try {
          const response = await axios.get(
            "https://api.pricefinder.com.au/v1/suggest/suburbs",
            {
              params: {
                q: suburb,
                match_ids: false,
              },
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${process.env.PRICE_FINDER_KEY}`,
              },
            }
          );
  
          const matches = response.data.matches;
  
          if (matches && matches.length > 0) {
            // Find the first match with state "NSW"
            const nswMatch = matches.find(
              (match:{
                address:{
                  state:string;
                  postcode:string;
                };
                suburb:{
                  id:string;
                };
              }) =>
                match.address.state === "NSW" &&
                match.address.postcode === postcode
            );
            // Return the ID if an NSW match is found
            return nswMatch ? nswMatch.suburb.id : null;
          }
          return null;
        } catch (error) {
          console.error("Error fetching suburb ID:", error);
          return null;
        }
      }
      const suburbId = await getSuburbId(suburb, postcode);
  
      const response = await axios.get(
        `https://api.pricefinder.com.au/v1/suburbs/${suburbId}/sales?date_end=now&date_start=today-18m&limit=40&matchlevel_max=property&max_beds=${maxBed}&min_beds=${minBed}&property_type=${type}&sort=-date`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer 94bcd2cbb7a085d7b27c45aaef3d0b2`, // Use your API key
          },
        }
      );
  
      return response.data;
    } catch (error) {
      console.error("Error fetching sold matches:", error);
      return null;
    }
  }
  
  async function getDomainPropertySuggestion(address:string, suburb:string) {
    try {
      // Validate inputs
      if (!address || !suburb) {
        throw new Error("Address and suburb are required inputs.");
      }
  
      // API request
      const response = await axios.get(
        `https://api.domain.com.au/v1/properties/_suggest?terms=${encodeURIComponent(
          `${address} NSW`
        )}&pageSize=1&channel=Residential`,
        {
          headers: {
            Accept: "application/json",
            "X-Api-Key": process.env.DOMAIN_API_KEY,
            "X-Api-Call-Source": "live-api-browser",
          },
        }
      );
  
      // Check for matches in the response
      const matches = response.data || [];
      if (matches.length === 0) {
        return null; // No matches found
      }
  
      // Process the first match
      const firstMatch = matches[0];
      const suburbMatch =
        firstMatch.addressComponents?.suburb?.toLowerCase() ===
        suburb.toLowerCase();
  
      return suburbMatch ? firstMatch.id : null;
    } catch (error) {
      throw error;
    }
  }
  
  async function getDomainPropertyDetails(propertyId:string) {
    try {
      const response = await axios.get(
        `https://api.domain.com.au/v1/properties/${propertyId}`,
        {
          headers: {
            accept: "application/json",
            "X-Api-Key": process.env.DOMAIN_API_KEY,
            "X-Api-Call-Source": "live-api-browser",
          },
        }
      );
      return response.data;
    } catch (error:any) {
      console.error(
        `Error fetching property details for ID ${propertyId}:`,
        error.message
      );
      throw error;
    }
  }
  async function getDomainPriceEstimate(propertyId:string) {
    try {
      // API request
      const response = await axios.get(
        `https://api.domain.com.au/v1/properties/${propertyId}/priceEstimate`,
        {
          headers: {
            Accept: "application/json",
            "X-Api-Key": process.env.DOMAIN_API_KEY,
            "X-Api-Call-Source": "live-api-browser",
          },
        }
      );
  
      return {
        lowerPrice: response.data?.lowerPrice,
        midPrice: response.data?.midPrice,
        upperPrice: response.data?.upperPrice,
      };
    } catch (error:any) {
      console.log(error.message);
    }
  }
const runtimeFetchProperty = async (
    address: string,
    suburb: string,
    postcode: string,
    latitude: number,
    longitude: number
  ) => {
    try {
      const propertyId = await getDomainPropertySuggestion(address, suburb);
      if (propertyId) {
        const response = await getDomainPropertyDetails(propertyId);
  
        // Create new property record in Demo collection
        const soldMatches = await getSoldMatches(
          response?.suburb,
          response?.postcode,
          response?.bedrooms >= 5 ? 5 : response?.bedrooms + 1 || 5,
          response?.bedrooms >= 5 ? 4 : response?.bedrooms - 1 || 2,
          ["ApartmentUnitFlat", "Unit", "unit", "Apartment", "Flat"].includes(
            response?.propertyType
          )
            ? "unit"
            : "house"
        );
  
        const { medianPrice, medianPriceSource } = await getSuburbMedianPrice(
          response?.suburb,
          response?.postcode,
          ["ApartmentUnitFlat", "Unit", "unit", "Apartment", "Flat"].includes(
            response?.propertyType
          )
            ? "unit"
            : "house",
          response?.bedrooms
        );
  
        const recentAreaSoldProcess:any = [];
        const domainPrice = await getDomainPriceEstimate(propertyId);
        if (soldMatches?.sales?.length) {
          await Promise.all(
            soldMatches.sales
              .filter(
                (property:{
                    listingHistory:{
                        daysToSell:number;
                    };
                    price:{
                        value:number;
                    };
                }) =>
                  property?.listingHistory &&
                  property?.price?.value &&
                  property?.listingHistory?.daysToSell > 35
              )
              .slice(0, 5) // Limit to 5 records
              .map(async (property:{
                    property:{
                        id:string;
                    };
              }) => {
                try {
                  const response = await getExtendedPropertyDetails(
                    property.property.id
                  );
                  recentAreaSoldProcess.push({
                    saleHistory: response?.saleHistory,
                    listingHistory: response?.listingHistory,
                  });
                } catch (error) {
                  console.error(
                    `Error fetching details for property ID ${property.property.id}:`,
                    error
                  );
                  // Continue without stopping the loop
                }
              })
          );
        }
  
        const property = {
          propertyId,
          address: address.replace(/,? NSW.*$/, ""),
          listingType: response?.status === "OnMarket" ? "Sale" : "Sold",
          listingStatus: response?.status,
          dateListed: response?.history?.sales?.[0]?.first?.advertisedDate,
          daysListed: response?.history?.sales?.[0]?.daysOnMarket,
          price: response?.history?.sales?.[0]?.price,
          saleProcess:
            response?.history?.sales?.[0]?.type === "Private Treaty - Sold"
              ? "privateTreaty"
              : response?.history?.sales?.[0]?.type,
          postcode,
          suburb: suburb.toUpperCase(),
          latitude,
          longitude,
          channel: "residential",
          bedrooms: response?.bedrooms || null,
          bathrooms: response?.bathrooms || null,
          carspaces: response?.carSpaces || null,
          features: response?.features || [],
          media: response?.photos?.length
            ? response.photos.map((photo:{
                imageType:string;
                fullUrl:string;
            }) => ({
                type: photo.imageType,
                url: photo.fullUrl,
              }))
            : [],
          pool: response?.features?.includes("Pool_View") ? "Yes" : "No",
          propertyType: response?.propertyType || null,
          landArea: response?.areaSize || null,
          canonicalUrl: response?.canonicalUrl || null,
          recentAreaSoldProcess: recentAreaSoldProcess || null,
          history: response?.history,
          domainPrice,
          medianPrice:
            response?.propertyType === "Duplex"
              ? Math.round(medianPrice * 0.9) // Reduce by 10%
              : medianPrice,
          medianPriceSource,
        };
  
        return property;
      }
  
      const property = {
        address: address.replace(/,? NSW.*$/, ""),
        listingType: "Sale",
        price: null,
        postcode: postcode,
        suburb: suburb.toUpperCase(),
        latitude,
        longitude,
        channel: "residential",
      };
      return property;
    } catch (error:any) {
      console.error(
        `Error fetching property details for address ${address}:`,
        error.message
      );
      throw error;
    }
  };
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
await dbConnectBeleef();
  const { address, suburb, postcode, latitude, longitude } = req.body;

  let inputStreetAddress = extractStreetAddress(address);
  let addressWords = inputStreetAddress.split(" ");
  let regexPattern = addressWords
    .map((word) => escapeRegex(word))
    .join("[,\\s]*");
  let regex = new RegExp(`^${regexPattern}.*`, "i");

  try {
    
    // Check if a UserProperty with the same userId and address already exists
    const userPropertyExists = await UserProperty.findOne({
      address: { $regex: regex },
      ...(suburb && { suburb: { $regex: new RegExp(`^${suburb}$`, "i") } }),
    })
    if (userPropertyExists) {
       
        return res.status(200).json({ success: true, data: userPropertyExists });
      }
    const boxStatus = [
      { name: "bookAppraisal", status: "unlock" },
      { name: "priceProcess", status: "unlock" },
      { name: "postList", status: "lock" },
      { name: "authoriseSchedule", status: "lock" },
      { name: "prepareMarketing", status: "lock" },
      { name: "goLive", status: "lock" },
      { name: "onMarket", status: "unlock" },
    ];

    const processChain = [
      { label: "1", name: "Views", selected: null },
      { label: "2", name: "Enquiry", selected: null },
      { label: "3", name: "Inspection", selected: null },
      { label: "4", name: "Offers", selected: null },
      { label: "5", name: "Close Feedback", selected: null },
      { label: "6", name: "Vendor Acceptance", selected: null },
      { label: "7", name: "Maximum Outcome", selected: null },
    ];

    const fiveStepProcess = [
      {
        name: "OFF MARKET",
        pricePoint: "1.8-1.9m",
        enquiries: "82",
        inspections1: "0",
        priceAssessment: "Top end of the range",
        inspections2: "0",
        engagement: "",
        finalise: "",
        keyMeeting: "KEY MEETING: LISTING APPOINTMENT",
      },
      {
        name: "WEEK 1",
        pricePoint: "1.6-1.7m",
        enquiries: "50",
        inspections1: "15",
        priceAssessment: "Top end of the range",
        inspections2: "15",
        engagement: "3",
        finalise: "",
        keyMeeting: "KEY MEETING: LAUNCH TO MARKET MEETING",
      },
      {
        name: "WEEK 2",
        pricePoint: "1.7-1.8m",
        enquiries: "26",
        inspections1: "5",
        priceAssessment: "Top end of the range",
        inspections2: "20",
        engagement: "2",
        finalise: "1.9m",
        keyMeeting: "KEY MEETING: MID CAMPAIGN MEETING",
      },
      {
        name: "WEEK 3",
        pricePoint: "",
        enquiries: "",
        inspections1: "",
        priceAssessment: "Top end of the range",
        inspections2: "",
        engagement: "",
        finalise: "",
        keyMeeting: "KEY MEETING: PRE CLOSING DATE",
      },
      {
        name: "WEEK 4",
        pricePoint: "",
        enquiries: "",
        inspections1: "",
        priceAssessment: "Top end of the range",
        inspections2: "",
        engagement: "",
        finalise: "",
        keyMeeting: "KEY MEETING: POST CLOSING DATE",
      },
    ];

    const property = await runtimeFetchProperty(
      address,
      suburb,
      postcode,
      latitude,
      longitude
    );

    // Create a new UserProperty document
    const newUserProperty = await UserProperty.create({
    //   userId: id,
      ...property,
      boxStatus,
      processChain,
      fiveStepProcess,
    });

    return res.status(200).json({ success: true, data: newUserProperty });
  } catch (error: any) {
    console.error("Error creating property:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}