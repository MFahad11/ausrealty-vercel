import { NextApiRequest, NextApiResponse } from "next";
import UserProperty from "@/models/userProperty";
import dbConnectBeleef from "@/utils/db";
import { getMapStaticImage } from "@/utils/helpers";
import { handleAerialImgAnalyze } from "@/utils/openai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { address }: { address: string } = req.body;

    if (!address) {
      return res
        .status(400)
        .json({ success: false, message: "Address is required." });
    }

    // Connect to the database
    await dbConnectBeleef();

    // Fetch user property based on the provided address
    const userProperty = await UserProperty.findOne({ address });

    if (!userProperty) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found." });
    }

    const { media, latitude, longitude, suburb, landArea } = userProperty;

    // Fetch the static map image
    const imageBuffer = await getMapStaticImage(latitude, longitude);

    // Analyze the map image using AI
    // @ts-ignore
    const result = await handleAerialImgAnalyze(imageBuffer);

    // Clean up AI result by replacing "null" strings with null values
    Object.keys(result).forEach((key) => {
      if (result[key] === "null") {
        result[key] = null;
      }
    });

    // If the land area is greater than 0, remove it from the result
    if (landArea && landArea > 0) {
      delete result.landArea;
    }

    // Return the cleaned-up result
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error in AI cleanup:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
