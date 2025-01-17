import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const dateUpdatedSince = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1)
  )
    .toISOString()
    .split("T")[0];
  const listingStatusFilter = "live";
  try {
    let params: any = {
      dateUpdatedSince,
      listingStatusFilter,
    };
    console.log(params);
    const response = await axios.get(
      `https://api.domain.com.au/v1/listings/${id}`,
      {
        headers: {
          accept: "application/json",
          "X-Api-Key": process.env.DOMAIN_API_KEY,
          "X-Api-Call-Source": "live-api-browser",
        },
        params: params,
      }
    );
    console.log(response.data);
    res.status(200).json({
      data: response.data,
      success: true,
    });
  } catch (error: any) {
    console.log(error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.message || "Error fetching agency listings",
    });
  }
}
