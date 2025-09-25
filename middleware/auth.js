// middleware/auth.js
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET || "change_this_secret";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token manquant" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2) return res.status(401).json({ error: "Header Authorization invalide" });

  const token = parts[1];
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload; // { id, email, role, ... }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
}

module.exports = authMiddleware;
