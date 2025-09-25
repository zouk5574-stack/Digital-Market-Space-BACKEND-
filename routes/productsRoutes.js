const express = require("express");
const pool = require("../db");

const router = express.Router();

// 📌 Ajouter un produit
router.post("/", async (req, res) => {
  const { name, description, price } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *",
      [name, description, price]
    );
    res.status(201).json({ message: "Produit ajouté ✅", product: result.rows[0] });
  } catch (err) {
    console.error("Erreur ajout produit:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 📌 Récupérer tous les produits
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur récupération produits:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
