import express from "express";
import { protect } from "../middleware/auth.js";
import { deliverWork, confirmDelivery } from "../controllers/freelanceDeliveryController.js";

const router = express.Router();

// Freelance livre son travail
router.post("/deliver", protect, deliverWork);

// Acheteur confirme réception
router.post("/confirm", protect, confirmDelivery);

export default router;
