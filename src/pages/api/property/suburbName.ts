import Suburb from "@/models/suburb";
import dbConnectBeleef from "@/utils/db";
// Adjust the import path as needed to match your project structure
import { NextApiRequest,NextApiResponse } from "next";
export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    // Connect to the database
    await dbConnectBeleef();

    // Fetch suburbs and select only the 'suburb' field
    const suburbs = await Suburb.find({}).select("suburb");

    // Convert each suburb name to uppercase and remove the '_id' field
    const uppercasedSuburbs = suburbs.map((suburb:{
        suburb: string
    }) =>
      suburb.suburb.toUpperCase()
    );

    // Send the response with only the suburb names
    res.status(200).json({
      success: true,
      data: uppercasedSuburbs,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
