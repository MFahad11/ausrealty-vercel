import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import OTP from "@/models/otp"; // Adjust the path based on your project structure
import dbConnect from "@/components/lib/db";



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    // Connect to MongoDB
    await dbConnect();

    // Find the OTP record for the given email
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Check if the OTP has expired
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    // OTP is valid; you can add additional logic here if needed (e.g., marking the user as verified)

    // Optionally, delete the OTP record after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
