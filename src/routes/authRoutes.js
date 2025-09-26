import express from 'express';
import { register, login, verifyEmail, me } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.get('/me', protect, me);
export default router;
