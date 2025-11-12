import { Router } from "express";
import {
  signup,
  login,
  setupTwoFactor,
  verifyTwoFactor,
  loginWithTwoFactor,
  disableTwoFactor,
  refreshToken,
  getCurrentUser,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/login/2fa", loginWithTwoFactor);
router.post("/refresh", refreshToken);

// Protected routes
router.get("/me", authenticate, getCurrentUser);
router.post("/2fa/setup", authenticate, setupTwoFactor);
router.post("/2fa/verify", authenticate, verifyTwoFactor);
router.post("/2fa/disable", authenticate, disableTwoFactor);

export default router;
