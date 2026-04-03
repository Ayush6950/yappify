import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { generateToken } from '../lib/utils.js';
import { ENV } from "../lib/env.js";
import { sendWelcomeEmail } from '../email/emailHandler.js';
import cloudinary from '../lib/cloundinary.js';

export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // ✅ 1. Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailregex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // ✅ 2. Check existing user
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // ✅ 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);

    // ✅ 4. Create user
    const newuser = new User({
      fullName: username,
      email,
      password: hashpassword,
    });

    // ✅ 5. Save user
    await newuser.save();

    // ✅ 6. Generate token
    generateToken(newuser._id, res);

    // ✅ 7. Send response FIRST
    res.status(201).json({
      _id: newuser._id,
      fullName: newuser.fullName,
      email: newuser.email,
      profilePic: newuser.profilePic,
    });

    // ✅ 8. Send email (NON-BLOCKING)
    sendWelcomeEmail(newuser.email, newuser.fullName, ENV.CLIENT_URL);

  } catch (error) {
    console.log("Error in signup:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

 export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    // never tell the client which one is incorrect: password or email

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout =(_,res) => {
  res.cookie("jwt", "", {maxAge : 0 })
  res.status(200).json({message: "logged out successfully"});
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic) return res.status(400).json({ message: "Profile pic is required" });

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};