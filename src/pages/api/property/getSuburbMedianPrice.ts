import dbConnectBeleef from "@/utils/db";
import { getSuburbMedianPrice } from "@/utils/helpers";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnectBeleef();
    const { suburb, postcode, propertyType, bedrooms } = req.query;

    if (!suburb || !postcode || !propertyType || !bedrooms) {
      return res.status(400).json({
        success: false,
        message: "Suburb, postcode, property type, and bedrooms are required.",
      });
    }

    // Determine the property category based on the type
    const propertyCategory =
      ["ApartmentUnitFlat", "Unit", "unit", "Apartment", "Flat"].includes(
        propertyType as string
      )
        ? "unit"
        : "house";

    // Fetch the median price and source
    const { medianPrice, medianPriceSource } = await getSuburbMedianPrice(
      suburb as string,
      postcode as string,
      propertyCategory,
      parseInt(bedrooms as string, 10)
    );

    // Adjust median price for Duplex property type
    const adjustedMedianPrice =
      propertyType === "Duplex"
        ? Math.round(medianPrice * 0.9) // Reduce by 10%
        : medianPrice;

    // Respond with the median price and source
    return res.status(200).json({
      success: true,
      data: {
        medianPrice: adjustedMedianPrice,
        medianPriceSource,
      },
    });
  } catch (error: any) {
    console.error("Error in getSuburbMedianPrice API:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
