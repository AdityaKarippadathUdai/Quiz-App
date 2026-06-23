import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository.js";
import { IUser, UserRole } from "../models/User.js";
import { AppError } from "../middleware/errorMiddleware.js";

export interface TokenPayload {
  id: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || "super_secret_fallback_key_for_development";
  private static JWT_EXPIRATION = process.env.JWT_EXPIRATION || "15m";
  private static JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "super_refresh_secret_fallback_key";
  private static JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || "7d";

  /**
   * Register a new user
   */
  static async register(userData: Partial<IUser>): Promise<{ user: IUser; tokens: AuthTokens }> {
    const existingUser = await UserRepository.findByEmail(userData.email || "");
    if (existingUser) {
      throw new AppError("Email is already registered. Please login.", 400, "EMAIL_EXISTS");
    }

    const newUser = await UserRepository.create(userData);
    
    // Hide password from returned response
    const sanitizedUser = newUser.toObject() as IUser;
    delete sanitizedUser.password;

    const tokens = this.generateTokens({ id: newUser.id, role: newUser.role });

    return { user: newUser, tokens };
  }

  /**
   * Authenticate a user via email and password
   */
  static async login(email: string, password: string): Promise<{ user: IUser; tokens: AuthTokens }> {
    const user = await UserRepository.findByEmail(email, true);
    if (!user) {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    if (user.isBlocked) {
      throw new AppError("Your account has been suspended. Please contact support.", 403, "ACCOUNT_SUSPENDED");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    // Hide password
    const sanitizedUser = user.toObject() as IUser;
    delete sanitizedUser.password;

    const tokens = this.generateTokens({ id: user.id, role: user.role });

    return { user, tokens };
  }

  /**
   * Re-verify refresh token and generate a fresh access/refresh token pair
   */
  static async refreshSession(refreshToken: string): Promise<{ user: IUser; tokens: AuthTokens }> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as { id: string };
      
      const user = await UserRepository.findById(decoded.id);
      if (!user) {
        throw new AppError("User session not found or deleted.", 401, "USER_NOT_FOUND");
      }

      if (user.isBlocked) {
        throw new AppError("Your account has been suspended.", 403, "ACCOUNT_SUSPENDED");
      }

      const tokens = this.generateTokens({ id: user.id, role: user.role });
      return { user, tokens };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError("Session expired or invalid. Please login again.", 401, "INVALID_REFRESH_TOKEN");
    }
  }

  /**
   * Retrieve full profile details for an existing user
   */
  static async getProfile(userId: string): Promise<IUser> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError("User profile not found.", 404, "USER_NOT_FOUND");
    }
    return user;
  }

  /**
   * Helper to sign access and refresh tokens
   */
  static generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRATION,
    });

    const refreshToken = jwt.sign({ id: payload.id }, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRATION,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Verification helper for Access Tokens
   */
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch (error: any) {
      throw new AppError("Session signature invalid or expired.", 401, "INVALID_ACCESS_TOKEN");
    }
  }
}
