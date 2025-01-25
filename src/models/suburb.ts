import mongoose, { Schema, Document, Model } from 'mongoose';

// Define TypeScript interfaces for the schema
interface IHouseStats {
  year: number | null;
  medianSalePrice: number | null;
  annualSalesVolume: number | null;
  suburbGrowth: string | null;
  highDemandArea: string | null;
}

interface IUnitStats {
  year: number | null;
  medianSalePrice: number | null;
  annualSalesVolume: number | null;
  suburbGrowth: string | null;
  highDemandArea: string | null;
}

export interface ISuburb extends Document {
  suburb: string;
  description?: string;
  postcode: string;
  state?: string;
  houseStats: IHouseStats[];
  unitStats: IUnitStats[];
  houseSoldStats?: Record<string, unknown>;
  unitSoldStats?: Record<string, unknown>;
  listingsFetched: boolean;
  listingsFetchedAt?: Date | null;
  reaPrice?: string;
  domainPrice?: Array<Record<string, unknown>>;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the schema
const SuburbSchema: Schema = new Schema(
  {
    suburb: { type: String, unique: true, required: true },
    description: { type: String },
    postcode: { type: String, required: true },
    state: { type: String, required: false, default: 'NSW' },
    houseStats: {
      type: [
        {
          year: { type: Number, default: null },
          medianSalePrice: { type: Number, default: null },
          annualSalesVolume: { type: Number, default: null },
          suburbGrowth: { type: String, default: null },
          highDemandArea: { type: String, default: null },
        },
      ],
      default: [],
    },
    unitStats: {
      type: [
        {
          year: { type: Number, default: null },
          medianSalePrice: { type: Number, default: null },
          annualSalesVolume: { type: Number, default: null },
          suburbGrowth: { type: String, default: null },
          highDemandArea: { type: String, default: null },
        },
      ],
      default: [],
    },
    houseSoldStats: { type: Schema.Types.Mixed },
    unitSoldStats: { type: Schema.Types.Mixed },
    listingsFetched: { type: Boolean, default: false },
    listingsFetchedAt: { type: Date, default: null },
    reaPrice: { type: String },
    domainPrice: { type: [Schema.Types.Mixed] },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Define the model
const Suburb: Model<ISuburb> =
  mongoose.models?.Suburb || mongoose.model<ISuburb>('Suburb', SuburbSchema);

export default Suburb;
