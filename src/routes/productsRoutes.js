/**
 * src/routes/productRoutes.js
 *
 * Routes pour la gestion des produits digitaux.
 */

import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
} from "../controllers/productController.js";
import { auth, isSeller } from "../middleware/auth.js";

const router = express.Router();

// Récupérer tous les produits
router.get("/", getProducts);

// Récupérer un produit par ID
router.get("/:id", getProductById);

// Créer un produit (réservé aux vendeurs)
router.post("/", auth, isSeller, createProduct);

// Supprimer un produit (réservé au vendeur qui l’a créé)
router.delete("/:id", auth, isSeller, deleteProduct);

export default router;
