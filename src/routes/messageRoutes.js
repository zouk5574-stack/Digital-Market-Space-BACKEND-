import express from 'express';
import { sendMessage, listMessages } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
router.post('/send', protect, sendMessage);
router.get('/', protect, listMessages);
export default router;
