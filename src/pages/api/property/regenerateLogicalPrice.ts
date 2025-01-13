import dbConnectBeleef from "@/utils/db";
import { handleLogicalTemplateGenerate } from "@/utils/openai";
import { NextApiRequest, NextApiResponse } from "next";

// Define the types for the request body
interface Property {
  address: string;
  logicalPrice: string;
  logicalReasoning: string;
  features?: string;
  propertyType?: string;
  landArea?: string;
  frontage?: string;
  bedrooms?: number;
  bathrooms?: number;
  carspaces?: number;
  topography?: string;
  buildType?: string;
  wallMaterial?: string;
  pool?: string;
  tennisCourt?: string;
  waterViews?: string;
  streetTraffic?: string;
  finishes?: string;
  grannyFlat?: string;
  developmentPotential?: string;
  additionalInformation?: string;
}

interface CheckedProperty {
  property: Partial<Property>;
  
}

interface RequestBody {
  property: Property;
  checkedProperties: CheckedProperty[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnectBeleef();
    const { property, checkedProperties }: RequestBody = req.body;

    if (!property || !checkedProperties || checkedProperties.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Property data and checkedProperties are required",
      });
    }

    // Function to format the checked properties for the prompt
    const formatCheckedProperties = (properties: CheckedProperty[]): string => {
      return properties
        .map(
          (comp:any) => `Address: ${comp.property?.address || "N/A"}
Property type: ${comp.property?.propertyType || "N/A"}
Price: ${comp.property?.price || comp.property?.priceDetails?.price || "N/A"}
Land area: ${
            comp.property?.landArea ||
            comp.property?.propertyDetails?.landArea ||
            "N/A"
          }
Bedrooms: ${
            comp.property?.bedrooms ||
            comp.property?.propertyDetails?.bedrooms ||
            "N/A"
          }
Bathrooms: ${
            comp.property?.bathrooms ||
            comp.property?.propertyDetails?.bathrooms ||
            "N/A"
          }
Carspaces: ${
            comp.property?.carspaces ||
            comp.property?.propertyDetails?.carspaces ||
            "N/A"
          }
Features: ${comp.property?.propertyDetails?.features || "N/A"}
`
        )
        .join("\n");
    };

    const systemPrompt = `Return response in json format {logicalPrice:"",logicalReasoning:"}`;
    const userInput = `Please estimate the value of a property located at ${
      property.address
    } based on the following information:

Current Logical Price for ${property.address} is ${property.logicalPrice}
Current Logical Reasoning for ${property.address} is ${property.logicalReasoning}

Property Features: ${property.features}
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
Beds: ${property.bedrooms}
Bath: ${property.bathrooms}
Car spaces: ${property.carspaces}
Topography: ${property.topography}
Construction: ${property.buildType}
Wall Material: ${property.wallMaterial}
Pool: ${property.pool}
Tennis Court: ${property.tennisCourt}
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
    }

Recent properties that have been sold in the same area:
${formatCheckedProperties(checkedProperties)}

Using the above comparable sales, readjust the logical price and provide a new estimate.

Please make your price assumptions correctly donot fabricate or makeup calculations. Your calculations inside logical reasoning should be always accurate.

Answer in json format. {logicalPrice:"",logicalReasoning:"Use new logical price. do not make assumptions. For the logical reasoning use only <ul><li> along with <b> for making bold sub-headings inside <li>."}`;

    // const logical = await chatCompletion(
    //   systemPrompt,
    //   userInput,
    //   true,
    //   "gpt-4o"
    // );
    // @ts-ignore
    const logical:{
        logicalPrice:string,
        logicalReasoning:string
    } = await handleLogicalTemplateGenerate(systemPrompt,userInput);
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

    // Return the logical price and reasoning
    return res.status(200).json({
      success: true,
      data: logical,
    });
  } catch (error: any) {
    console.error("Error in regenerateLogicalPrice API: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}
