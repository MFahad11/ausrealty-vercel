import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, 
  res: NextApiResponse) {
  const { id, pageNumber = 1, pageSize = 50, 
    dateUpdatedSince= new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],listingStatusFilter = 'live' } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Agency ID is required' });
  }

  try {
    const idsArray=[26715,35860,38331,38511];
    const combinedResponse = await Promise.all(idsArray.map(async (id) => {
        const response = await axios.get(`https://api.domain.com.au/v1/agencies/${id}/listings`, {
            headers: {
                Authorization: `Bearer ${process.env.DOMAIN_API_KEY}`,
            },
            params: {
                pageNumber,
                pageSize,
                dateUpdatedSince,
                listingStatusFilter,
            },
        });
        return response.data;
    }));
    console.log(combinedResponse);
    res.status(200).json({
        data:combinedResponse,
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
