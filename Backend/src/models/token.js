import mongoose from "mongoose";
import crypto from "crypto";

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // SHA-256 of the token we emailed. The raw value is never stored.
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["email-verify", "password-reset"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// MongoDB deletes documents automatically once expiresAt passes.
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model("Token", tokenSchema);
export default Token;