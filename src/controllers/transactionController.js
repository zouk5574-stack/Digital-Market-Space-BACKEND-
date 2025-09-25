// controllers/transactionController.js
const pool = require("../config/db");

// Créer une transaction après un paiement validé
exports.createTransaction = async (req, res) => {
  try {
    const { seller_id, amount, payment_reference } = req.body;

    // Récupérer la commission depuis la table settings
    const settingsResult = await pool.query("SELECT commission_rate FROM settings LIMIT 1");
    const commissionRate = settingsResult.rows[0]?.commission_rate || 10.0;

    // Calcul des montants
    const commission = (amount * commissionRate) / 100;
    const sellerRevenue = amount - commission;

    // Insérer dans transactions
    const result = await pool.query(
      `INSERT INTO transactions (seller_id, amount, commission, seller_revenue, payment_reference)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [seller_id, amount, commission, sellerRevenue, payment_reference]
    );

    res.status(201).json({
      success: true,
      transaction: result.rows[0]
    });
  } catch (error) {
    console.error("Erreur createTransaction:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Récupérer les transactions d’un vendeur
exports.getSellerTransactions = async (req, res) => {
  try {
    const { seller_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM transactions WHERE seller_id = $1 ORDER BY created_at DESC`,
      [seller_id]
    );

    res.json({ success: true, transactions: result.rows });
  } catch (error) {
    console.error("Erreur getSellerTransactions:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
