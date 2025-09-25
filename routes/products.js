import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Routes Produits
router.get("/", getProducts);           // GET tous les produits
router.get("/:id", getProductById);     // GET un produit par id
router.post("/", createProduct);        // POST créer produit
router.put("/:id", updateProduct);      // PUT modifier produit
router.delete("/:id", deleteProduct);   // DELETE supprimer produit

export default router;
