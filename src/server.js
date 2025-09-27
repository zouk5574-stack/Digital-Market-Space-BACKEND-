import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Charger les variables d'environnement
dotenv.config();

// Initialiser express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ Route par défaut (Render checke / automatiquement)
app.get("/", (req, res) => {
  res.send("✅ Backend Digital Market Space en ligne !");
});

// Exemple route API
app.get("/api/hello", (req, res) => {
  res.json({ message: "Bienvenue sur ton API 🚀" });
});

// === Importer les routes ===
import notificationRoutes from "./routes/notificationRoutes.js";
import freelanceServiceRoutes from "./routes/freelanceServiceRoutes.js";
import freelanceOrderRoutes from "./routes/freelanceOrderRoutes.js";
import freelanceDeliveryRoutes from "./routes/freelanceDeliveryRoutes.js";
import adminSettingsRoutes from "./routes/adminSettingsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";  // ⬅️ nouvelle route upload

// Cron jobs (sécurisés par variables env)
import "./cron/maintenance.js";
import "./jobs/cleanupNotifications.js";
import "./cron/autoConfirmFreelance.js";

// === Utiliser les routes ===
app.use("/api/notifications", notificationRoutes);
app.use("/api/freelance/services", freelanceServiceRoutes);
app.use("/api/freelance/orders", freelanceOrderRoutes);
app.use("/api/freelance/delivery", freelanceDeliveryRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api", uploadRoutes); // ⬅️ ajoute toutes les routes d’upload sous /api

// === Lancer le serveur ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Digital Market Space API lancé sur le port ${PORT}`);
});
