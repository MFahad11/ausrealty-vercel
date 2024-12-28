import filterProperties from '@/utils/filterations/buy-page-filter';
import { handleBuyingChat } from '@/utils/openai';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, 
  res: NextApiResponse) {
  const {extractedInfo} = req.body;

  try {
    
    const idsArray=[26715,35860,38331,38511];
    let combinedResponse = await Promise.all(idsArray.map(async (id) => {
        const response = await axios.get(`https://api.domain.com.au/v1/agencies/${id}/listings?listingStatusFilter=live&pageSize=500`, {
            headers: {
                accept: "application/json",
                "X-Api-Key": process.env.DOMAIN_API_KEY,
                "X-Api-Call-Source": "live-api-browser",
            },
        });
        return response.data;
    }));
    
    combinedResponse = combinedResponse.flat().filter((property:any) => {
        if (extractedInfo.objective && property.objective !== extractedInfo.objective) {
            return false;
        }
        if (extractedInfo.saleMode && property.saleMode !== extractedInfo.saleMode) {
            return false;
        }
        return true;
    });
    res.status(200).json({
        data:combinedResponse || [],
        success: true,
    });
    
  } catch (error:any) {
    res.status(error.response?.status || 500).json({
        success: false,
        message: error.message || 'Error fetching agency listings',
    }
    );
  }
}
