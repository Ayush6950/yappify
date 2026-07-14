import "dotenv/config";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";
import authRoutes from "./routes/auth.routes.js";
import messageroutes from "./routes/message.routes.js";

const __dirname = path.resolve();
const PORT = ENV.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/message", messageroutes);

// Serve frontend in production
if (ENV.NODE_ENV === "development") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
  });
}

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer(); 