import express from 'express';
import { createPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
router.post('/create', protect, createPayment);
export default router;
