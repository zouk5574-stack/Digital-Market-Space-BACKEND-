import express from "express";
import { getAdminSettings, updateAdminSettings } from "../controllers/settingsController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// ✅ L’admin peut voir les réglages
router.get("/", protect, adminOnly, getAdminSettings);

// ✅ L’admin peut modifier les réglages
router.put("/", protect, adminOnly, updateAdminSettings);

export default router;
