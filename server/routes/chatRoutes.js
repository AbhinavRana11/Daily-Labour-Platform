import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowCustomer, allowWorker } from '../middleware/roleGuard.js';
import { createChat, getUserChats, getChatMessages, sendMessage, markAsRead } from "../controllers/chatController.js";

const allowChat = (req, res, next) => {
  // Allow both customers and workers
  if (req.user && (req.user.role === 'customer' || req.user.role === 'labour')) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: chat access requires customer or labour role' });
};

const router = express.Router();

router.post("/create", protect, allowChat, createChat);
router.get("/", protect, allowChat, getUserChats);
router.get("/:chatId", protect, allowChat, getChatMessages);
router.post("/message", protect, allowChat, sendMessage);
router.put("/read/:chatId", protect, allowChat, markAsRead);

export default router;
