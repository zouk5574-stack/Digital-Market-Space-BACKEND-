import { query } from '../config/db.js';
imp/**
 * src/controllers/productController.js
 *
 * Gestion des produits digitaux vendus par les utilisateurs (vendeurs).
 */

import pool, { query } from "../config/db.js";

/**
 * Créer un produit digital
 */
export const createProduct = async (req, res) => {
  try {
    const { title, description, price } = req.body;

    if (!title || !price) {
      return res.status(400).json({ message: "Titre et prix sont requis" });
    }

    const result = await query(
      `INSERT INTO products (title, description, price, seller_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, price, seller_id, created_at`,
      [title, description || "", price, req.user.id]
    );

    res.status(201).json({
      message: "Produit créé avec succès",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur création produit :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Récupérer tous les produits
 */
export const getProducts = async (req, res) => {
  try {
    const result = await query(
      `SELECT p.id, p.title, p.description, p.price, p.created_at,
              u.id AS seller_id, u.name AS seller_name
       FROM products p
       JOIN users u ON p.seller_id = u.id
       ORDER BY p.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erreur récupération produits :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Récupérer un produit par ID
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT p.id, p.title, p.description, p.price, p.created_at,
              u.id AS seller_id, u.name AS seller_name
       FROM products p
       JOIN users u ON p.seller_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur récupération produit :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Supprimer un produit (uniquement par le vendeur)
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le produit appartient au vendeur connecté
    const productRes = await query("SELECT * FROM products WHERE id = $1", [id]);
    const product = productRes.rows[0];

    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    if (product.seller_id !== req.user.id) {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    await query("DELETE FROM products WHERE id = $1", [id]);

    res.json({ message: "Produit supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression produit :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
