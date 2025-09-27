/**
 * src/controllers/paymentController.js
 *
 * Gestion des paiements des commandes via FedaPay (ou autre passerelle).
 */

import { query } from "../config/db.js";
import fedapay from "../config/fedapay.js";

/**
 * Initier un paiement pour une commande
 */
export const initiatePayment = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ message: "order_id requis" });
    }

    // Vérifier la commande
    const orderRes = await query("SELECT * FROM orders WHERE id = $1", [order_id]);
    const order = orderRes.rows[0];

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Cette commande n'est pas payable" });
    }

    // Préparer le paiement
    const payment = await fedapay.Transaction.create({
      description: `Paiement commande #${order.id}`,
      amount: order.total_amount,
      currency: "XOF",
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
    });

    res.json({
      message: "Paiement initié",
      payment_url: payment.url,
    });
  } catch (error) {
    console.error("Erreur initier paiement :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Callback de paiement (confirmation)
 */
export const paymentCallback = async (req, res) => {
  try {
    const { order_id, status } = req.body;

    if (!order_id || !status) {
      return res.status(400).json({ message: "Données invalides" });
    }

    // Mettre à jour le statut de la commande
    const newStatus = status === "success" ? "paid" : "cancelled";

    const result = await query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [newStatus, order_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    res.json({
      message: "Statut de la commande mis à jour",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur callback paiement :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
