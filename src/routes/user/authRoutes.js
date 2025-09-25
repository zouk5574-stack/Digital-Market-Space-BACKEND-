import express from 'express';
import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// 📌 Auth routes
router.post("/register", register);   // Inscription
router.post("/login", login);         // Connexion
router.get("/me", protect, getMe);    // Profil utilisateur connecté

export default router;
