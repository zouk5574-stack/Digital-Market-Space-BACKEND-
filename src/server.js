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
import adminSettingsRoutes from "./routes/adminSettingsRoutes.js";
import adminSettingsRoutes from "./routes/adminSettingsRoutes.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ Route par défaut (Render checke / automatiquement)
app.get("/", (req, res) => {
  res.send("✅ Backend Digital Market Space en ligne !");
});

// ⚡ Exemple route API
app.get("/api/hello", (req, res) => {
  res.json({ message: "Bienvenue sur ton API 🚀" });
});

// ✅ IMPORTANT : Render fournit le PORT dans process.env.PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
// ... autres middlewares
app.use("/api/admin/settings", adminSettingsRoutes);
// ...
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/freelance", freelanceDeliveryRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/freelance/services", freelanceServiceRoutes);
app.use("/api/freelance/orders", freelanceOrderRoutes);
app.use("/api/notifications", notificationRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Digital Market Space API listening on port ${PORT}`);
});
