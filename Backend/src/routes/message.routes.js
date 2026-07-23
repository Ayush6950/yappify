import express from "express";
import {
  getAllContacts,
  getMessagesByUserId,
  sendMessage,
  getChatPartners,
  markMessageAsRead,
  editMessage,
  deleteMessage,
  reactToMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All message routes are protected
router.use(protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);
router.post("/:id/read", markMessageAsRead);
router.put("/:id", editMessage);
router.delete("/:id", deleteMessage);
router.post("/:id/react", reactToMessage);

export default router;