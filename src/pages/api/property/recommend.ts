import LogicalPrice from "@/models/logicalPrice";
import Prompt from "@/models/prompt";
import dbConnectBeleef from "@/utils/db";
import { handleEstimateValue} from "@/utils/openai";
import { NextApiRequest, NextApiResponse } from "next";

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
  
      if (property.developmentPotential === "Duplex site") {    
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
        const logicalPrice = await LogicalPrice.findOne({});

        userInput = `Please estimate the value of a property located at ${
          property.address
        } based on the following information:
    
      •	Median Price: The median price ${
        property?.medianSourcePrice
      } for comparable properties is ${property?.medianPrice}.
      
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
    
      1. Start from the provided median price which is and apply adjustments based on ${
        // @ts-ignore
        logicalPrice && logicalPrice.items 
        .map((item:{
            name:string,
            percentage:number
        }) => `${item.name}: ${item.percentage}%`)
        .join(", ")}
  . Match the property features (if exists only then) with those items and apply adding and subtraction of percentages. Now compare bedrooms with the median price of ${
          property?.medianSourcePrice
        }. if bedrooms greater than the source then add EXTRA_BEDROOMS percentage. EXTRA_BATHROOMS condition apply if bathrooms is greater than one.
      2. Consumer Confidence: How would you describe New South Wales current property market consumer confidence note the sources and your reasoning? If the confidence is low only then add CONSUMER_CONFIDENCE_LOW percentage.
      3. Adjustments in final logical reasoning should be in lower case please. Make landArea adjustments percentages based on property.
      4. Show detailed calculation how you come up with that logical price
  
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

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12); // Subtract 12 months

      const logicalPrice = logical.logicalPrice;
  
      const { minPrice, maxPrice } = parsePrice(logicalPrice);
  
      // Ensure minPrice and maxPrice are valid
      if (minPrice === null || maxPrice === null) {
        throw new Error("Unable to parse logical price");
      }

  
      return res.status(200).json({
        success: true,
        data: {
          logical,
        },
      });
    } catch (error:any) {
      console.error("Error in user calculateScoreMatch API: ", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
