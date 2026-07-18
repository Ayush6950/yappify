
import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import User from "../models/user.js";
import Message from "../models/message.js";
 
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
    io.emit("user_online", userId);
 
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
    // Typing Indicators
    // ==========================================

    socket.on("typing_start", ({ to }) => {
      if (!to) return;
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing_start", { from: userId });
      }
    });

    socket.on("typing_end", ({ to }) => {
      if (!to) return;
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing_end", { from: userId });
      }
    });

    // ==========================================
    // Read Receipts
    // ==========================================

    socket.on("message_delivered", async ({ messageId, senderId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { status: "delivered" });
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("message_status_update", {
            messageId,
            status: "delivered",
          });
        }
      } catch (err) {
        console.error("Error in message_delivered socket handler:", err);
      }
    });

    socket.on("message_read", async ({ messageId, senderId }) => {
      try {
        const recipient = await User.findById(userId);
        const sender = await User.findById(senderId);

        if (recipient && !recipient.disableReadReceipts && sender && !sender.disableReadReceipts) {
          const readAt = new Date();
          await Message.findByIdAndUpdate(messageId, { status: "read", readAt });

          const senderSocketId = getReceiverSocketId(senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit("message_status_update", {
              messageId,
              status: "read",
              readAt,
            });
          }
        }
      } catch (err) {
        console.error("Error in message_read socket handler:", err);
      }
    });

    // ==========================================
    // Message Management
    // ==========================================

    socket.on("message_edited", ({ to, messageId, text, isEdited, editHistory }) => {
      if (!to) return;
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message_edited", { messageId, text, isEdited, editHistory });
      }
    });

    socket.on("message_deleted", ({ to, messageId }) => {
      if (!to) return;
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message_deleted", { messageId });
      }
    });

    // ==========================================
    // Reactions
    // ==========================================

    socket.on("message_reacted", ({ to, messageId, reactions }) => {
      if (!to) return;
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message_reacted", { messageId, reactions });
      }
    });

    // ==========================================
    // Disconnect
    // ==========================================
 
    socket.on("disconnect", async () => {
      console.log(`❌ ${socket.user.fullName} Disconnected`);
 
      delete userSocketMap[userId];
 
      // Update lastSeen in database
      try {
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      } catch (err) {
        console.error("Failed to update lastSeen on disconnect:", err);
      }

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      io.emit("user_offline", userId);
    });
  } catch (err) {
    console.error("Socket Error:", err);
  }
});
 
export { app, server };