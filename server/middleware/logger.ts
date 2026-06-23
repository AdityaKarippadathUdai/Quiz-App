import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  // Listen to response finish event to capture final status code
  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    // Use neat color styling symbols for server terminal logs
    let statusColor = "\x1b[32m"; // Green
    if (statusCode >= 500) {
      statusColor = "\x1b[31m"; // Red
    } else if (statusCode >= 400) {
      statusColor = "\x1b[33m"; // Yellow
    } else if (statusCode >= 300) {
      statusColor = "\x1b[36m"; // Cyan
    }

    const resetColor = "\x1b[0m";

    console.log(
      `[HTTP] ${method} ${originalUrl} - ${statusColor}${statusCode}${resetColor} - ${duration}ms - IP: ${ip}`
    );
  });

  next();
}
