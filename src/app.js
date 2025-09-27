/**
 * src/app.js
 * Configuration principale d'Express : middlewares globaux + branchement des routes
 */

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import morgan from "morgan";
import helmet from "helmet";

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

const app = express();

// Create uploads directory if not exists (global root)
const uploadsPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Middlewares
app.use(helmet()); 
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

// Static files
app.use("/uploads", express.static(uploadsPath));

// Healthcheck
app.get("/", (req, res) => {
  res.status(200).send("✅ Backend Digital Market Space en ligne !");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/produits", productRoutes);
app.use("/api/orders", orderRoutes); // ✅ updated
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

// Error handler
app.use(errorHandler);

export default app;
