const express = require("express");
const pool = require("../db");

const router = express.Router();

// 📌 Créer une commande
router.post("/", async (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO orders (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
      [user_id, product_id, quantity]
    );

    res.status(201).json({ message: "Commande créée ✅", order: result.rows[0] });
  } catch (err) {
    console.error("Erreur création commande:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 📌 Récupérer les commandes d’un utilisateur
router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM orders WHERE user_id = $1", [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur récupération commandes:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
