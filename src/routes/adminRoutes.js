import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

/**
 * Exemple de route admin protégée
 * - Accessible uniquement si l’utilisateur est connecté (protect)
 * - Accessible uniquement si role = admin (adminOnly)
 */
router.get("/settings", protect, adminOnly, async (req, res) => {
  try {
    res.json({
      message: "Bienvenue dans le panneau admin 🎉",
      admin: req.user.fullname,
      email: req.user.email || "non défini",
    });
  } catch (err) {
    console.error("Erreur admin/settings:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
