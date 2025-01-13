import { areaDynamics } from "@/utils/helpers";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { suburb } = req.query;

    if (!suburb) {
      return res.status(400).json({
        success: false,
        message: "Suburb is required.",
      });
    }

    // Call the reusable function to fetch area dynamics
    const data = await areaDynamics(suburb as string);

    // Send the response
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Error fetching area dynamics data:", error.message);

    if (error.message.includes("No data found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // Handle other errors
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
