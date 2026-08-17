import jwt from 'jsonwebtoken';
import {ENV} from './env.js';


export const generateToken = (userId, res) => {
 const{ JWT_SECRET } = ENV;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const token = jwt.sign(
    { userId },
    ENV.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const isProduction = ENV.NODE_ENV === "production";

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: isProduction ? "none" : "strict", // "none" required for cross-site cookies in production
    secure: isProduction, // must be true when sameSite="none"
  });

  return token;
};