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
  confirmWithdrawal,
} from "../controllers/withdrawalController.js";

import { auth } from "../middleware/auth.js";
import { authAdmin } from "../middleware/authAdmin.js";

const router = express.Router();

/**
 * ========================
 *   ROUTES UTILISATEUR & ADMIN
 * ========================
 */

// ✅ Demander un retrait (utilisateur ou admin)
router.post("/", auth, requestWithdrawal);

// ✅ Voir mes retraits (utilisateur ou admin)
router.get("/me", auth, getMyWithdrawals);

/**
 * ========================
 *   ROUTES ADMIN UNIQUEMENT
 * ========================
 */

// ✅ Voir toutes les demandes de retraits
router.get("/", authAdmin, getAllWithdrawals);

// ✅ Changer le statut (approved/rejected) → si auto_withdrawals = false
router.put("/:id/status", authAdmin, updateWithdrawalStatus);

// ✅ Confirmer manuellement un retrait (si besoin)
router.put("/:id/confirm", authAdmin, confirmWithdrawal);

export default router;
