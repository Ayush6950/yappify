import mongoose from "mongoose";
import Message from "../models/message.js";
import User from "../models/user.js";

const MAX_MESSAGES = 40;

const formatMessage = (msg, currentUserId, partnerName, myName) => {
  const isMe = msg.senderId.toString() === currentUserId.toString();
  const parts = [];

  if (msg.text) parts.push(msg.text);
  if (msg.media?.type) {
    parts.push(`[${msg.media.type}: ${msg.media.name || "attachment"}]`);
  } else if (msg.image) {
    parts.push("[image attachment]");
  }

  return {
    role: isMe ? "me" : "them",
    senderName: isMe ? myName : partnerName,
    text: parts.join(" ") || "[empty message]",
    timestamp: msg.createdAt,
  };
};

export const buildConversationContext = async (userId, partnerId) => {
  if (!mongoose.Types.ObjectId.isValid(partnerId)) {
    throw new Error("Invalid partner ID");
  }

  const partner = await User.findById(partnerId).select("fullName");
  if (!partner) {
    throw new Error("Partner not found");
  }

  const me = await User.findById(userId).select("fullName");
  if (!me) {
    throw new Error("User not found");
  }

  const messages = await Message.find({
    isDeleted: { $ne: true },
    $or: [
      { senderId: userId, receiverId: partnerId },
      { senderId: partnerId, receiverId: userId },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(MAX_MESSAGES)
    .populate("replyTo", "text senderId")
    .lean();

  messages.reverse();

  const formattedMessages = messages.map((msg) =>
    formatMessage(msg, userId, partner.fullName, me.fullName)
  );

  return {
    conversationKey: [userId.toString(), partnerId.toString()].sort().join("_"),
    me: { id: userId, fullName: me.fullName },
    partner: { id: partnerId, fullName: partner.fullName },
    messages: formattedMessages,
    messageCount: formattedMessages.length,
  };
};

export const contextToPromptText = (context) => {
  if (context.messageCount === 0) {
    return "No messages in this conversation yet.";
  }

  return context.messages
    .map((m) => {
      const time = new Date(m.timestamp).toLocaleString();
      return `[${time}] ${m.senderName}: ${m.text}`;
    })
    .join("\n");
};

export const getLastIncomingMessage = (context) => {
  for (let i = context.messages.length - 1; i >= 0; i--) {
    if (context.messages[i].role === "them") {
      return context.messages[i];
    }
  }
  return null;
};

export const buildMessageContext = async (userId, partnerId, messageId) => {
  if (!mongoose.Types.ObjectId.isValid(partnerId)) {
    throw new Error("Invalid partner ID");
  }
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new Error("Invalid message ID");
  }

  const partner = await User.findById(partnerId).select("fullName");
  if (!partner) {
    throw new Error("Partner not found");
  }

  const me = await User.findById(userId).select("fullName");
  if (!me) {
    throw new Error("User not found");
  }

  const message = await Message.findOne({
    _id: messageId,
    isDeleted: { $ne: true },
    $or: [
      { senderId: userId, receiverId: partnerId },
      { senderId: partnerId, receiverId: userId },
    ],
  }).lean();

  if (!message) {
    throw new Error("Message not found");
  }

  const formatted = formatMessage(message, userId, partner.fullName, me.fullName);

  return {
    me: { id: userId, fullName: me.fullName },
    partner: { id: partnerId, fullName: partner.fullName },
    message: {
      id: message._id,
      ...formatted,
    },
  };
};