import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";

// Charger les variables d'environnement
dotenv.config();

// Initialiser express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ✅ Route par défaut (Render checke / automatiquement)
app.get("/", (req, res) => {
  res.send("✅ Backend Digital Market Space en ligne !");
});

// === Importer les routes ===
import utilisateurRoutes from "./routes/utilisateurRoutes.js";
import produitRoutes from "./routes/produitRoutes.js";
import commandeRoutes from "./routes/commandeRoutes.js"; // remplace "orders"
import livraisonRoutes from "./routes/livraisonRoutes.js";
import paiementRoutes from "./routes/paiementRoutes.js"; // nouvelle table paiements
import uploadRoutes from "./routes/uploadRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

// Cron jobs
import "./cron/maintenance.js";
import "./jobs/cleanupNotifications.js";
import "./cron/autoConfirmFreelance.js";

// === Utiliser les routes ===
app.use("/api/utilisateurs", utilisateurRoutes);
app.use("/api/produits", produitRoutes);
app.use("/api/commandes", commandeRoutes); // commandes_freelance
app.use("/api/livraisons", livraisonRoutes);
app.use("/api/paiements", paiementRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/messages", messageRoutes);

// === Lancer le serveur ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Digital Market Space API lancé sur le port ${PORT}`);
});
