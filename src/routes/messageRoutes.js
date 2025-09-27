import express from "express";
import { auth } from "../middleware/auth.js";
import {
  sendMessage,
  getConversation,
  getInbox,
  markAsRead
} from "../controllers/messageController.js";

const router = express.Router();

// Envoyer un message
router.post("/", auth, sendMessage);

// Récupérer la conversation avec un utilisateur
router.get("/conversation/:userId", auth, getConversation);

// Inbox (messages reçus)
router.get("/inbox", auth, getInbox);

// Marquer comme lu
router.put("/:id/read", auth, markAsRead);

export default router;
