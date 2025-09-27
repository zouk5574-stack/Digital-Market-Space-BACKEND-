import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import "./cron/maintenance.js"; 
import "./jobs/cleanupNotifications.js";
import "./cron/autoConfirmFreelance.js";

import notificationRoutes from "./routes/notificationRoutes.js";
import freelanceServiceRoutes from "./routes/freelanceServiceRoutes.js";
import freelanceOrderRoutes from "./routes/freelanceOrderRoutes.js";
import freelanceDeliveryRoutes from "./routes/freelanceDeliveryRoutes.js";
import adminSettingsRoutes from "./routes/adminSettingsRoutes.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ Route par défaut (Render checke /)
app.get("/", (req, res) => {
  res.send("✅ Backend Digital Market Space en ligne !");
});

// ✅ Exemple test API
app.get("/api/hello", (req, res) => {
  res.json({ message: "Bienvenue sur ton API 🚀" });
});

// Routes
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/freelance/services", freelanceServiceRoutes);
app.use("/api/freelance/orders", freelanceOrderRoutes);
app.use("/api/freelance/deliveries", freelanceDeliveryRoutes);
app.use("/api/notifications", notificationRoutes);

// ✅ Lancement
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Digital Market Space API listening on port ${PORT}`);
});
