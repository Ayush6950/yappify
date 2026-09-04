import crypto from "crypto";
import Token from "../models/token.js";

export const hashToken = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");

/**
 * Creates a single-use token, invalidating any earlier unused token of the
 * same type for this user, and returns the RAW value to put in the email.
 */
export const issueToken = async (userId, type, ttlMinutes) => {
  await Token.deleteMany({ userId, type, usedAt: null });

  const raw = crypto.randomBytes(32).toString("hex"); // 256 bits

  await Token.create({
    userId,
    tokenHash: hashToken(raw),
    type,
    expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
  });

  return raw;
};

/** Returns the token doc if valid and unused, otherwise null. */
export const consumeToken = async (raw, type) => {
  if (!raw || typeof raw !== "string") return null;

  const doc = await Token.findOne({
    tokenHash: hashToken(raw),
    type,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!doc) return null;

  doc.usedAt = new Date();
  await doc.save();

  return doc;
};