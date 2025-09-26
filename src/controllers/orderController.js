// src/controllers/orderController.js
const db = require("../config/db");

/**
 * Créer une nouvelle commande après le paiement
 */
exports.createOrder = async (req, res) => {
  const { buyer_id, seller_id, product_id, amount } = req.body;

  try {
    // Récupérer le taux de commission depuis settings
    const settings = await db.oneOrNone("SELECT commission_rate FROM settings LIMIT 1");
    const commissionRate = settings ? settings.commission_rate : 10;

    const commission = (amount * commissionRate) / 100;
    const netAmount = amount - commission;

    const order = await db.one(
      `INSERT INTO orders (buyer_id, seller_id, product_id, amount, commission, net_amount, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
       RETURNING *`,
      [buyer_id, seller_id, product_id, amount, commission, netAmount]
    );

    return res.status(201).json({ message: "Commande créée avec succès", order });
  } catch (error) {
    console.error("Erreur createOrder:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Confirmer la livraison par l’acheteur → libération des fonds au vendeur
 */
exports.confirmOrder = async (req, res) => {
  const { order_id, buyer_id } = req.body;

  try {
    const order = await db.oneOrNone(
      "SELECT * FROM orders WHERE id = $1 AND buyer_id = $2",
      [order_id, buyer_id]
    );

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable ou non autorisée" });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({ message: "Commande non encore livrée ou déjà confirmée" });
    }

    // Libérer les fonds au vendeur
    await db.none(
      `UPDATE sellers SET balance = balance + $1 WHERE id = $2`,
      [order.net_amount, order.seller_id]
    );

    // Mettre à jour la commande
    const updated = await db.one(
      `UPDATE orders 
       SET status = 'confirmed', confirmed_at = NOW(), updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [order_id]
    );

    return res.json({ message: "Commande confirmée, fonds libérés", order: updated });
  } catch (error) {
    console.error("Erreur confirmOrder:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Marquer une commande en litige (admin uniquement)
 */
exports.markDispute = async (req, res) => {
  const { order_id } = req.body;

  try {
    const order = await db.oneOrNone("SELECT * FROM orders WHERE id = $1", [order_id]);

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    if (order.status !== "pending" && order.status !== "delivered") {
      return res.status(400).json({ message: "Impossible de mettre en litige cette commande" });
    }

    const updated = await db.one(
      `UPDATE orders 
       SET status = 'dispute', updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [order_id]
    );

    return res.json({ message: "Commande mise en litige", order: updated });
  } catch (error) {
    console.error("Erreur markDispute:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
