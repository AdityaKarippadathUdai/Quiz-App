import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error("[DATABASE] Error: MONGODB_URI environment variable is not defined in .env");
    // In developer environment, we can optionally gracefully proceed or fail
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true,
    });
    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DATABASE] Connection failure: ${(error as Error).message}`);
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
