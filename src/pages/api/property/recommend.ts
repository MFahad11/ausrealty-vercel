import Prompt from "@/models/prompt";
import dbConnectBeleef from "@/utils/db";
import { areaDynamics } from "@/utils/helpers";
import { handleEstimateValue, handleGeneralWithReponse } from "@/utils/openai";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
function datePreviousYear() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
    // We don't need to format it to a string if we're working with MongoDB queries
    // Return the Date object directly
    return oneYearAgo;
  }
  function parsePrice(priceStr:string) {
    // Remove "$", commas, and any whitespace
    priceStr = priceStr.replace(/\$|,/g, "").trim();
  
    // Split the string at the hyphen '-' to extract the range
    const [minStr, maxStr] = priceStr.split("-");
  
    if (!minStr || !maxStr) {
      throw new Error(`Invalid price range: ${priceStr}`);
    }
  
    // Parse the numeric values
    const minPrice = parseFloat(minStr);
    const maxPrice = parseFloat(maxStr);
  
    if (isNaN(minPrice) || isNaN(maxPrice)) {
      throw new Error(
        `Unable to parse numbers in logical price range: ${priceStr}`
      );
    }
  
    return { minPrice, maxPrice };
  }
  
  async function listingMatches(
    listingType :string,
    propertyType :string,
    suburb  :string,
    postcode    :string,
    bedrooms   :number,
    logicalPrice    :string,
    multiplier   :number
  ) {
    try {
      let { minPrice, maxPrice } = parsePrice(logicalPrice);
      minPrice = Math.round(minPrice - minPrice * multiplier);
      maxPrice = Math.round(maxPrice + maxPrice * multiplier);
  
      const createRequestPayload = (removeSuburb = false) => {
        const payload = {
          listingType,
          propertyTypes: [propertyType],
          listedSince: datePreviousYear(),
          locations: removeSuburb
            ? [
                {
                  postcode,
                  state: "NSW",
                },
              ]
            : [
                {
                  suburb,
                  postcode,
                  state: "NSW",
                },
              ],
          pageSize: 10,
          pageNumber: 1,
        };
  
        // Add minPrice and maxPrice conditionally
        if (propertyType !== "ApartmentUnitFlat" && minPrice) {
            // @ts-ignore
          payload.minPrice = minPrice;
        }
        if (propertyType !== "ApartmentUnitFlat" && maxPrice) {
            // @ts-ignore

          payload.maxPrice = maxPrice;
        }
  
        // Add bedroom conditions conditionally
        if (propertyType !== "VacantLand") {
            // @ts-ignore

          payload.minBedrooms =
            propertyType === "ApartmentUnitFlat"
              ? bedrooms
              : Math.max(0, bedrooms - 2);
            // @ts-ignore

          payload.maxBedrooms =
            propertyType === "ApartmentUnitFlat" ? bedrooms : bedrooms + 1;
        }
  
        return payload;
      };
  
      // Initial API call
      const response = await axios.post(
        "https://api.domain.com.au/v1/listings/residential/_search",
        createRequestPayload(),
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-Api-Key": process.env.DOMAIN_API_KEY,
            "X-Api-Call-Source": "live-api-browser",
          },
        }
      );
  
      let transformedArray = response.data.map((item:{
        listing:{
            id:string,
            propertyDetails:{
                address:string,
        propertyType:string,
        price:number,
        landArea:string,
        bedrooms:string,
        bathrooms:string,
        carspaces:string,
        features:string,
                displayableAddress:string

        },
        priceDetails:{
            price:number
        },
        media:[],
        advertiser:{},
        soldData:{}
      }}) => {
        const { listing } = item;
  
        const property = {
          id: listing?.id,
          address: listing?.propertyDetails?.displayableAddress || "N/A",
          propertyType: listing?.propertyDetails?.propertyType || "N/A",
          price: listing?.priceDetails?.price || "N/A",
          landArea: listing?.propertyDetails?.landArea || "N/A",
          bedrooms: listing?.propertyDetails?.bedrooms || "N/A",
          bathrooms: listing?.propertyDetails?.bathrooms || "N/A",
          carspaces: listing?.propertyDetails?.carspaces || "N/A",
          features: listing?.propertyDetails?.features || "N/A",
          media: listing?.media || [],
          advertiser: listing?.advertiser || {},
          soldData: listing?.soldData || {},
        };
  
        return { property };
      });
  
      // If less than 3 items, rerun API without the suburb
      if (transformedArray.length < 3) {
        const retryResponse = await axios.post(
          "https://api.domain.com.au/v1/listings/residential/_search",
          createRequestPayload(true),
          {
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
              "X-Api-Key": process.env.DOMAIN_API_KEY,
              "X-Api-Call-Source": "live-api-browser",
            },
          }
        );
  
        transformedArray = retryResponse.data.map((item:{
            listing:{
                id:string,
                propertyDetails:{
                    address:string,
            propertyType:string,
            price:number,
            landArea:string,
            bedrooms:string,
            bathrooms:string,
            carspaces:string,
            features:string,
                    displayableAddress:string
    
            },
            priceDetails:{
                price:number
            },
            media:[],
            advertiser:{},
            soldData:{}
          }}) =>  {
          const { listing } = item;
  
          const property = {
            id: listing?.id,
            address: listing?.propertyDetails?.displayableAddress || "N/A",
            propertyType: listing?.propertyDetails?.propertyType || "N/A",
            price: listing?.priceDetails?.price || "N/A",
            landArea: listing?.propertyDetails?.landArea || "N/A",
            bedrooms: listing?.propertyDetails?.bedrooms || "N/A",
            bathrooms: listing?.propertyDetails?.bathrooms || "N/A",
            carspaces: listing?.propertyDetails?.carspaces || "N/A",
            features: listing?.propertyDetails?.features || "N/A",
            media: listing?.media || [],
            advertiser: listing?.advertiser || {},
            soldData: listing?.soldData || {},
          };
  
          return { property };
        });
      }
  
      return transformedArray || [];
    } catch (error) {
      console.error("Error fetching listings:", error);
      return [];
    }
  }
