// src/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const auth = require("../middleware/auth");

// 📌 Créer une commande (après paiement validé)
router.post("/", auth, orderController.createOrder);

// 📌 Confirmer une commande (acheteur → libération des fonds au vendeur)
router.post("/confirm", auth, orderController.confirmOrder);

// 📌 Mettre une commande en litige (admin uniquement)
router.post("/dispute", auth, orderController.markDispute);

module.exports = router;
