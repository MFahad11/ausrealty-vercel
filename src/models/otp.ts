import mongoose, { Document, Schema } from "mongoose";

// Define the OTP document interface
export interface IOTP extends Document {
  email: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}

// Create the OTP schema
const OTPSchema = new Schema<IOTP>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
    length: 6, // Ensures OTP is always 6 digits
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// Automatically delete expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Export the model
const OTP = mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);
export default OTP;
