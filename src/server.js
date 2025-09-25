require("dotenv").config(); // Charge les variables d'environnement (.env)
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// Import de la connexion DB
const pool = require("./config/db");

// Import des routes
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const withdrawalRoutes = require("./routes/withdrawalRoutes");
const escrowRoutes = require("./routes/escrowRoutes");
const app = express();
import adminRoutes from "./routes/adminRoutes.js";

// 🛡️ Middlewares globaux
app.use(cors()); // autorise les requêtes cross-origin
app.use(express.json()); // parse JSON dans req.body
app.use(morgan("dev")); // log des requêtes dans la console (utile en dev)

// 🌍 Routes principales
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/admin", adminRoutes);

// 📌 Route de test (ping)
app.get("/", (req, res) => {
  res.json({ message: "🚀 Digital Marketplace backend is running!" });
});

// 📦 Vérification DB avant de démarrer
const startServer = async () => {
  try {
    await pool.query("SELECT NOW()"); // test rapide de la DB
    console.log("✅ Database connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
