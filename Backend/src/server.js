import "dotenv/config";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import aiRoutes from "./routes/ai.routes.js";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";

const __dirname = path.resolve();
const PORT = ENV.PORT || 3000;

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);

if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));

 app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
});
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