import mongoose, { Schema, Document, Model } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  mobile: string;
  picture: string;
  role: string;
  signature: string;
  conjunctionAgent: string;
  company: string;
  abn: string;
  title: string;
  officeId: string;
  officeName: string;
  googleId: string;
  ownCompany: boolean;
  profileComplete: boolean;
  birthDate: Date;
  license: string;
  licenseNumber: string;
  licenseExpiry: Date;
  validLicence: boolean;
  stripeCustomerId: string;
  paymentMethods: string[];
  gst: string;
  companyAddress: string;
  audioKey: string;
  story: string;
  vision: string;
  suburbs: any[];
  accessToken: string;
  refreshToken: string;
}

const userSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    picture: { type: String },
    role: { type: String, default: 'user' },
    signature: { type: String },
    conjunctionAgent: { type: String },
    company: { type: String },
    abn: { type: String },
    title: { type: String },
    officeId: { type: String },
    officeName: { type: String },
    googleId: { type: String, required: true, unique: true },
    ownCompany: { type: Boolean, default: false },
    profileComplete: { type: Boolean, default: false },
    birthDate: { type: Date },
    license: { type: String },
    licenseNumber: { type: String },
    licenseExpiry: { type: Date },
    validLicence: { type: Boolean, default: false },
    stripeCustomerId: { type: String },
    paymentMethods: [{ type: String }],
    gst: { type: String },
    companyAddress: { type: String },
    audioKey: { type: String },
    story: { type: String },
    vision: { type: String },
    suburbs: [{ type: Schema.Types.Mixed }],
    accessToken: { type: String },
    refreshToken: { type: String },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
