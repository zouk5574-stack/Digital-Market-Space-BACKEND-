import express from "express";
import {
  createPayment,
  paymentCallback,
  getUserPayments,
} from "../controllers/paymentController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * =============================
 *   ROUTES PAIEMENT
 * =============================
 */

// 📌 Créer un paiement (utilisateur authentifié)
router.post("/", auth, createPayment);

// 📌 Callback Fedapay (pas besoin d’auth, Fedapay appelle directement)
router.post("/callback", paymentCallback);

// 📌 Historique des paiements d’un utilisateur (authentifié)
router.get("/", auth, getUserPayments);

export default router;
