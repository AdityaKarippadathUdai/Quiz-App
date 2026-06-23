import mongoose from "mongoose";

export let isMongoConnected = false;

export async function connectDB(): Promise<void> {
  const envKeys = Object.keys(process.env).filter(key => key.includes("MONGO") || key.includes("DB") || key.includes("URI"));
  console.log("[DATABASE] Available env keys related to DB:", envKeys);

  let mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoURI) {
    console.warn("[DATABASE] Warning: MONGODB_URI/MONGO_URI is not defined. Falling back to local 'mongodb://127.0.0.1:27017/quiz_platform'");
    mongoURI = "mongodb://127.0.0.1:27017/quiz_platform";
  }

  // Redact password in logs if present
  const sanitizedURI = mongoURI.replace(/:([^@:]+)@/, ":****@");
  console.log(`[DATABASE] Attempting to connect to: ${sanitizedURI}`);

  try {
    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of waiting forever
    });
    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host}`);
    isMongoConnected = true;
  } catch (error) {
    console.error(`[DATABASE] Connection failure: ${(error as Error).message}`);
    isMongoConnected = false;
    // Do not crash the process instantly in development to prevent container loop
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log("[DATABASE] MongoDB Disconnected gracefully");
  } catch (error) {
    console.error(`[DATABASE] Disconnection failure: ${(error as Error).message}`);
  }
}
