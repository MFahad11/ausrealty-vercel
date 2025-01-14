import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the TypeScript interface for the Prompt document
interface IPrompt extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for the Prompt model
const promptSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create the Prompt model
const Prompt: Model<IPrompt> = mongoose.models.Prompt || mongoose.model<IPrompt>('Prompt', promptSchema);

export default Prompt;
