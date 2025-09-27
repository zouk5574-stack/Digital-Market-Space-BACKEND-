// routes/settingsRoutes.js
import express from "express";
import {
  getAdminSettings,
  updateAdminSettings,
  getPaymentKeys,
  updatePaymentKeys,
} from "../controllers/settingsController.js";
import { authAdmin } from "../middleware/authAdmin.js";

const router = express.Router();

/* -------------------------------------------------------
   ⚙️ Routes Réglages Admin (dashboard)
------------------------------------------------------- */
// ✅ Voir les réglages généraux (commission, délais, auto withdraw…)
router.get("/admin", authAdmin, getAdminSettings);

// ✅ Modifier les réglages généraux
router.put("/admin", authAdmin, updateAdminSettings);

/* -------------------------------------------------------
   🔑 Routes Paiement / Fedapay (clés API)
------------------------------------------------------- */
// ✅ Récupérer les clés Fedapay
router.get("/payment-keys", authAdmin, getPaymentKeys);

// ✅ Mettre à jour les clés Fedapay
router.put("/payment-keys", authAdmin, updatePaymentKeys);

export default router;
