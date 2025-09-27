/**
 * src/controllers/orderController.js
 *
 * Gestion des commandes (produits digitaux + freelance).
 */

import pool, { query } from "../config/db.js";

/**
 * Créer une commande
 */
export const createOrder = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ message: "Produit et quantité requis" });
    }

    // Vérifier que le produit existe
    const productRes = await query("SELECT * FROM products WHERE id = $1", [product_id]);
    const product = productRes.rows[0];

    if (!product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    const total = product.price * quantity;

    const result = await query(
      `INSERT INTO orders (buyer_id, seller_id, product_id, quantity, total_amount, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING id, buyer_id, seller_id, product_id, quantity, total_amount, status, created_at`,
      [req.user.id, product.seller_id, product.id, quantity, total]
    );

    res.status(201).json({
      message: "Commande créée avec succès",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur création commande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Récupérer toutes les commandes de l’utilisateur connecté
 */
export const getMyOrders = async (req, res) => {
  try {
    const result = await query(
      `SELECT o.id, o.status, o.total_amount, o.quantity, o.created_at,
              p.title, p.price,
              u.id AS seller_id, u.name AS seller_name
       FROM orders o
       JOIN products p ON o.product_id = p.id
       JOIN users u ON o.seller_id = u.id
       WHERE o.buyer_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erreur récupération commandes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Récupérer toutes les ventes (commandes reçues par un vendeur)
 */
export const getMySales = async (req, res) => {
  try {
    const result = await query(
      `SELECT o.id, o.status, o.total_amount, o.quantity, o.created_at,
              p.title, p.price,
              u.id AS buyer_id, u.name AS buyer_name
       FROM orders o
       JOIN products p ON o.product_id = p.id
       JOIN users u ON o.buyer_id = u.id
       WHERE o.seller_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erreur récupération ventes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Mettre à jour le statut d’une commande (ex: payé, livré)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "paid", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const result = await query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    res.json({
      message: "Statut mis à jour",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur mise à jour commande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
