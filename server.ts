import dotenv from "dotenv";
import express from "express";
import path from "path";
import app from "./server/app.js";
import { connectDB, disconnectDB } from "./server/config/db.js";
import { createServer as createViteServer } from "vite";

// Load Environment Configuration
dotenv.config();

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = "0.0.0.0";

async function startServer() {
  console.log("[SYSTEM] Initializing Quiz Platform Backend...");

  // 1. Establish Database Connection
  await connectDB();

  // 2. Conditionally Mount Vite Client Core
  if (process.env.NODE_ENV !== "production") {
    console.log("[SYSTEM] Running in DEVELOPMENT mode. Mounting Vite middleware...");
    
    // Dynamic import to avoid compiling Vite production-side
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // Pass standard client routing & HMR down to Vite dev server
    app.use(vite.middlewares);
  } else {
    console.log("[SYSTEM] Running in PRODUCTION mode. Serving pre-compiled distribution assets...");
    
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files from compiled dist folder
    app.use(express.static(distPath));
    
    // Route any unhandled page request back to index.html for SPA route resolution
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 3. Bind Listener to port 3000
  const server = app.listen(PORT, HOST, () => {
    console.log(`[SYSTEM] Core active at http://${HOST}:${PORT}`);
  });

  // 4. Graceful Shutdown handlers for database connection security
  const shutdown = async (signal: string) => {
    console.log(`[SYSTEM] Received ${signal}. Starting graceful termination sequence...`);
    
    server.close(async () => {
      console.log("[SYSTEM] Express server stopped accepting new requests.");
      await disconnectDB();
      console.log("[SYSTEM] Shutdown completed safely. Exiting process.");
      process.exit(0);
    });

    // Enforce instant kill if graceful close hangs (10 seconds timeout)
    setTimeout(() => {
      console.error("[SYSTEM] Forced shutdown initiated due to timeout.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((error) => {
  console.error("[SYSTEM] Fatal Error during bootstrap sequence:", error);
  process.exit(1);
});
