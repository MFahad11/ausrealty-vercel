import mongoose, { Document, Schema } from 'mongoose';
// name: { type: String, required: true },
//       percentage: { type: String, required: true },
interface ILogicalPrice extends Document {
    name: string;
    percentage: string;
}
const LogicalPriceSchema = new Schema({
    name: { type: String, required: true },
    percentage: { type: String, required: true },
});

const LogicalPrice = mongoose.models.LogicalPrice || mongoose.model<ILogicalPrice>('LogicalPrice', LogicalPriceSchema);

export default LogicalPrice