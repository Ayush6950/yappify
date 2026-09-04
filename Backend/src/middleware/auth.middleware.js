import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";
import User from "../models/user.js";


export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: "Unauthorized - No token provided" });

    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Reject tokens issued before the last password change.
    if (user.passwordChangedAt) {
      const changedAtSec = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (decoded.iat < changedAtSec) {
        return res.status(401).json({ message: "Session expired - please log in again" });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    // jwt.verify throws on expired/tampered tokens — that's a 401, not a 500.
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
    console.log("Error in protectRoute middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/** Blocks users who haven't confirmed their email. Use after protectRoute. */
export const requireVerified = (req, res, next) => {
  if (!req.user?.isEmailVerified) {
    return res.status(403).json({
      code: "EMAIL_NOT_VERIFIED",
      message: "Please verify your email address to use this feature.",
    });
  }
  next();
};

/** Restricts a route to specific roles. Use after protectRoute. */
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ message: "You don't have permission to do that." });
  }
  next();
};  