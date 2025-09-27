/**
 * src/routes/authRoutes.js
 *
 * Routes pour l’authentification des utilisateurs
 */

import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Inscription
router.post("/register", registerUser);

// Connexion
router.post("/login", loginUser);

// Profil utilisateur connecté
router.get("/me", auth, getProfile);

export default router;
