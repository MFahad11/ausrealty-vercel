import mongoose, { Schema, Document, Model } from 'mongoose';

// Define interfaces for the sub-documents
interface IVendorDetails {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  mobile: string | null;
}

interface IMedia {
  category: string;
  type: string;
  url: string;
}

interface IBox {
  name: 'bookAppraisal' | 'priceProcess' | 'postList' | 'authoriseSchedule' | 'prepareMarketing' | 'goLive' | 'onMarket';
  status: 'complete' | 'unlock' | 'lock';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserProperty extends Document {
  // userId: mongoose.Types.ObjectId;
  propertyId: string | null;
  listingId: string;
  address: string;
  listingType: 'Sale' | 'Sold';
  price: number | null;
  medianPrice: number | null;
  medianPriceSource: string | null;
  domainPrice: Record<string, unknown>;
  postcode: string;
  suburb: string;
  latitude: number;
  longitude: number;
  propertyType: string;
  media: IMedia[] | null;
  bedrooms: number | null;
  bathrooms: number | null;
  carspaces: number | null;
  landArea: number | null;
  buildingArea: number | null;
  buildType: '1 storey' | '2 storey' | '3 storey' | '4+ storey' | null;
  yearBuilt: number | null;
  wallMaterial: 'Brick' | 'Double brick' | 'Clad' | 'Fibro' | 'Hebel' | null;
  features: string[] | null;
  pool: 'Yes' | 'No' | null;
  tennisCourt: 'Yes' | 'No' | null;
  waterViews: 'No' | 'Water views' | 'Deep waterfront with jetty' | 'Tidal waterfront with jetty' | 'Waterfront reserve' | null;
  dateListed: Date | null;
  daysListed: number | null;
  vendorDetails: IVendorDetails[];
  followers: Record<string, unknown>[];
  fiveStepProcess: Record<string, unknown>[];
  conclusion: {
    gptResponse: string | null;
    key: string | null;
    url: string | null;
  };
  reserveMeetingReport: {
    gptResponse: string | null;
    key: string | null;
    url: string | null;
  };
  customTable: {
    columns: { headerName: string }[];
    rows: {
      data: Map<string, string>;
      isMarked: boolean;
      position: number;
    }[];
  };
  salesTable: {
    property: string | null;
    specifics: string | null;
    sold: string | null;
    features: string | null;
    price: string | null;
  }[];
  isSalesTableUpdated: boolean;
  finishes: 'High-end finishes' | 'Updated' | 'Original' | null;
  streetTraffic: 'Low traffic' | 'Moderate traffic' | 'High traffic' | null;
  topography: ('High side' | 'Low side' | 'Level block' | 'Irregular block' | 'Unusable land')[] | null;
  additionalInformation: string | null;
  saleProcess: string | null;
  frontage: number | null;
  configurationPlan: string | null;
  grannyFlat: 'Yes' | 'No' | null;
  developmentPotential: 'Childcare' | 'Duplex site' | 'Townhouse site' | 'Unit site' | null;
  history: Record<string, unknown> | null;
  isNewDevelopment: boolean | null;
  canonicalUrl: string | null;
  channel: 'residential' | 'commercial' | 'business' | null;
  listingStatus: string | null;
  logicalPrice: string | null;
  logicalReasoning: string | null;
  engagedPurchaser: string | null;
  microPockets: string | null;
  recommendedSales: Record<string, unknown>[] | null;
  recommendedSold: Record<string, unknown>[] | null;
  recentAreaSoldProcess: Record<string, unknown>[] | null;
  duplexProperties: Record<string, unknown>[] | null;
  recommendedSaleProcess: string | null;
  highEndProperties: Record<string, unknown>[] | null;
  lowEndProperties: Record<string, unknown>[] | null;
  boxStatus: IBox[] | null;
  processChain: Record<string, unknown>[] | null;
  onMarketProcessChain: Record<string, unknown>[] | null;
  postListAnswers: Record<string, unknown>[] | null;
  isPostListAnswersStale: boolean;
  priceProcessAudio: string | null;
  priceProcessSummary: string | null;
  authorityTranscript: string | null;
  authorityAudio: string | null;
  priceProcessTranscript: string | null;
  marketing: Record<string, unknown> | null;
  autoFillAI: boolean | null;
  internalSize: number | null;
  constructionCosts: string | null;
  profitMargin: number | null;
  isCleaned: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
}

// Define the schema
const UserPropertySchema: Schema = new Schema(
  {
    // userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    propertyId: { type: String, default: null },
    listingId: { type: String },
    address: { type: String, required: true, unique: true },
    listingType: { type: String, enum: ['Sale', 'Sold'], required: true },
    price: { type: Number, default: null },
    medianPrice: { type: Number, default: null },
    medianPriceSource: { type: String },
    domainPrice: { type: Schema.Types.Mixed },
    postcode: { type: String },
    suburb: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    propertyType: { type: String },
    media: { type: [Schema.Types.Mixed], default: null },
    bedrooms: { type: Number, default: null },
    bathrooms: { type: Number, default: null },
    carspaces: { type: Number, default: null },
    landArea: { type: Number, default: null },
    buildingArea: { type: Number, default: null },
    buildType: { type: String, enum: ['1 storey', '2 storey', '3 storey', '4+ storey'], default: null },
    yearBuilt: { type: Number, default: null },
    wallMaterial: { type: String, enum: ['Brick', 'Double brick', 'Clad', 'Fibro', 'Hebel'], default: null },
    features: [{ type: String, default: null }],
    pool: { type: String, enum: ['Yes', 'No'], default: null },
    tennisCourt: { type: String, enum: ['Yes', 'No'], default: null },
    waterViews: {
      type: String,
      enum: ['No', 'Water views', 'Deep waterfront with jetty', 'Tidal waterfront with jetty', 'Waterfront reserve'],
      default: null,
    },
    dateListed: { type: Date, default: null },
    daysListed: { type: Number, default: null },
    vendorDetails: [Schema.Types.Mixed],
    followers: { type: [Schema.Types.Mixed] },
    fiveStepProcess: { type: [Schema.Types.Mixed] },
    conclusion: { gptResponse: { type: String, default: null }, key: { type: String, default: null }, url: { type: String, default: null } },
    reserveMeetingReport: { gptResponse: { type: String, default: null }, key: { type: String, default: null }, url: { type: String, default: null } },
    customTable: {
      columns: [{ headerName: { type: String, required: true } }],
      rows: [{ data: { type: Map, of: String }, isMarked: { type: Boolean, default: false }, position: { type: Number, required: true } }],
    },
    salesTable: [{ property: { type: String, default: null }, specifics: { type: String, default: null }, sold: { type: String, default: null }, features: { type: String, default: null }, price: { type: String, default: null } }],
    isSalesTableUpdated: { type: Boolean, default: true },
    finishes: { type: String, enum: ['High-end finishes', 'Updated', 'Original'], default: null },
    streetTraffic: { type: String, enum: ['Low traffic', 'Moderate traffic', 'High traffic'], default: null },
    topography: { type: [String], enum: ['High side', 'Low side', 'Level block', 'Irregular block', 'Unusable land'], default: null },
    additionalInformation: { type: String, default: null },
    saleProcess: { type: String, default: null },
    frontage: { type: Number, default: null },
    configurationPlan: { type: String, default: null },
    grannyFlat: { type: String, enum: ['Yes', 'No'], default: null },
    developmentPotential: { type: String, enum: ['Childcare', 'Duplex site', 'Townhouse site', 'Unit site'], default: null },
    history: { type: Schema.Types.Mixed, default: null },
    isNewDevelopment: { type: Boolean, default: null },
    canonicalUrl: { type: String, default: null },
    channel: { type: String, enum: ['residential', 'commercial', 'business'], default: null },
    listingStatus: { type: String, default: null },
    logicalPrice: { type: String, default: null },
    logicalReasoning: { type: String, default: null },
    engagedPurchaser: { type: String, default: null },
    microPockets: { type: String, default: null },
    recommendedSales: { type: [Schema.Types.Mixed], default: null },
    recommendedSold: { type: [Schema.Types.Mixed], default: null },
    recentAreaSoldProcess: { type: [Schema.Types.Mixed], default: null },
    duplexProperties: { type: [Schema.Types.Mixed], default: null },
    recommendedSaleProcess: { type: String, default: null },
    highEndProperties: { type: [Schema.Types.Mixed], default: null },
    lowEndProperties: { type: [Schema.Types.Mixed], default: null },
    boxStatus: { type: [Schema.Types.Mixed], default: null },
    processChain: { type: [Schema.Types.Mixed], default: null },
    onMarketProcessChain: { type: [Schema.Types.Mixed], default: null },
    postListAnswers: { type: [Schema.Types.Mixed] },
    isPostListAnswersStale: { type: Boolean, default: false },
    priceProcessAudio: { type: String, default: null },
    priceProcessSummary: { type: String, default: null },
    authorityTranscript: { type: String, default: null },
    authorityAudio: { type: String, default: null },
    priceProcessTranscript: { type: String, default: null },
    marketing: { type: Schema.Types.Mixed, default: null },
    autoFillAI: { type: Boolean, default: null },
    internalSize: { type: Number, default: null },
    constructionCosts: { type: String, default: null },
    profitMargin: { type: Number, default: null },
    isCleaned: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const UserProperty: Model<IUserProperty> =
  mongoose.models.UserProperty || mongoose.model('UserProperty', UserPropertySchema);

export default UserProperty;
