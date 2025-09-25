import express from "express";
import { createPayment, checkPaymentStatus } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/pay", createPayment);
router.get("/status/:transactionId", checkPaymentStatus);

export default router;
