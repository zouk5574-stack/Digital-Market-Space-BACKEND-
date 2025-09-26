import express from 'express';
import { getSettings, updateSettings, runCron } from '../controllers/settingsController.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = express.Router();
router.get('/', protect, adminOnly, getSettings);
router.put('/', protect, adminOnly, updateSettings);
router.post('/run-cron', runCron); // protected by header
export default router;
