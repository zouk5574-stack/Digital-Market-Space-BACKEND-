/**
 * src/app.js
 * Configuration principale d'Express : middlewares globaux + sécurité + routes
 */

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js"; // ✅ remplacé commandeRoutes
import commandesFreelanceRoutes from "./routes/commandesFreelanceRoutes.js";
import deliveriesRoutes from "./routes/deliveriesRoutes.js";
import freelanceDeliveryRoutes from "./routes/freelanceDeliveryRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import adminSettingsRoutes from "./routes/adminSettingsRoutes.js";
import notificationRoutes from "./routes/notificationRoute.js";
import withdrawalRoutes from "./routes/withdrawalRoutes.js";

import errorHandler from "./config/errorHandler.js";
import adminRoutes from "./routes/adminRoutes.js";


const app = express();

// ✅ Création dossier uploads si absent
const uploadsPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

/**
 * ===============================
 *         MIDDLEWARES
 * ===============================
 */
app.use(helmet()); // headers de sécurité

// ✅ CORS restrictif : modifie par tes domaines frontend
app.use(
  cors({
    origin: [
      "https://ton-domaine.com",
      "https://admin.ton-domaine.com",
      "http://localhost:3000", // pour dev
    ],
    credentials: true,
  })
);

// ✅ Limiter flood (100 req / 15 min par IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: "⚠️ Trop de requêtes, réessaie plus tard.",
});
app.use(limiter);

// ✅ Parsing JSON + URL Encoded (payloads max 10mb pour éviter abus)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Logging (safe, pas de tokens/mot de passe logués)
app.use(morgan("combined", {
  skip: (req, res) => req.url.includes("/auth") // ne log pas les routes sensibles
}));

// ✅ Static files sécurisés
app.use("/uploads", express.static(uploadsPath, {
  setHeaders: (res) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'");
  }
}));

/**
 * ===============================
 *          ROUTES
 * ===============================
 */
app.get("/", (req, res) => {
  res.status(200).send("✅ Backend Digital Market Space en ligne !");
});

app.use("/api/auth", authRoutes);
app.use("/api/produits", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/freelance/commandes", commandesFreelanceRoutes);
app.use("/api/livraisons", deliveriesRoutes);
app.use("/api/freelance/livraisons", freelanceDeliveryRoutes);
app.use("/api/paiements", paymentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/admin", adminRoutes);

/**
 * ===============================
 *       GLOBAL ERROR HANDLER
 * ===============================
 */
app.use(errorHandler);

export default app;
