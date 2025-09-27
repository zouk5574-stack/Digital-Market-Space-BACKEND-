import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { sendNotification, getNotifications, markAsRead } from "./controllers/notificationController.js";

const router = express.Router();

// Admin envoie une notif à tous
router.post("/send", protect, adminOnly, sendNotification);

// User récupère ses notifs
router.get("/", protect, getNotifications);

// User marque une notif comme lue
router.put("/:id/read", protect, markAsRead);

export default router;
