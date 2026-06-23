import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";

export const authRouter = Router();

// Public Authentication endpoints
authRouter.post("/register", validate({ body: registerSchema }), AuthController.register);
authRouter.post("/login", validate({ body: loginSchema }), AuthController.login);
authRouter.post("/refresh", AuthController.refreshSession);
authRouter.post("/logout", AuthController.logout);

// Protected User endpoints
authRouter.get("/profile", authenticate, AuthController.getProfile);
