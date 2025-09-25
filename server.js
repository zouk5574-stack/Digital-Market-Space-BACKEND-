// Import des modules nécessaires
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

// Initialisation de l'application
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Connexion à la base de données (Supabase utilise PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // obligatoire pour Supabase/Render
});

// Test route (pour vérifier que le backend fonctionne)
app.get("/", (req, res) => {
  res.json({ message: "🚀 Backend Marketplace actif et connecté !" });
});

// Exemple : récupérer les produits
app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des produits" });
  }
});

// Exemple : ajouter un produit
app.post("/products", async (req, res) => {
  try {
    const { name, price } = req.body;
    const result = await pool.query(
      "INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *",
      [name, price]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'ajout du produit" });
  }
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${port}`);
});
