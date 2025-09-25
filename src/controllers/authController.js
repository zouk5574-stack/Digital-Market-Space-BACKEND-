import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// ✅ Générer un token JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 📌 Inscription
export const register = async (req, res, next) => {
  try {
    const { fullname, phone, password, role } = req.body;

    // Vérifier si l’utilisateur existe déjà
    const existing = await pool.query("SELECT * FROM users WHERE phone = $1", [phone]);
    if (existing.rows.length > 0) {
      const error = new Error("Un compte avec ce numéro existe déjà");
      error.statusCode = 400;
      return next(error);
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer utilisateur
    const result = await pool.query(
      `INSERT INTO users (fullname, phone, password_hash, role) 
       VALUES ($1, $2, $3, $4) RETURNING id, fullname, phone, role`,
      [fullname, phone, hashedPassword, role || "buyer"]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: "Utilisateur créé ✅",
      user,
      token,
    });
  } catch (err) {
    next(err); // ✅ géré par errorHandler.js
  }
};

// 📌 Connexion
export const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE phone = $1", [phone]);
    const user = result.rows[0];

    if (!user) {
      const error = new Error("Utilisateur non trouvé");
      error.statusCode = 404;
      return next(error);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error("Mot de passe incorrect");
      error.statusCode = 400;
      return next(error);
    }

    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: "Connexion réussie ✅",
      user: { id: user.id, fullname: user.fullname, phone: user.phone, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
};

// 📌 Profil utilisateur connecté
export const getMe = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id, fullname, phone, role FROM users WHERE id = $1", [req.user.id]);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
