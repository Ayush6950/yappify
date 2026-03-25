import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { generateToken } from '../lib/utils.js';

export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 1. Validation
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

    // 2. Check existing user
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);

     const newuser = new User({
      fullName: username,
      email,
      password: hashpassword,
    });

  if (newuser) {

    await newuser.save();
    generateToken(newuser._id, res);
    res.status(201).json({
      _id: newuser._id,
      fullName: newuser.fullName,
      email: newuser.email,
      profilePic: newuser.profilePic,
    });

  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
  } catch (error) {
    console.log("Error in signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};