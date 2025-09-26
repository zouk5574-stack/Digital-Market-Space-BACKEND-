import app from './app.js';
import dotenv from 'dotenv';
import './cron/maintenance.js'; // start cron jobs (safe: cron checks CRON_SECRET & env)
dotenv.config();
import "./jobs/cleanupNotifications.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import freelanceServiceRoutes from "./routes/freelanceServiceRoutes.js";
import freelanceOrderRoutes from "./routes/freelanceOrderRoutes.js";
import adminSettingsRoutes from "./routes/adminSettingsRoutes.js";
import "./cron/autoConfirmFreelance.js";
import freelanceDeliveryRoutes from "./routes/freelanceDeliveryRoutes.js";
import "./cron/autoConfirmFreelance.js";
app.use("/api/freelance", freelanceDeliveryRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/freelance/services", freelanceServiceRoutes);
app.use("/api/freelance/orders", freelanceOrderRoutes);
app.use("/api/notifications", notificationRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Digital Market Space API listening on port ${PORT}`);
});
