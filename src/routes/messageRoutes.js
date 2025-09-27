/**
 * src/routes/messageRoutes.js
 *
 * Routes pour la messagerie liée aux commandes freelance
 */

import express from "express";
import {
  sendMessage,
  getMessagesByOrder,
  markAsRead,
} from "../controllers/messageController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// ✅ Envoyer un message lié à une commande freelance
router.post("/", auth, sendMessage);

// ✅ Récupérer tous les messages d’une commande
router.get("/:orderId", auth, getMessagesByOrder);

// ✅ Marquer un message comme lu
router.put("/:messageId/read", auth, markAsRead);

export default router;
