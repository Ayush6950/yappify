import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import aiRoutes from "./routes/ai.routes.js";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";

const PORT = ENV.PORT || 3000;

app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        process.env.CLIENT_URL,
        "http://localhost:5173",
        "http://localhost:5000",
      ]
        .filter(Boolean)
        .map((u) => u.replace(/\/$/, ""));

      if (!origin || allowed.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin not allowed → ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Yappify API is running.",
  });
});

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();