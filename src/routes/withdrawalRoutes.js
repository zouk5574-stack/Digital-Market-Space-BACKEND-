/**
 * src/routes/withdrawalRoutes.js
 *
 * Routes pour la gestion des retraits
 */

import express from "express";
import {
  requestWithdrawal,
  getMyWithdrawals,
  getAllWithdrawals,
  updateWithdrawalStatus,
  adminWithdrawal,
} from "../controllers/withdrawalController.js";

import { auth } from "../middleware/auth.js";
import { authAdmin } from "../middleware/authAdmin.js";

const router = express.Router();

// ✅ Utilisateur : demander un retrait
router.post("/", auth, requestWithdrawal);

// ✅ Utilisateur : voir ses retraits
router.get("/me", auth, getMyWithdrawals);

// ✅ Admin : voir toutes les demandes
router.get("/", authAdmin, getAllWithdrawals);

// ✅ Admin : changer le statut d’un retrait
router.put("/:id/status", authAdmin, updateWithdrawalStatus);

// ✅ Admin : retirer ses propres fonds 💸
router.post("/admin", authAdmin, adminWithdrawal);

export default router;
