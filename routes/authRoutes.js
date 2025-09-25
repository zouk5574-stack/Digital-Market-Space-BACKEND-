const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

// 📌 Inscription utilisateur
router.post("/register", async (req, res) => {
  const { fullname, phone, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (fullname, phone, password_hash) VALUES ($1, $2, $3) RETURNING id, fullname, phone",
      [fullname, phone, hashedPassword]
    );

    res.status(201).json({ message: "Utilisateur créé ✅", user: result.rows[0] });
  } catch (err) {
    console.error("Erreur inscription:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 📌 Connexion utilisateur
router.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE phone = $1", [phone]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ error: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Connexion réussie ✅", token });
  } catch (err) {
    console.error("Erreur connexion:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
