// routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

// Enregistrer une transaction (après paiement validé)
router.post("/", transactionController.createTransaction);

// Voir les transactions d’un vendeur
router.get("/:seller_id", transactionController.getSellerTransactions);

module.exports = router;
