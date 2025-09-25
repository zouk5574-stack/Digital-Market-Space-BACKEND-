// controllers/authController.js
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const JWT_EXPIRES = "7d"; // durée du token

// register
async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "name, email et password requis" });

    // check exist
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, phone, role, created_at) 
       VALUES ($1,$2,$3,$4,$5,'buyer',now())`,
      [id, name, email, hashed, phone || null]
    );

    return res.status(201).json({ message: "Inscription réussie" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email & password requis" });

    const result = await pool.query("SELECT id, name, email, password_hash, role FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: "Email ou mot de passe invalide" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash || "");
    if (!match) return res.status(400).json({ error: "Email ou mot de passe invalide" });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.json({ message: "Connexion OK", token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// /me
async function me(req, res) {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT id, name, email, phone, role, metadata, created_at FROM users WHERE id = $1", [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { register, login, me };