async function duplexMatches(listingType:string, suburb:string, postcode:string, bedrooms:string) {
    const response = await axios.post(
      "https://api.domain.com.au/v1/listings/residential/_search",
      {
        listingType,
        propertyTypes: ["Duplex", "SemiDetached"],
        listedSince: datePreviousYear(),
        locations: [
          {
            ...(suburb && { suburb }), // Conditionally add suburb if it exists
            ...(postcode && { postcode }), // Conditionally add postcode if it exists
            state: "NSW",
          },
        ],
        pageSize: 20,
        pageNumber: 1,
      },
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-Api-Key": process.env.DOMAIN_API_KEY,
          "X-Api-Call-Source": "live-api-browser",
        },
      }
    );
  
    // Transform the response data
    const transformedArray = response.data.map((item:{
        listing:{
            id:string,
            propertyDetails:{
                address:string,
        propertyType:string,
        price:number,
        landArea:string,
        bedrooms:string,
        bathrooms:string,
        carspaces:string,
        features:string,
                displayableAddress:string
                


            },
            priceDetails:{
                    price:number
                },
            media:[],
            advertiser:{},
            soldData:{}
        }
            
    }) => {
      const { listing } = item;
  
      // Extract and flatten data into the `property` key
      const property = {
        id: listing?.id,
        address: listing?.propertyDetails?.displayableAddress || "N/A",
        propertyType: listing?.propertyDetails?.propertyType || "N/A",
        price: listing?.priceDetails?.price || 0, // Default to 0 if price is missing
        landArea: listing?.propertyDetails?.landArea || "N/A",
        bedrooms: listing?.propertyDetails?.bedrooms || "N/A",
        bathrooms: listing?.propertyDetails?.bathrooms || "N/A",
        carspaces: listing?.propertyDetails?.carspaces || "N/A",
        features: listing?.propertyDetails?.features || "N/A",
        media: listing?.media || [],
        advertiser: listing?.advertiser || {},
        soldData: listing?.soldData || {},
      };
  
      return property;
    });
  
    // Sort the transformed array by price in descending order
    transformedArray.sort((a:{
        price:number
    }, b:{
        price:number
    }) => b.price - a.price);
  
    return transformedArray;
  }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, message: "Method not allowed" });
    }
    try {
    await dbConnectBeleef();
      const { property } = req.body;
  
      if (!property) {
        return res
          .status(400)
          .json({ success: false, message: "Property data is required" });
      }
  
      const systemPrompt = `Return response in json format {logicalPrice:"",logicalReasoning:""}`;
      let userInput;
      let recommendedSold;
      let recommendedSales;
  
      if (property.developmentPotential === "Duplex site") {
        recommendedSold = property?.duplexMatches;
  
        let duplexSaleProperties = [];
        duplexSaleProperties = await duplexMatches(
          "Sale",
          property.suburb,
          property.postcode,
          property.bedrooms
        );
  
        if (duplexSaleProperties.length === 0) {
          duplexSaleProperties = await duplexMatches(
            "Sale",
            "",
            property.postcode,
            property.bedrooms
          );
        }
  
        const transformedDuplexSaleProperties = duplexSaleProperties.map(
          (item:any) => ({
            property: item || {}, // Wrap each item in a `property` key
          })
        );
        recommendedSales = transformedDuplexSaleProperties;
  
        userInput = `Please estimate the value of a property located at ${
          property.address
        } based on the following information:
    
      Property Specifications:
      •	Address: ${property.address}
      • Property type: ${property.propertyType}
  
    Logical Reasoning:
  
    Comparable Sale Analysis: The recent sale of a duplex at ${
      property?.selectedDuplex?.property?.address
    } for ${property?.selectedDuplex?.property?.price} provides a reference point.
  
    Resale Revenue: The resale value for each duplex is ${
      property?.selectedDuplex?.property?.price
    }. Since there are two duplexes, the total resale revenue is ${
          property?.selectedDuplex?.property?.price
        } x 2 = ${property?.selectedDuplex?.property?.price * 2}.
  
    Less GST (4.5%): GST on the total resale revenue is 4.5% of ${
      property?.selectedDuplex?.property?.price * 2
    }, which is ${
          property?.selectedDuplex?.property?.price * 2 * 0.045
        }. Therefore, the resale revenue less GST is ${
          property?.selectedDuplex?.property?.price * 2
        } - ${property?.selectedDuplex?.property?.price * 2 * 0.045} = ______ 
  
    Construction Costs: The construction costs are given as ${
      property?.constructionCosts
    }
  
    Plans, DA, Agent, and Holding Costs: These costs are $60,000 (plans and DA) + $50,000 (agent fees) + $100,000 (holding costs) = $210,000. (this is always the same)
  
    Total Costs: The total costs are the sum of construction costs and other costs, which is _________
  
    Net Resale Revenue After Costs: __________
  
    Profit Margin: The profit margin is ${
      property?.profitMargin
    }% of the profit(which is Net Resale Revenue After Costs).
  
    Site Value Before Stamp Duty: The site value before considering stamp duty is the Net Resale Revenue After Costs minus profit margin, which is ____________
  
    Less Stamp Duty (4%): Stamp duty is 4% of the site value before stamp duty, which is 4% of final costs
  
    Final Site Value: The final site value is the site value before stamp duty less the stamp duty, which is ____________
  
    Consumer Confidence: How would you describe New South Wales current property market consumer confidence note the sources and your reasoning?
      
    Please make your logical price calculations correctly donot hallucinate or makeup calculations. Your calculations should be accurate. There is no chance of errors. Please donot do like this suppose X value etc. I dont want that.
    
    Answer in json format. {logicalReasoning:"For the logical reasoning use only <ul><li> along with <b> for making bold sub-headings inside <li>.",logicalPrice:"based on logical reasoning final estimate calculate the logical price e.g format $1,800,000"}`;
      } else {
        userInput = `Please estimate the value of a property located at ${
          property.address
        } based on the following information:
    
      •	Median Price: The median price ${
        property?.medianSourcePrice
      } for comparable properties is ${property?.medianPrice} .
      Property Specifications:
      •	Address: ${property.address}
      • Property type: ${property.propertyType}
      • Property Features: ${property.features}
      • ${
        property.propertyType !== "ApartmentUnitFlat" && property.landArea
          ? `Land area: ${property.landArea}`
          : ""
      }
      • ${
        property.propertyType !== "ApartmentUnitFlat" && property.frontage
          ? `Frontage: ${property.frontage}`
          : ""
      }
      • Bedrooms: ${property.bedrooms}
      • Bathrooms: ${property.bathrooms}
      • Car spaces: ${property.carspaces}
      • Topography: ${property.topography}
      • ${
        property.propertyType !== "ApartmentUnitFlat"
          ? `Construction: ${property.buildType}`
          : ""
      }
      • Wall Material: ${property.wallMaterial}
      • ${
        property.propertyType !== "ApartmentUnitFlat"
          ? `Pool: ${property.pool}`
          : ""
      }
      • ${
        property.propertyType !== "ApartmentUnitFlat"
          ? `Tennis Court: ${property.tennisCourt}`
          : ""
      }
      • Water views: ${property.waterViews}
      • Street traffic: ${property.streetTraffic}
      • Finishes: ${property.finishes}
      • Granny Flat: ${property.grannyFlat}
      • ${
        property.additionalInformation
          ? `Additional Features: ${property.additionalInformation}`
          : ""
      }
      • ${
        property.developmentPotential
          ? `Development Potential: ${property.developmentPotential}`
          : ""
      }
    
    Instructions:
    
      1. Start from the provided median price which is and apply adjustments based on each feature, adding or subtracting percentages where relevant.
      2. Add additional features also while making adjustments.
      3. Your adjustments and calculations should be accurate.
      4. Provide a breakdown of each adjustment and its impact on the final estimate.
      5. After all the adjustments gather all values remove $ and comma from them add up all prices in the median price and come up with a final logical price. Mention all your calculations. this value will be the logical price.
      6. Consumer Confidence: How would you describe New South Wales current property market consumer confidence note the sources and your reasoning?
      7. Show detailed calculation how you come up with that logical price
  
      Please make your logical price calculations correctly donot hallucinate or makeup calculations. Your calculations should be accurate. There is no chance of errors.
    
      Answer in json format. {logicalReasoning:"For the logical reasoning use only <ul><li> along with <b> for making bold sub-headings inside <li>.",logicalPrice:"based on logical reasoning final estimate calculate the logical price e.g format $1,800,000"}`;
      }
  
      const logical = await handleEstimateValue(
        systemPrompt,
        userInput,
        
      );
  
      if (logical?.logicalPrice) {
        // Parse the logical price to a number (assuming it's a string)
        const logicalPrice = parseFloat(
          logical.logicalPrice.replace(/[^0-9.-]+/g, "")
        );
  
        // Calculate the range
        const lowerPrice = Math.round(logicalPrice); // Round to nearest integer
        const upperPrice = Math.round(logicalPrice * 1.1); // Round to nearest integer
  
        // Format the range values as currency
        const formattedLowerPrice = `$${lowerPrice.toLocaleString("en-US")}`;
        const formattedUpperPrice = `$${upperPrice.toLocaleString("en-US")}`;
  
        // Construct the final range
        logical.logicalPrice = `${formattedLowerPrice} - ${formattedUpperPrice}`;
      }
  
      if (property.developmentPotential !== "Duplex site") {
        recommendedSold = await listingMatches(
          "Sold",
          property.propertyType,
          property.suburb,
          property.postcode,
          property.bedrooms,
          logical.logicalPrice,
          0.1
        );
  
        recommendedSales = await listingMatches(
          "Sale",
          property.propertyType,
          property.suburb,
          property.postcode,
          property.bedrooms,
          logical.logicalPrice,
          0.2
        );
      }
  
      const prompt = await Prompt.findOne({
        name: "POSTLIST_PROMPT_ENGAGED_PURCHASER",
      });
      console.log("prompt", prompt);
      const engagedPurchaser = await handleGeneralWithReponse(
        prompt?.description || "",
        `Here is the property:
        
      Address: ${property.address}
      Property type: ${property.propertyType}
      Property Features: ${property.features}
    ${
      property.propertyType !== "ApartmentUnitFlat" && property.landArea
        ? `Land area: ${property.landArea}`
        : ""
    }
    ${
      property.propertyType !== "ApartmentUnitFlat" && property.frontage
        ? `Frontage: ${property.frontage}`
        : ""
    }
      Beds: ${property.bedrooms}
      Bath: ${property.bathrooms}
      Car spaces: ${property.carspaces}
      Topography: ${property.topography}
      ${
        property.propertyType !== "ApartmentUnitFlat"
          ? `Construction: ${property.buildType}`
          : ""
      }
      Wall Material: ${property.wallMaterial}
      ${
        property.propertyType !== "ApartmentUnitFlat"
          ? `Pool: ${property.pool}`
          : ""
      }
      ${
        property.propertyType !== "ApartmentUnitFlat"
          ? `Tennis Court: ${property.tennisCourt}`
          : ""
      }
      Water views: ${property.waterViews}
      Street traffic: ${property.streetTraffic}
      Finishes: ${property.finishes}
      Granny Flat: ${property.grannyFlat}
      ${
        property.developmentPotential
          ? `Development Potential: ${property.developmentPotential}`
          : ""
      }
      ${
        property.additionalInformation
          ? `Additional Information: ${property.additionalInformation}`
          : ""
      }`
      );
  
      const prompt2 = await Prompt.findOne({
        name: "MICRO_POCKETS",
      });
      const microPockets = await handleGeneralWithReponse(
        prompt2?.description || "",
        `Address: ${property.address}\nSuburb: ${property.suburb}`,
      );
  
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12); // Subtract 12 months
  
      const duplexProperties = await duplexMatches(
        "Sold",
        property.suburb,
        property.postcode,
        property.bedrooms
      );
  
      const areaDynamicsRes = await areaDynamics(property.suburb);
  
      const logicalPrice = logical.logicalPrice;
  
      const { minPrice, maxPrice } = parsePrice(logicalPrice);
  
      // Ensure minPrice and maxPrice are valid
      if (minPrice === null || maxPrice === null) {
        throw new Error("Unable to parse logical price");
      }
  
      const lowEndProperties = recommendedSold
        .filter(
          (propertyObj:{
            property:{
                price:number
            }
          }) =>
            propertyObj.property.price <= minPrice &&
            propertyObj.property.price !== null
        )
        .sort((a:{
            property:{
                price:number
            }
        }, b:{
            property:{
                price:number
            }
        }) => a.property.price - b.property.price)
        .slice(0, 3);
  
      const highEndProperties = recommendedSold
        .filter((propertyObj:{
            property:{
                price:number
            }
        }) => propertyObj.property.price >= maxPrice)
        .sort((a:{
            property:{
                price:number
            }
        }, b:{
            property:{
                price:number
            }
        }) => b.property.price - a.property.price)
        .slice(0, 3);
  
      const propertiesInRange = recommendedSold.filter(
        (propertyObj:{
            property:{
                price:number
            }
        }) =>
          propertyObj.property.price >= minPrice &&
          propertyObj.property.price <= maxPrice
      );
  
      const checkProcess = () => {
        if (
          property.developmentPotential !== null &&
          property.developmentPotential !== ""
        ) {
          return "Auction - Development Site";
        }
  
        if (propertiesInRange?.length >= 3) {
          if (
            (property?.propertyType === "ApartmentUnitFlat" &&
                // @ts-ignore
              areaDynamicsRes.unitStats?.annualSalesVolume >= 90) ||
            (property?.propertyType !== "ApartmentUnitFlat" &&
                // @ts-ignore
              areaDynamicsRes.houseStats?.annualSalesVolume >= 170)
          ) {
            return "Private Treaty Offers Closing: Live Guide With Live Closing Date";
          } else {
            return "Private Treaty Offers Closing";
          }
        } else {
          return "Private Treaty Using Sales: No Guide Only Sales & Backend Closing Date";
        }
      };
  
      const recommendedSaleProcess = checkProcess();
  
      const data = {
        logicalPrice: logical.logicalPrice,
        logicalReasoning: logical.logicalReasoning,
        recommendedSales,
        recommendedSold,
        duplexProperties,
        engagedPurchaser,
        recommendedSaleProcess,
        highEndProperties,
        lowEndProperties,
        microPockets,
      };
  
  
      return res.status(200).json({
        success: true,
        data: {
          logical,
          recommendedSales,
          recommendedSold,
          duplexProperties,
          recommendedSaleProcess,
          highEndProperties,
          lowEndProperties,
          engagedPurchaser,
          microPockets,
        },
      });
    } catch (error:any) {
      console.error("Error in user calculateScoreMatch API: ", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
