import express from "express";
import {
  signup, login, logout, updateProfile,
  verifyEmail, resendVerification,
  forgotPassword, resetPassword,
} from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection); // rate limiting + bot protection for everything below

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Email verification
router.post("/verify-email", verifyEmail);                              // public — token IS the auth
router.post("/resend-verification", protectRoute, resendVerification);  // logged in

// Password reset
router.post("/forgot-password", forgotPassword);  // public
router.post("/reset-password", resetPassword);    // public — token IS the auth

router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user));

export default router;