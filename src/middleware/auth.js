import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// Middleware de protection des routes
export const protect = async (req, res, next) => {
  let token;

  try {
    // Récupère le token dans les headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ error: "Accès non autorisé, token manquant ❌" });
    }

    // Vérifie le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifie que l’utilisateur existe encore en DB
    const result = await pool.query(
      "SELECT id, fullname, phone, role FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Utilisateur introuvable ❌" });
    }

    // Ajoute l'utilisateur trouvé à req.user
    req.user = result.rows[0];

    next();
  } catch (err) {
    console.error("Erreur middleware protect:", err.message);
    res.status(401).json({ error: "Accès non autorisé ❌" });
  }
};

// Middleware spécial Admin uniquement
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès interdit 🚫 : réservé à l’admin." });
  }
  next();
};
