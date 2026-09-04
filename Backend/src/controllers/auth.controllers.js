import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { generateToken } from "../lib/utils.js";
import Token from "../models/token.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloundinary.js";
import { issueToken, consumeToken } from "../lib/token.js";
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../email/emailHandler.js";


// ====================== SIGNUP ======================
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate JWT Token
    generateToken(newUser._id, res);

    // Send response
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      isEmailVerified: newUser.isEmailVerified,
      role:newUser.role,
    });

    // Send the verification link (non-blocking — signup already responded).
    // A failure here must not fail signup; the user can ask for a fresh link.
    try {
      const rawToken = await issueToken(
        newUser._id,
        "email-verify",
        ENV.EMAIL_VERIFY_TOKEN_TTL_MIN
      );
      await sendVerificationEmail(newUser.email, newUser.fullName, rawToken);
    } catch (err) {
      console.error("Verification email failed:", err.message);
    }

    // Send Welcome Email (Non-blocking)
    sendWelcomeEmail(newUser.email, newUser.fullName, ENV.CLIENT_URL);

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ====================== LOGIN ======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      isEmailVerified: user.isEmailVerified,
      role: user.role,
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ====================== LOGOUT ======================
export const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: isProduction ? "none" : "strict",
    secure: isProduction,
  });

  res.status(200).json({
    message: "Logged out successfully",
  });
};

// ====================== UPDATE PROFILE ======================
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;

    if (!profilePic) {
      return res.status(400).json({
        message: "Profile picture is required",
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        profilePic: uploadResponse.secure_url,
      },
      {
        new: true,
      }
    );

    res.status(200).json(updatedUser);

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


// ====================== VERIFY EMAIL ======================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const tokenDoc = await consumeToken(token, "email-verify");
    if (!tokenDoc) {
      return res.status(400).json({
        message: "This verification link is invalid or has expired.",
      });
    }

    await User.findByIdAndUpdate(tokenDoc.userId, {
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify Email Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ====================== RESEND VERIFICATION ======================
export const resendVerification = async (req, res) => {
  try {
    const user = req.user; // set by protectRoute

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const rawToken = await issueToken(
      user._id,
      "email-verify",
      ENV.EMAIL_VERIFY_TOKEN_TTL_MIN
    );
    await sendVerificationEmail(user.email, user.fullName, rawToken);

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error("Resend Verification Error:", error);
    res.status(500).json({ message: "Could not send verification email" });
  }
};

// ====================== FORGOT PASSWORD ======================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });

    // Only send if the account exists — but ALWAYS return the same response,
    // so an attacker cannot use this endpoint to discover registered emails.
    if (user) {
      try {
        const rawToken = await issueToken(
          user._id,
          "password-reset",
          ENV.PASSWORD_RESET_TOKEN_TTL_MIN
        );
        await sendPasswordResetEmail(user.email, user.fullName, rawToken);
      } catch (err) {
        console.error("Reset email failed:", err.message);
      }
    }

    res.status(200).json({
      message: "If that email is registered, a reset link is on its way.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ====================== RESET PASSWORD ======================
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const tokenDoc = await consumeToken(token, "password-reset");
    if (!tokenDoc) {
      return res.status(400).json({
        message: "This reset link is invalid or has expired.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(tokenDoc.userId, {
      password: hashedPassword,
      passwordChangedAt: new Date(), // invalidates every existing JWT
    });

    // Kill any other outstanding reset tokens for this user.
    await Token.deleteMany({ userId: tokenDoc.userId, type: "password-reset" });

    res.status(200).json({
      message: "Password updated. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
