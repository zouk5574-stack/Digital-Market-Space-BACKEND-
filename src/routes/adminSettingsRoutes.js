import express from "express";
import { getAutoConfirmDelay, updateAutoConfirmDelay } from "../controllers/adminSettingsController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// ✅ Accessible uniquement à l’admin
router.get("/auto-confirm-delay", protect, adminOnly, getAutoConfirmDelay);
router.post("/auto-confirm-delay", protect, adminOnly, updateAutoConfirmDelay);

export default router;
