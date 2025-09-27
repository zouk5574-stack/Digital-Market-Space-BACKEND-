/**
 * src/routes/orderRoutes.js
 *
 * Routes pour la gestion des commandes.
 */

import express from "express";
import {
  createOrder,
  getMyOrders,
  getMySales,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { auth, isSeller } from "../middleware/auth.js";

const router = express.Router();

// Créer une commande (acheteur)
router.post("/", auth, createOrder);

// Récupérer mes commandes (acheteur)
router.get("/my-orders", auth, getMyOrders);

// Récupérer mes ventes (vendeur)
router.get("/my-sales", auth, isSeller, getMySales);

// Mettre à jour le statut d'une commande
router.put("/:id/status", auth, updateOrderStatus);

export default router;
