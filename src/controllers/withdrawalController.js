import { query } from "../config/db.js";

/**
 * Demander un retrait
 */
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, payment_method } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Montant invalide" });
    }

    if (!payment_method) {
      return res.status(400).json({ message: "Méthode de paiement requise" });
    }

    // Vérifier le solde disponible du vendeur
    const salesRes = await query(
      "SELECT SUM(total_amount) AS total_sales FROM orders WHERE seller_id = $1 AND status = 'paid'",
      [req.user.id]
    );
    const totalSales = parseFloat(salesRes.rows[0].total_sales) || 0;

    const withdrawalsRes = await query(
      "SELECT SUM(amount) AS total_withdrawn FROM withdrawals WHERE user_id = $1 AND status = 'approved'",
      [req.user.id]
    );
    const totalWithdrawn = parseFloat(withdrawalsRes.rows[0].total_withdrawn) || 0;

    const availableBalance = totalSales - totalWithdrawn;

    if (amount > availableBalance) {
      return res.status(400).json({ message: "Solde insuffisant pour ce retrait" });
    }

    // Vérifier si l’admin a activé l’auto-confirmation
    const settingsRes = await query("SELECT auto_withdrawals FROM admin_settings LIMIT 1");
    const autoWithdrawals = settingsRes.rows[0]?.auto_withdrawals || false;

    const status = autoWithdrawals ? "approved" : "pending";

    const result = await query(
      `INSERT INTO withdrawals (user_id, amount, payment_method, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, amount, payment_method, status, created_at`,
      [req.user.id, amount, payment_method, status]
    );

    res.status(201).json({
      message: autoWithdrawals
        ? "Retrait automatiquement confirmé ✅"
        : "Demande de retrait en attente ⏳",
      withdrawal: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur demande retrait :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Voir mes retraits
 */
export const getMyWithdrawals = async (req, res) => {
  try {
    const result = await query(
      "SELECT id, amount, payment_method, status, created_at FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erreur récupération retraits :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Admin : approuver ou rejeter un retrait manuellement
 */
export const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const result = await query(
      "UPDATE withdrawals SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Retrait introuvable" });
    }

    res.json({
      message: `Retrait ${status}`,
      withdrawal: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur mise à jour retrait :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
