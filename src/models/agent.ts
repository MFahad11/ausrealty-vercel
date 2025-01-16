import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the TypeScript interface for the Agent document
interface IAgent extends Document {
  agencyId: number;
  agentId: number;
  email: string;
  firstName: string;
  lastName: string;
  mobile: string;
  phone?: string;
  photo?: string;
  secondaryEmail?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  agentVideo?: string;
  profileText?: string;
  googlePlusUrl?: string;
  personalWebsiteUrl?: string;
  linkedInUrl?: string;
  mugShotURL?: string;
  contactTypeCode: number;
  profileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for the Agent model
const agentSchema: Schema = new Schema(
  {
    agencyId: { type: Number, required: true },
    agentId: { type: Number, required: true, unique: true },
    email: { type: String, required: true, match: /.+\@.+\..+/ },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    mobile: { type: String, required: true },
    phone: { type: String, default: '' },
    photo: { type: String, default: '' },
    secondaryEmail: { type: String, default: '' },
    facebookUrl: { type: String, default: '' },
    twitterUrl: { type: String, default: '' },
    agentVideo: { type: String, default: '' },
    profileText: { type: String, default: '' },
    googlePlusUrl: { type: String, default: '' },
    personalWebsiteUrl: { type: String, default: '' },
    linkedInUrl: { type: String, default: '' },
    mugShotURL: { type: String, default: '' },
    contactTypeCode: { type: Number, required: true },
    profileUrl: { type: String, required: true },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create the Agent model
const Agent: Model<IAgent> = mongoose.models.Agent || mongoose.model<IAgent>('Agent', agentSchema);

export default Agent;
