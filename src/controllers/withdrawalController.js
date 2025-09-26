import { query } from '../config/db.js';
import { createPayout } from '../config/fedapay.js';

export async function requestWithdraw(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const { amount, currency = 'USD', provider_data } = req.body;
    if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const b = await query('SELECT balance FROM users WHERE id=$1', [user.id]);
    const bal = Number(b.rows[0]?.balance || 0);
    if (bal < Number(amount)) return res.status(400).json({ error: 'Insufficient balance' });

    // reserve funds immediately
    await query('UPDATE users SET balance = balance - $1 WHERE id=$2', [amount, user.id]);
    const w = await query('INSERT INTO withdrawals (seller_id, amount, currency, provider, status, requested_at) VALUES ($1,$2,$3,$4,$5,now()) RETURNING *', [user.id, amount, currency, 'fedapay', 'requested']);

    // Optionally auto-create payout using createPayout(provider_data) depending on settings/verification

    res.status(201).json({ withdrawal: w.rows[0] });
  } catch (err) {
    console.error('requestWithdraw', err);
    res.status(500).json({ error: 'Server error' });
  }
}
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
