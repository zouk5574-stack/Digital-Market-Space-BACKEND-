// routes/notificationRoutes.js
import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  createNotification,
  getUserNotifications,
  markAsRead
} from "../controllers/notificationController.js";

const router = express.Router();

// Créer une notification (admin)
router.post("/", protect, adminOnly, createNotification);

// Récupérer ses notifications (utilisateur connecté)
router.get("/", protect, getUserNotifications);

// Marquer une notification comme lue
router.post("/read", protect, markAsRead);

export default router;
