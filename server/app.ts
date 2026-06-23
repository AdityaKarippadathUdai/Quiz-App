import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { requestLogger } from "./middleware/logger.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { errorMiddleware, AppError } from "./middleware/errorMiddleware.js";
import { apiRouter } from "./routes/index.js";

const app: Express = express();

// 1. Core Security Middlewares
if (process.env.NODE_ENV === "production") {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      frameguard: false,
    })
  );
}

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

// 2. Request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// 3. Logger & Rate Limiting (apply globally to API routes)
app.use(requestLogger);

app.use("/api", rateLimiter(60000, 150)); // Allow up to 150 requests per minute per IP

// 4. API Routes with clean V1 versioning
app.use("/api/v1", apiRouter);

// 5. Catch-all for API 404s
app.use("/api/*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`The requested endpoint [${req.method}] ${req.originalUrl} does not exist on this server.`, 404, "ROUTE_NOT_FOUND"));
});

// 6. Centralized Error Interceptor
app.use(errorMiddleware);

export default app;
