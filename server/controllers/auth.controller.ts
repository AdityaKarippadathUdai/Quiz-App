import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { AppError } from "../middleware/errorMiddleware.js";

const COOKIE_NAME = "refreshToken";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

export class AuthController {
  /**
   * Register a new user account
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, avatar, themePreference } = req.body;

      const { user, tokens } = await AuthService.register({
        name,
        email,
        password,
        avatar,
        themePreference,
      });

      // Bind Refresh Token to secure, HttpOnly cookie
      res.cookie(COOKIE_NAME, tokens.refreshToken, COOKIE_OPTIONS);

      ResponseHandler.created(res, "Registration successful. Welcome aboard!", {
        user,
        accessToken: tokens.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Log in to an existing account
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const { user, tokens } = await AuthService.login(email, password);

      // Bind Refresh Token to secure, HttpOnly cookie
      res.cookie(COOKIE_NAME, tokens.refreshToken, COOKIE_OPTIONS);

      ResponseHandler.success(res, "Welcome back!", {
        user,
        accessToken: tokens.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Re-verify session and rotate session credentials
   */
  static async refreshSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.[COOKIE_NAME] || req.body.refreshToken;

      if (!refreshToken) {
        throw new AppError("No session key found. Please authenticate.", 401, "REFRESH_TOKEN_REQUIRED");
      }

      const { user, tokens } = await AuthService.refreshSession(refreshToken);

      // Refresh cookie lifespan
      res.cookie(COOKIE_NAME, tokens.refreshToken, COOKIE_OPTIONS);

      ResponseHandler.success(res, "Session rotated successfully.", {
        user,
        accessToken: tokens.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Log out of current session and destroy state keys
   */
  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Clear cookie immediately
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      ResponseHandler.success(res, "Logged out successfully. See you again soon!");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch details of currently authenticated profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Session context missing.", 401, "UNAUTHORIZED");
      }

      const user = await AuthService.getProfile(req.user.id);

      ResponseHandler.success(res, "Profile retrieved successfully.", { user });
    } catch (error) {
      next(error);
    }
  }
}
