import mongoose, { Document, Schema } from 'mongoose';

// Define interfaces for nested types
interface Agency {
  agencyId: number;
  agencyName: string;
  officeId: string;
  officeName: string;
  companyAddress: string;
}

interface Suburb {
  suburb: string;
  state: string;
  postcode: string;
}

// Main Agent interface
interface IAgent extends Document {
  // Unique Identifiers
  beleefId?: mongoose.Types.ObjectId;
  domainId?: number[];

  // Personal Information
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  secondaryEmail?: string;
  mobile?: string;
  phone?: string;
  birthDate?: Date;
  picture?: string;
  signature?: string;

  // Profile Information
  role: string;
  title?: string;
  profileText?: string;
  agentVideo?: string;
  story?: string;
  vision?: string;
  profileComplete: boolean;

  // Social Links
  facebookUrl?: string;
  twitterUrl?: string;
  linkedInUrl?: string;
  googlePlusUrl?: string;
  personalWebsiteUrl?: string;

  // Agency Information
  agencies: Agency[];

  // Licensing and Compliance
  license?: string;
  licenseNumber?: string;
  licenseExpiry?: Date;
  validLicence: boolean;
  conjunctionAgent?: string;
  ownCompany: boolean;
  company?: string;
  companyAddress?: string;
  // Financial Information
  abn?: string;
  gst?: string;
  stripeCustomerId?: string;
  paymentMethods: string[];

  // Service Areas
  suburbs: Suburb[];
  accessToken: string;
  refreshToken: string;
  googleId: string,
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const AgentSchema = new Schema<IAgent>(
  {
    // Unique Identifiers
    beleefId: { type: Schema.Types.ObjectId},
    domainId: [{ type: Number }],

    // Personal Information
    name: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String},
    secondaryEmail: { type: String },
    mobile: { type: String },
    phone: { type: String },
    birthDate: { type: Date },
    picture: { type: String },
    signature: { type: String },

    // Profile Information
    role: { type: String, default: 'user' },
    title: { type: String },
    profileText: { type: String },
    agentVideo: { type: String },
    story: { type: String },
    vision: { type: String },
    profileComplete: { type: Boolean, default: false },

    // Social Links
    facebookUrl: { type: String },
    twitterUrl: { type: String },
    linkedInUrl: { type: String },
    googlePlusUrl: { type: String },
    personalWebsiteUrl: { type: String },

    // Agency Information
    agencies: [{
      agencyId: { type: Number },
      agencyName: { type: String },
      officeId: { type: String },
      officeName: { type: String },
      companyAddress: { type: String },
    }],

    // Licensing and Compliance
    license: { type: String },
    licenseNumber: { type: String },
    licenseExpiry: { type: Date },
    validLicence: { type: Boolean, default: false },
    conjunctionAgent: { type: String },
    company: { type: String },
    companyAddress: { type: String },
    ownCompany: { type: Boolean, default: false },

    // Financial Information
    abn: { type: String },
    gst: { type: String },
    stripeCustomerId: { type: String },
    paymentMethods: [{ type: String }],

    // Service Areas
    suburbs: [{
      suburb: { type: String },
      state: { type: String },
      postcode: { type: String },
    }],
    accessToken: { type: String },
    refreshToken: { type: String },
    googleId: { type: String},
    // Metadata timestamps are handled by the timestamps option
  },
  
  { timestamps: true }
);

// Model definition with interface
const Agent = mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema);

export default Agent;