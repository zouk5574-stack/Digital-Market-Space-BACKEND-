const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());

// Import des routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
import paymentRoutes from "./routes/paymentRoutes.js";
app.use("/api/payments", paymentRoutes);
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
app.use("/api/admin/auth", adminAuthRoutes);
const transactionRoutes = require("./routes/transactionRoutes");

// ...
app.use("/api/transactions", transactionRoutes);
// Utilisation des routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
