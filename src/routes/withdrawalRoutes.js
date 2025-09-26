import express from 'express';
import { requestWithdraw } from '../controllers/withdrawalController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
router.post('/request', protect, requestWithdraw);
export default router;
