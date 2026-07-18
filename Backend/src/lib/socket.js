
import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
 
const app = express();
const server = http.createServer(app);
 
export const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});
 
// ==========================================
// Socket Authentication
// ==========================================
 
io.use(socketAuthMiddleware);
 
// ==========================================
// Online Users
// ==========================================
 
const userSocketMap = {}; // { userId: socketId }
 
export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};
 
// ==========================================
// Socket Connection
// ==========================================
 
io.on("connection", (socket) => {
  try {
    const userId = socket.user._id.toString();
 
    console.log(`✅ ${socket.user.fullName} Connected`);
 
    // Save connected user
    userSocketMap[userId] = socket.id;
 
    // Broadcast online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
 
    // ==========================================
    // Start Call
    // ==========================================
    socket.on("call-user", ({ to, callType } = {}) => {
      if (!to) {
        socket.emit("error", { message: "Missing 'to' field" });
        return;
      }
 
      const receiverSocketId = getReceiverSocketId(to);
 
      if (!receiverSocketId) {
        socket.emit("user-offline");
        return;
      }
 
      io.to(receiverSocketId).emit("incoming-call", {
        from: {
          id: socket.user._id.toString(),
          fullName: socket.user.fullName,
          profilePic: socket.user.profilePic,
        },
        callType,
      });
    });
 
    // ==========================================
    // Accept Call
    // ==========================================
    socket.on("accept-call", ({ to, answer } = {}) => {
      if (!to) {
        socket.emit("error", { message: "Missing 'to' field" });
        return;
      }
 
      const receiverSocketId = getReceiverSocketId(to);
 
      if (!receiverSocketId) return;
 
      io.to(receiverSocketId).emit("call-accepted", {
        answer,
      });
    });
 
    // ==========================================
    // Reject Call
    // ==========================================
 
    socket.on("reject-call", ({ to } = {}) => {
      if (!to) {
        socket.emit("error", { message: "Missing 'to' field" });
        return;
      }
 
      const receiverSocketId = getReceiverSocketId(to);
 
      if (!receiverSocketId) return;
 
      io.to(receiverSocketId).emit("call-rejected");
    });
 
 
    //
    // webrtc-offer
    socket.on("webrtc-offer", ({ to, offer, callType } = {}) => {
      if (!to || !offer) {
        socket.emit("error", { message: "Missing 'to' or 'offer' field" });
        return;
      }
 
      const receiverSocketId = getReceiverSocketId(to);
 
      if (!receiverSocketId) return;
 
      io.to(receiverSocketId).emit("webrtc-offer", {
        from: {
          id: socket.user._id.toString(),
          fullName: socket.user.fullName,
          profilePic: socket.user.profilePic,
        },
        offer,
        callType,
      });
    });
 
    // webrtc-answer
    socket.on("webrtc-answer", ({ to, answer } = {}) => {
      if (!to || !answer) {
        socket.emit("error", { message: "Missing 'to' or 'answer' field" });
        return;
      }
 
      const receiverSocketId = getReceiverSocketId(to);
 
      if (!receiverSocketId) return;
 
      io.to(receiverSocketId).emit("webrtc-answer", answer);
    });
 
 
    // ==========================================
    // ICE Candidate Exchange
    // ==========================================
 
    socket.on("ice-candidate", ({ to, candidate } = {}) => {
      if (!to || !candidate) {
        socket.emit("error", { message: "Missing 'to' or 'candidate' field" });
        return;
      }
 
      const receiverSocketId = getReceiverSocketId(to);
 
      if (!receiverSocketId) return;
 
      io.to(receiverSocketId).emit("ice-candidate", candidate);
    });
 
    // ==========================================
    // End Call
    // ==========================================
 
    socket.on("end-call", ({ to } = {}) => {
      if (!to) {
        socket.emit("error", { message: "Missing 'to' field" });
        return;
      }
 
      const receiverSocketId = getReceiverSocketId(to);
 
      if (!receiverSocketId) return;
 
      io.to(receiverSocketId).emit("call-ended");
    });
 
    // ==========================================
    // Disconnect
    // ==========================================
 
    socket.on("disconnect", () => {
      console.log(`❌ ${socket.user.fullName} Disconnected`);
 
      delete userSocketMap[userId];
 
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  } catch (err) {
    console.error("Socket Error:", err);
  }
});
 
export { app, server };