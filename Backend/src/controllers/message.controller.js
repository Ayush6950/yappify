import cloudinary from "../lib/cloundinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.js";
import User from "../models/user.js";
import ChatRequest from "../models/chatRequest.js";
import Conversation from "../models/conversation.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const { search = "" } = req.query;
    const trimmedSearch = search.trim();

    // Fetch current user's requests and active conversations
    const [sentRequests, receivedRequests, conversations] = await Promise.all([
      ChatRequest.find({ senderId: loggedInUserId }),
      ChatRequest.find({ receiverId: loggedInUserId }),
      Conversation.find({ participants: loggedInUserId, isActive: true }),
    ]);

    const sentRequestTargetIds = sentRequests.map((r) => r.receiverId.toString());
    const receivedRequestSenderIds = receivedRequests.map((r) => r.senderId.toString());
    const conversationPartnerIds = conversations.flatMap((c) =>
      c.participants.filter((p) => p.toString() !== loggedInUserId.toString()).map((p) => p.toString())
    );

    // Build user query
    const query = { _id: { $ne: loggedInUserId } };
    if (trimmedSearch) {
      query.$or = [
        { fullName: { $regex: trimmedSearch, $options: "i" } },
        { email: { $regex: trimmedSearch, $options: "i" } },
      ];
    } else {
      const relatedUserIds = [
        ...sentRequestTargetIds,
        ...receivedRequestSenderIds,
        ...conversationPartnerIds,
      ];
      query._id = { $in: relatedUserIds, $ne: loggedInUserId };
    }

    const filteredUsers = await User.find(query).select("-password");

    // Map requestStatus based on ChatRequest and Conversation status
    const usersWithRequestStatus = filteredUsers.map((user) => {
      const userId = user._id.toString();
      let requestStatus = "none";

      if (conversationPartnerIds.includes(userId)) {
        requestStatus = "contact";
      } else {
        const sentReq = sentRequests.find((r) => r.receiverId.toString() === userId);
        const receivedReq = receivedRequests.find((r) => r.senderId.toString() === userId);

        if (sentReq) {
          requestStatus = sentReq.status === "accepted" ? "contact" : sentReq.status === "rejected" ? "none" : "sent";
        } else if (receivedReq) {
          requestStatus = receivedReq.status === "accepted" ? "contact" : receivedReq.status === "rejected" ? "none" : "received";
        }
      }

      return {
        ...user.toObject(),
        requestStatus,
      };
    });

    res.status(200).json(usersWithRequestStatus);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendContactRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { id: targetId } = req.params;

    if (senderId.toString() === targetId) {
      return res.status(400).json({ message: "You cannot send a request to yourself." });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if there is already an active conversation
    const existingConversation = await Conversation.findOne({
      participants: { $all: [senderId, targetId] },
      isActive: true,
    });
    if (existingConversation) {
      return res.status(400).json({ message: "You are already contacts." });
    }

    // Check if there is an existing request
    const existingRequest = await ChatRequest.findOne({
      $or: [
        { senderId, receiverId: targetId },
        { senderId: targetId, receiverId: senderId },
      ],
    });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return res.status(400).json({ message: "Request already pending." });
      }
      if (existingRequest.status === "accepted") {
        return res.status(400).json({ message: "You are already connected." });
      }
      if (existingRequest.status === "rejected") {
        // Reset the request to pending with the current user as sender
        existingRequest.senderId = senderId;
        existingRequest.receiverId = targetId;
        existingRequest.status = "pending";
        await existingRequest.save();
      }
    } else {
      const newRequest = new ChatRequest({
        senderId,
        receiverId: targetId,
        status: "pending",
      });
      await newRequest.save();
    }

    // notify target user via socket if online
    const receiverSocketId = getReceiverSocketId(targetId.toString());
    if (receiverSocketId) {
      const sender = await User.findById(senderId).select("fullName email profilePic");
      io.to(receiverSocketId).emit("contact_request", {
        from: {
          id: sender._id.toString(),
          fullName: sender.fullName,
          email: sender.email,
          profilePic: sender.profilePic,
        },
      });
    }

    res.status(200).json({
      message: "Chat request sent successfully.",
      requestStatus: "sent",
    });
  } catch (error) {
    console.log("Error in sendContactRequest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const acceptContactRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { id: requesterId } = req.params;

    const request = await ChatRequest.findOne({
      senderId: requesterId,
      receiverId: currentUserId,
      status: "pending",
    });

    if (!request) {
      return res.status(400).json({ message: "No pending request from this user." });
    }

    request.status = "accepted";
    await request.save();

    // Create or activate conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, requesterId] },
    });

    if (conversation) {
      conversation.isActive = true;
      await conversation.save();
    } else {
      conversation = new Conversation({
        participants: [currentUserId, requesterId],
        isActive: true,
      });
      await conversation.save();
    }

    // notify requester via socket if online
    const requesterSocketId = getReceiverSocketId(requesterId.toString());
    if (requesterSocketId) {
      const currentUser = await User.findById(currentUserId).select("fullName email profilePic");
      io.to(requesterSocketId).emit("contact_request_accepted", {
        by: {
          id: currentUser._id.toString(),
          fullName: currentUser.fullName,
          email: currentUser.email,
          profilePic: currentUser.profilePic,
        },
      });
    }

    res.status(200).json({
      message: "Chat request accepted.",
      requestStatus: "contact",
    });
  } catch (error) {
    console.log("Error in acceptContactRequest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectContactRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { id: requesterId } = req.params;

    const request = await ChatRequest.findOne({
      senderId: requesterId,
      receiverId: currentUserId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({ message: "No pending request found." });
    }

    request.status = "rejected";
    await request.save();

    // notify requester via socket if online
    const requesterSocketId = getReceiverSocketId(requesterId.toString());
    if (requesterSocketId) {
      const currentUser = await User.findById(currentUserId).select("fullName");
      io.to(requesterSocketId).emit("contact_request_rejected", {
        by: {
          id: currentUser._id.toString(),
          fullName: currentUser.fullName,
        },
      });
    }

    res.status(200).json({ message: "Chat request rejected." });
  } catch (error) {
    console.log("Error in rejectContactRequest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const activeConversation = await Conversation.findOne({
      participants: { $all: [myId, userToChatId] },
      isActive: true,
    });

    if (!activeConversation) {
      return res.status(403).json({ message: "You can only chat with accepted contacts." });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).populate("replyTo", "text senderId image media");

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, replyTo, media } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image && !media) {
      return res.status(400).json({ message: "Text, image, or media is required." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }

    const activeConversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      isActive: true,
    });

    if (!activeConversation) {
      return res.status(403).json({ message: "Chat is only available after the request is accepted." });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let mediaData;
    if (media) {
      if (media.url && media.url.startsWith("data:")) {
        const uploadResponse = await cloudinary.uploader.upload(media.url, {
          resource_type: "auto",
        });
        mediaData = {
          url: uploadResponse.secure_url,
          type: media.type,
          name: media.name,
          size: media.size,
        };
      } else {
        mediaData = media;
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      replyTo: replyTo || null,
      media: mediaData,
      status: "sent",
    });

    await newMessage.save();

    if (replyTo) {
      await newMessage.populate("replyTo", "text senderId image media");
    }

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      newMessage.status = "delivered";
      await newMessage.save();
      
      const senderSocketId = getReceiverSocketId(senderId.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit("message_status_update", {
          messageId: newMessage._id,
          status: "delivered",
        });
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const conversations = await Conversation.find({
      participants: loggedInUserId,
      isActive: true,
    });

    if (conversations.length === 0) {
      return res.status(200).json([]);
    }

    const partnerIds = conversations.flatMap((c) =>
      c.participants.filter((p) => p.toString() !== loggedInUserId.toString())
    );

    const chatPartners = await User.find({ _id: { $in: partnerIds } }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    const recipient = await User.findById(userId);
    const sender = await User.findById(message.senderId);

    if (recipient && !recipient.disableReadReceipts && sender && !sender.disableReadReceipts) {
      message.status = "read";
      message.readAt = new Date();
      await message.save();

      const senderSocketId = getReceiverSocketId(message.senderId.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit("message_status_update", {
          messageId,
          status: "read",
          readAt: message.readAt,
        });
      }
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in markMessageAsRead controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: "Text is required to edit message." });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    if (!message.senderId.equals(userId)) {
      return res.status(403).json({ message: "Unauthorized to edit this message." });
    }

    message.editHistory.push({
      text: message.text,
      editedAt: new Date(),
    });

    message.text = text;
    message.isEdited = true;

    await message.save();

    const receiverId = message.senderId.equals(userId) ? message.receiverId : message.senderId;
    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message_edited", {
        messageId,
        text: message.text,
        isEdited: true,
        editHistory: message.editHistory,
      });
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in editMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    if (!message.senderId.equals(userId)) {
      return res.status(403).json({ message: "Unauthorized to delete this message." });
    }

    message.text = "[This message was deleted]";
    message.image = undefined;
    message.media = undefined;
    message.isDeleted = true;

    await message.save();

    const receiverId = message.senderId.equals(userId) ? message.receiverId : message.senderId;
    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message_deleted", {
        messageId,
      });
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in deleteMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!emoji) {
      return res.status(400).json({ message: "Emoji is required." });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingReactionIndex > -1) {
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      message.reactions.push({ emoji, userId });
    }

    await message.save();

    const receiverId = message.senderId.equals(userId) ? message.receiverId : message.senderId;
    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message_reacted", {
        messageId,
        reactions: message.reactions,
      });
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in reactToMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};