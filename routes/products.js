// routes/products.js
const express = require("express");
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");
const auth = require("../middleware/auth");

const router = express.Router();

// publiques
router.get("/", getAllProducts);
router.get("/:id", getProduct);

// protégées (création/modif/suppression réservées à vendeurs/admin)
router.post("/", auth, createProduct);
router.put("/:id", auth, updateProduct);
router.delete("/:id", auth, deleteProduct);

module.exports = router;
