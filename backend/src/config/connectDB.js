import mongoose from "mongoose";

async function connectDB() {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      `[DATABASE LOCKED] MongoDB Connected: ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.error(`[FATAL BUG] Database connection failed:`, error);
    process.exit(1);
  }
}

export default connectDB;
