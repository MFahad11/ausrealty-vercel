import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import OTP from "@/models/otp";
import dbConnect from "@/components/lib/db";
import { sendEmail } from "@/utils/email";



const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Connect to MongoDB
    await dbConnect();

    // Generate OTP and expiry
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

    // Store OTP in the database
    await OTP.create({ email, otp, expiresAt });

    // Send the OTP via email
    await sendEmail({ to:email, subject: "Your OTP Code",text: `Your OTP code is ${otp}. It will expire in 2 minutes.` });

    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
