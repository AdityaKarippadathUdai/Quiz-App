import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorMiddleware.js";

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitRegistry = new Map<string, RateLimitRecord>();

/**
 * Custom in-memory Sliding Window Rate Limiter Middleware
 * 
 * @param windowMs Time window in milliseconds (default: 1 minute)
 * @param maxRequests Maximum number of allowed requests in the time window
 */
export function rateLimiter(windowMs = 60000, maxRequests = 100) {
  // Clean up stale IP records periodically to prevent memory leaks (every 5 minutes)
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitRegistry.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        rateLimitRegistry.delete(ip);
      }
    }
  }, 300000).unref(); // .unref() lets Node.js exit if this is the only active handle

  return (req: Request, res: Response, next: NextFunction): void => {
    // Rely on trust proxy configurations or standard socket IP
    const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "anonymous";
    const now = Date.now();

    let record = rateLimitRegistry.get(clientIp);

    if (!record) {
      record = { timestamps: [] };
      rateLimitRegistry.set(clientIp, record);
    }

    // Filter out timestamps that fall outside the sliding window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    // Set rate limit response headers
    const remaining = Math.max(0, maxRequests - record.timestamps.length);
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", new Date(now + windowMs).toISOString());

    if (record.timestamps.length >= maxRequests) {
      next(new AppError("Too many requests from this IP. Please try again later.", 429, "RATE_LIMIT_EXCEEDED"));
      return;
    }

    // Register the current request timestamp
    record.timestamps.push(now);
    next();
  };
}
