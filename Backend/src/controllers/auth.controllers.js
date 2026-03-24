import bcrypt from 'bcryptjs';
import user from '../models/User.js';
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

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);

    // 4. Create user
    const newuser = new User({
      fullname: username,
      email,
      password: hashpassword
    });

    // 5. Save user
    await newuser.save();

    // 6. Generate token
    generateToken(newuser._id, res);

    // 7. Response
    res.status(201).json({
      _id: newuser._id,
      fullname: newuser.fullname,
      email: newuser.email,
      profilePic: newuser.profilePic,
    });

  } catch (error) {
    console.log("Error in signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};