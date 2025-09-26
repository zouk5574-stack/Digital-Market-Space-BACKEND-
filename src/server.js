import app from './app.js';
import dotenv from 'dotenv';
import './cron/maintenance.js'; // start cron jobs (safe: cron checks CRON_SECRET & env)
dotenv.config();
import "./jobs/cleanupNotifications.js";
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Digital Market Space API listening on port ${PORT}`);
});
