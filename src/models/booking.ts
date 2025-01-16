import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the TypeScript interface for the Booking document
interface IBooking extends Document {
  agentIds: number[]; // Array of agent IDs
  userEmail: string; // Email of the user
  date: Date; // Date of the booking
  startTime: string; // Start time in HH:mm format
  endTime: string; // End time in HH:mm format
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for the Booking model
const bookingSchema: Schema = new Schema(
  {
    agentIds: { type: [Number], required: true }, // Array of agent IDs
    userEmail: { type: String, required: true, match: /.+\@.+\..+/ }, // Email validation
    date: { type: Date, required: true }, // Booking date
    startTime: { type: String, required: true }, // Start time
    endTime: { type: String, required: true }, // End time
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create the Booking model
const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
