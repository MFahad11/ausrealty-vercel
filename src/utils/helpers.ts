import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import axiosInstance from "./axios-instance";
import axios from "axios";
import Suburb from "@/models/suburb";
export const getSupportedMimeType = () => {
    const types = ['audio/mp4', 'audio/webm', 'audio/ogg'];
    return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
};
export const convertBlobToBase64 = (blob: Blob) => {
    // @ts-ignore
  
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
    // @ts-ignore
  
          const base64Data = reader.result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs))
    }
    
    
    export async function getSuburbMedianPrice(
      suburb: string,
      postcode: string,
      propertyCategory: string,
      bedrooms: number | null | undefined
    ) {
      // Determine property type based on propertyCategory
      const propertyType =
        propertyCategory === "ApartmentUnitFlat" ||
        propertyCategory === "Apartment" ||
        propertyCategory === "Flat" ||
        propertyCategory === "Unit" ||
        propertyCategory === "unit"
          ? "unit"
          : "house";
    
      try {
        const constructSourceText = (bedrooms:
          | number
          | null
          | undefined
        ) => {
          if (!bedrooms) return "Area median price";
          return bedrooms > 5
            ? "5-bedroom median price"
            : `${bedrooms}-bedroom median price`;
        };
    
        // Define headers for the API request
        const headers = {
          accept: "application/json",
          "X-Api-Key": process.env.DOMAIN_API_KEY,
          "X-Api-Call-Source": "live-api-browser",
        };
    
        // Construct the initial URL
        const url = `https://api.domain.com.au/v2/suburbPerformanceStatistics/NSW/${encodeURIComponent(
          suburb
        )}/${postcode}?propertyCategory=${propertyType || "house"}&${
          bedrooms ? `bedrooms=${bedrooms > 5 ? 5 : bedrooms}&` : ""
        }periodSize=years&startingPeriodRelativeToCurrent=1&totalPeriods=1`;
    
        // Fetch the data with the constructed URL
        let response = await axios.get(url, { headers });
    
        // Extract median price
        let medianPrice =
          response.data?.series?.seriesInfo?.[0]?.values?.medianSoldPrice || 0;
    
        // Fallback to general area median price if no price found for bedrooms
        if (medianPrice === 0 && bedrooms) {
          const fallbackUrl = `https://api.domain.com.au/v2/suburbPerformanceStatistics/NSW/${encodeURIComponent(
            suburb
          )}/${postcode}?propertyCategory=${
            propertyType || "house"
          }&periodSize=years&startingPeriodRelativeToCurrent=1&totalPeriods=1`;
    
          response = await axios.get(fallbackUrl, { headers });
          medianPrice =
            response.data?.series?.seriesInfo?.[0]?.values?.medianSoldPrice || 0;
    
          bedrooms = null; // Update source to indicate area median price
        }
    
        // Return the median price along with the source text
        return {
          medianPrice,
          medianPriceSource: constructSourceText(bedrooms),
        };
      } catch (error:any) {
        // Log error details for debugging
        console.error(
          "Error fetching suburb performance statistics:",
          error.message
        );
    
        // Re-throw the error for the caller to handle
        throw new Error("Failed to fetch suburb performance statistics.");
      }
    }
    export async function getMapStaticImage(lat: number, lon: number){
      const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=19&size=600x600&maptype=satellite&markers=color:red%7Clabel:C%7C${lat},${lon}&key=${process.env.NEXT_PUBLIC_MAPS_KEY}`;
    
      try {
        const response = await axios.get(mapUrl, { responseType: "arraybuffer" });
        // const imagePath = `map_image_${lat}_${lon}.png`;
        // fs.writeFileSync(imagePath, response.data);
        const base64Image = response.data.toString("base64");
        const encodedImage = `data:image/jpeg;base64,${base64Image}`;
    
        return encodedImage; // Return the encoded image
      } catch (error) {
        console.error("Error fetching map image:", error);
        throw error;
      }
    }
    export async function areaDynamics(suburb:string) {
      try {
        // Find the suburb document
        const suburbData = await Suburb.findOne({
          suburb: { $regex: new RegExp(suburb, "i") },
        });
    
        if (!suburbData) {
          // Return default values instead of throwing an error
          return {
            houseStats: null,
            unitStats: null,
            description: null,
          };
        }
    
        // Get the maximum year from both houseStats and unitStats
        const houseYears = suburbData.houseStats.map((stat) => stat.year);
        const unitYears = suburbData.unitStats.map((stat) => stat.year);
        // @ts-ignore
        const maxHouseYear = houseYears.length > 0 ? Math.max(...houseYears) : null;
        // @ts-ignore
        const maxUnitYear = unitYears.length > 0 ? Math.max(...unitYears) : null;
    
        // Filter the houseStats and unitStats for the max year
        const houseStats = suburbData.houseStats.find(
          (stat) => stat.year === maxHouseYear
        );
        const unitStats = suburbData.unitStats.find(
          (stat) => stat.year === maxUnitYear
        );
    
        // Return the stats for the maximum year
        return {
          houseStats,
          unitStats,
          description: suburbData?.description,
          houseSoldStats: suburbData?.houseSoldStats,
          unitSoldStats: suburbData?.unitSoldStats,
        };
      } catch (error:any) {
        console.error("Error fetching area dynamics data: ", error.message);
        throw error; // Rethrow the error to be handled by the caller
      }
    }

 export const extractStreetAddress = (fullAddress: string): string => {
      return fullAddress
        .replace(/[,]/g, "") // Remove commas from input address
        .toLowerCase() // Convert to lowercase
        .split(" ") // Split by spaces
        .filter(
          (w) =>
            w &&
            !["nsw", "act", "vic", "qld", "tas", "sa", "wa", "nt"].includes(
              w.toLowerCase()
            ) // Ignore state abbreviations
        )
        .slice(0, 4) // Extract up to the fifth word (adjust as needed)
        .join(" ");
    };
    
    // Utility function to escape regex characters
    export const escapeRegex = (string: string): string => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

export const createOTP = async (email: string): Promise<string> => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
  return otp;
};
