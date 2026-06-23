import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../utils/responseHandler.js";

/**
 * Custom operational error class
 */
export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details: any;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, errorCode = "INTERNAL_SERVER_ERROR", details: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized express error-handling middleware
 */
export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected error occurred on our server.";
  let errorCode = err.errorCode || "INTERNAL_SERVER_ERROR";
  let details = err.details || null;

  // 1. Handle Zod validation errors
  if (err.name === "ZodError" || (err.issues && Array.isArray(err.issues))) {
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    message = "Request validation failed";
    details = err.issues ? err.issues.map((issue: any) => ({
      field: issue.path.join("."),
      message: issue.message,
    })) : err;
  }

  // 2. Handle Mongoose cast errors (invalid ObjectId)
  else if (err.name === "CastError") {
    statusCode = 400;
    errorCode = "INVALID_ID";
    message = `Invalid value for path: ${err.path}`;
    details = { path: err.path, value: err.value };
  }

  // 3. Handle Mongoose validation errors
  else if (err.name === "ValidationError") {
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    message = "Database validation failed";
    details = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
  }

  // 4. Handle Mongoose duplicate key error (MongoServerError)
  else if (err.code === 11000) {
    statusCode = 409;
    errorCode = "DUPLICATE_KEY_ERROR";
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `A record with this ${field} already exists.`;
    details = err.keyValue;
  }

  // 5. Handle JsonWebToken errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    errorCode = "INVALID_TOKEN";
    message = "Invalid authentication token. Please log in again.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    errorCode = "TOKEN_EXPIRED";
    message = "Your authentication token has expired. Please refresh your session.";
  }

  // Log non-operational errors (critical crashes or unhandled bugs)
  if (process.env.NODE_ENV === "development" || !err.isOperational) {
    console.error(`[ERROR] [${req.method}] ${req.originalUrl} - Stack:`, err.stack || err);
  }

  // Format error payload and send response
  ResponseHandler.error(
    res,
    message,
    statusCode,
    errorCode,
    process.env.NODE_ENV === "development" ? { details, stack: err.stack } : details
  );
}
