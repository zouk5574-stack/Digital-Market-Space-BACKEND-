import express from "express";
import { authAdmin } from "../middleware/authAdmin.js";
import {
  getSettings,
  updateSettings,
} from "../controllers/adminSettingsController.js";

const router = express.Router();

// ✅ Récupérer les paramètres admin
router.get("/", authAdmin, getSettings);

// ✅ Mettre à jour les paramètres admin
router.put("/", authAdmin, updateSettings);

export default router;
