require("dotenv").config(); // Charge les variables d'environnement (.env)
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import adminAuthRoutes from "./routes/admin/adminAuthRoutes.js";
import adminPaymentRoutes from "./routes/admin/adminPaymentRoutes.js";
import adminRoutes from "./routes/admin/adminRoutes.js";

import authRoutes from "./routes/user/authRoutes.js";
import paymentRoutes from "./routes/user/paymentRoutes.js";
import productRoutes from "./routes/user/productRoutes.js";
import orderRoutes from "./routes/user/orderRoutes.js";

import transactionRoutes from "./routes/transactionRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ✅ Routes admin
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Routes user
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// ✅ Routes globales
app.use("/api/transactions", transactionRoutes);

export default app;
