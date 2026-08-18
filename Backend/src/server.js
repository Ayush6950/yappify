import "dotenv/config";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import { fileURLToPath } from "url";

import aiRoutes from "./routes/ai.routes.js";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
        .map((u) => u.replace(/\/$/, "")); // strip trailing slash

      // allow requests with no origin (e.g. mobile apps, curl) or matched origins
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

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);

if (ENV.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../Frontend/dist");

  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  } else {
    // If frontend is deployed separately (e.g., on Vercel), serve a status JSON
    app.get("*", (req, res) => {
      res.json({
        status: "success",
        message: "Yappify API is running in production.",
        frontend_served_locally: false
      });
    });
  }
}

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

startServer();