import express from "express";
import { updatePaymentKey, getPaymentKey } from "../controllers/adminPaymentController.js";
import { authAdmin } from "../middleware/authAdmin.js";

const router = express.Router();

// ✅ Routes protégées
router.post("/update-key", authAdmin, updatePaymentKey);
router.get("/get-key", authAdmin, getPaymentKey);

export default router;
