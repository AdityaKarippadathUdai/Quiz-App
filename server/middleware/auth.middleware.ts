import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { UserRepository } from "../repositories/user.repository.js";
import { UserRole } from "../models/User.js";
import { AppError } from "./errorMiddleware.js";

// Extend the Express Request interface globally inside this module
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}

/**
 * Authentication Guard - Restricts routes to authenticated sessions with valid Bearer Tokens
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let token = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      next(new AppError("Access denied. No session token provided.", 401, "UNAUTHORIZED_NO_TOKEN"));
      return;
    }

    // Verify token validity
    const payload = AuthService.verifyAccessToken(token);

    // Verify if the user still exists and is not blocked
    const user = await UserRepository.findById(payload.id);
    if (!user) {
      next(new AppError("The owner of this authentication token no longer exists.", 401, "USER_DELETED"));
      return;
    }

    if (user.isBlocked) {
      next(new AppError("This account has been suspended.", 403, "ACCOUNT_SUSPENDED"));
      return;
    }

    // Bind authenticated payload back to request session context
    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Authorization Guard - Restricts route access to specified user roles (e.g. Admin actions)
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentication required to verify permissions.", 401, "UNAUTHORIZED"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError("You do not have permission to execute this action.", 403, "FORBIDDEN_INSUFFICIENT_ROLE"));
      return;
    }

    next();
  };
}
