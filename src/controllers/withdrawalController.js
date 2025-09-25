// controllers/withdrawalController.js
const db = require("../config/db"); // ton pool/instance de PostgreSQL
const fedapay = require("fedapay"); // SDK officiel ou API REST via axios
const moment = require("moment");

// ⚡ Initialiser Fedapay (clé secrète depuis .env)
fedapay.apiKey = process.env.FEDAPAY_SECRET_KEY;

/**
 * Créer une demande de retrait
 */
exports.requestWithdrawal = async (req, res) => {
  const { seller_id, amount } = req.body;

  try {
    // Vérifier si le vendeur a assez de solde disponible
    const sellerBalance = await db.oneOrNone(
      "SELECT balance FROM sellers WHERE id = $1",
      [seller_id]
    );

    if (!sellerBalance || sellerBalance.balance < amount) {
      return res.status(400).json({ message: "Solde insuffisant" });
    }

    // Créer la demande de retrait
    const withdrawal = await db.one(
      `INSERT INTO withdrawals (seller_id, amount, status, requested_at)
       VALUES ($1, $2, 'pending', NOW())
       RETURNING *`,
      [seller_id, amount]
    );

    return res.status(201).json({ message: "Demande de retrait créée", withdrawal });
  } catch (error) {
    console.error("Erreur requestWithdrawal:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Approuver un retrait (admin action ou auto-approve après T heures)
 */
exports.approveWithdrawal = async (req, res) => {
  const { withdrawal_id } = req.body;

  try {
    const withdrawal = await db.oneOrNone(
      "SELECT * FROM withdrawals WHERE id = $1",
      [withdrawal_id]
    );

    if (!withdrawal) {
      return res.status(404).json({ message: "Retrait introuvable" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Le retrait n'est pas en attente" });
    }

    const updated = await db.one(
      `UPDATE withdrawals 
       SET status = 'approved', approved_at = NOW() 
       WHERE id = $1 RETURNING *`,
      [withdrawal_id]
    );

    return res.json({ message: "Retrait approuvé", withdrawal: updated });
  } catch (error) {
    console.error("Erreur approveWithdrawal:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Exécuter le paiement via Fedapay
 */
exports.processWithdrawal = async (req, res) => {
  const { withdrawal_id } = req.body;

  try {
    const withdrawal = await db.oneOrNone(
      "SELECT * FROM withdrawals WHERE id = $1",
      [withdrawal_id]
    );

    if (!withdrawal) {
      return res.status(404).json({ message: "Retrait introuvable" });
    }

    if (withdrawal.status !== "approved") {
      return res.status(400).json({ message: "Le retrait doit être approuvé avant exécution" });
    }

    // ⚡ Appel API Fedapay
    const transaction = await fedapay.Transaction.create({
      description: `Retrait vendeur #${withdrawal.seller_id}`,
      amount: withdrawal.amount,
      currency: "XOF",
      customer: {
        // Infos vendeur (numéro, email, nom, etc.)
        email: "vendeur@example.com",
      },
      callback_url: process.env.FEDAPAY_CALLBACK_URL,
    });

    // Vérifier la réponse
    if (!transaction || !transaction.id) {
      return res.status(500).json({ message: "Échec du paiement Fedapay" });
    }

    // Mettre à jour en paid
    const updated = await db.one(
      `UPDATE withdrawals
       SET status = 'paid', processed_at = NOW(), transaction_ref = $2
       WHERE id = $1 RETURNING *`,
      [withdrawal_id, transaction.id]
    );

    return res.json({ message: "Retrait payé avec succès", withdrawal: updated });
  } catch (error) {
    console.error("Erreur processWithdrawal:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
