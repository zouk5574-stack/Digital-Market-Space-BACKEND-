/**
 * src/middleware/auth.js
 *
 * Middleware JWT pour protéger les routes.
 * Version adaptée : un seul admin (toi).
 */

import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// ✅ Vérification basique du token
export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token manquant" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérification existence utilisateur en BDD
    const result = await pool.query(
      "SELECT id, email, role FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Utilisateur introuvable" });
    }

    req.user = result.rows[0]; // injecte l'utilisateur dans req.user
    next();
  } catch (err) {
    console.error("❌ Erreur authMiddleware :", err);
    return res.status(403).json({ success: false, message: "Token invalide ou expiré" });
  }
};

// ✅ Restreindre aux admins (toi seul)
export const authAdmin = (req, res, next) => {
  // On vérifie si c’est toi l’admin en fonction :
  // - Soit du champ `role` = 'admin'
  // - Soit d’un ID admin fixe (par exemple défini dans .env)
  const ADMIN_ID = process.env.ADMIN_ID; // mets ton id admin dans .env

  if (!req.user || (ADMIN_ID && req.user.id !== ADMIN_ID && req.user.role !== "admin")) {
    return res.status(403).json({ success: false, message: "Accès réservé à l’admin" });
  }

  next();
};
