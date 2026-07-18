import cloudinary from "../lib/cloundinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.js";
import User from "../models/user.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

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
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
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

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

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