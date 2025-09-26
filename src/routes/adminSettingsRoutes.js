import express from "express";
import { getAdminSettings, updateAdminSettings } from "../controllers/adminSettingsController.js";
import { authAdmin } from "../middleware/authAdmin.js";

const router = express.Router();

// ✅ Accessible uniquement par l’admin
router.get("/", authAdmin, getAdminSettings);
router.put("/", authAdmin, updateAdminSettings);

export default router;
