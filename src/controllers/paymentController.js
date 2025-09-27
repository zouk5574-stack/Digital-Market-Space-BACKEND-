import db from "../config/db.js";
import fedapay from "../config/fedapay.js";
import { toCents, centsToDisplay } from "../utils/helpers.js";

/**
 * 📌 Créer une nouvelle transaction de paiement
 */
export const createPayment = async (req, res) => {
  try {
    const { orderId, amount, currency = "XOF" } = req.body;
    const { id: userId } = req.user;

    if (!orderId || !amount) {
      return res.status(400).json({ message: "orderId et amount sont requis" });
    }

    const amountInCents = toCents(amount);

    // Vérifier que la commande existe et appartient à l’utilisateur
    const orderCheck = await db.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [orderId, userId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    // Créer la transaction avec FedaPay
    const transaction = await fedapay.Transaction.create({
      description: `Paiement commande ${orderId}`,
      amount: amountInCents,
      currency: { iso: currency },
      callback_url: `${process.env.BASE_URL}/api/payments/callback`,
    });

    // Sauvegarder la transaction en DB
    const result = await db.query(
      `INSERT INTO payments (order_id, user_id, amount, currency, status, transaction_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [orderId, userId, amountInCents, currency, "pending", transaction.id]
    );

    res.json({
      success: true,
      payment: result.rows[0],
      redirectUrl: transaction.url,
    });
  } catch (err) {
    console.error("❌ Erreur création paiement :", err);
    res.status(500).json({ message: "Erreur création paiement" });
  }
};

/**
 * 📌 Callback après paiement FedaPay
 */
export const paymentCallback = async (req, res) => {
  try {
    const { transaction_id, status } = req.body;

    if (!transaction_id) {
      return res.status(400).json({ message: "Transaction ID manquant" });
    }

    // Vérifier la transaction
    const paymentCheck = await db.query(
      `SELECT * FROM payments WHERE transaction_id = $1`,
      [transaction_id]
    );

    if (paymentCheck.rows.length === 0) {
      return res.status(404).json({ message: "Paiement introuvable" });
    }

    const newStatus = status === "approved" ? "success" : "failed";

    await db.query(
      `UPDATE payments SET status = $1, updated_at = NOW() WHERE transaction_id = $2`,
      [newStatus, transaction_id]
    );

    res.json({ success: true, status: newStatus });
  } catch (err) {
    console.error("❌ Erreur callback paiement :", err);
    res.status(500).json({ message: "Erreur callback paiement" });
  }
};

/**
 * 📌 Récupérer l’historique des paiements d’un utilisateur
 */
export const getUserPayments = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const result = await db.query(
      `SELECT p.*, o.title as order_title
       FROM payments p
       LEFT JOIN orders o ON p.order_id = o.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    const formatted = result.rows.map((p) => ({
      ...p,
      amount_display: centsToDisplay(p.amount),
    }));

    res.json({ success: true, payments: formatted });
  } catch (err) {
    console.error("❌ Erreur récupération paiements :", err);
    res.status(500).json({ message: "Erreur récupération paiements" });
  }
};
