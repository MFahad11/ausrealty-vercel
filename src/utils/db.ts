import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "";
const MONGO_URI_BELEEF = process.env.MONGO_URI_BELEEF || "";
// Global cache for the connection
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

const dbConnect = async () => {
  
  if (cached.conn) {
    return cached.conn; // Return existing connection
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI)
      .then((mongoose) => mongoose);

    cached.promise = mongoose.connect(MONGO_URI); // Save promise
  }
  cached.conn = await cached.promise; // Await and cache the connection
  return cached.conn;
};

const dbConnectBeleef = async () => {
  if (cached.conn) {
    return cached.conn; // Return existing connection
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI_BELEEF)
      .then((mongoose) => mongoose);

    cached.promise = mongoose.connect(MONGO_URI_BELEEF); // Save promise
  }
  cached.conn = await cached.promise; // Await and cache the connection
  return cached.conn;
};
export default dbConnectBeleef;
