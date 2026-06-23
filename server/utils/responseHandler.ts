import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
  error?: {
    code: string;
    details?: any;
  };
  timestamp: string;
}

export class ResponseHandler {
  /**
   * Send a successful JSON response
   */
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode = 200,
    meta?: ApiResponse["meta"]
  ): Response<ApiResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send an error JSON response
   */
  static error(
    res: Response,
    message: string,
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
    details?: any
  ): Response<ApiResponse<null>> {
    return res.status(statusCode).json({
      success: false,
      message,
      error: {
        code,
        details,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 201 Created Response
   */
  static created<T>(res: Response, message: string, data?: T): Response<ApiResponse<T>> {
    return this.success(res, message, data, 201);
  }

  /**
   * 400 Bad Request Response
   */
  static badRequest(res: Response, message: string, code = "BAD_REQUEST", details?: any): Response<ApiResponse<null>> {
    return this.error(res, message, 400, code, details);
  }

  /**
   * 401 Unauthorized Response
   */
  static unauthorized(res: Response, message: string = "Unauthorized access", code = "UNAUTHORIZED"): Response<ApiResponse<null>> {
    return this.error(res, message, 401, code);
  }

  /**
   * 403 Forbidden Response
   */
  static forbidden(res: Response, message: string = "Access forbidden", code = "FORBIDDEN"): Response<ApiResponse<null>> {
    return this.error(res, message, 403, code);
  }

  /**
   * 404 Not Found Response
   */
  static notFound(res: Response, message: string = "Resource not found", code = "NOT_FOUND"): Response<ApiResponse<null>> {
    return this.error(res, message, 404, code);
  }
}
