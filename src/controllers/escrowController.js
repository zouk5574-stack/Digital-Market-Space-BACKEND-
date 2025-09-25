// controllers/escrowController.js
const db = require("../config/db");

/**
 * Créer un nouvel escrow après un paiement validé
 */
exports.createEscrow = async (req, res) => {
  const { order_id, buyer_id, seller_id, amount } = req.body;

  try {
    // Récupérer la commission % dans settings (par défaut 10%)
    const settings = await db.oneOrNone("SELECT commission_rate FROM settings LIMIT 1");
    const commissionRate = settings ? settings.commission_rate : 10;

    const commission = (amount * commissionRate) / 100;
    const netAmount = amount - commission;

    // Insérer l’escrow
    const escrow = await db.one(
      `INSERT INTO escrows (order_id, buyer_id, seller_id, amount, commission, net_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [order_id, buyer_id, seller_id, amount, commission, netAmount]
    );

    return res.status(201).json({ message: "Escrow créé avec succès", escrow });
  } catch (error) {
    console.error("Erreur createEscrow:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Confirmer la réception par l’acheteur → libération des fonds au vendeur
 */
exports.confirmEscrow = async (req, res) => {
  const { escrow_id, buyer_id } = req.body;

  try {
    const escrow = await db.oneOrNone(
      "SELECT * FROM escrows WHERE id = $1 AND buyer_id = $2",
      [escrow_id, buyer_id]
    );

    if (!escrow) {
      return res.status(404).json({ message: "Escrow introuvable ou non autorisé" });
    }

    if (escrow.status !== "pending") {
      return res.status(400).json({ message: "Escrow déjà traité" });
    }

    // Mettre à jour l’escrow
    const updated = await db.one(
      `UPDATE escrows 
       SET status = 'released', released_at = NOW(), updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [escrow_id]
    );

    // Créditer le vendeur
    await db.none(
      `UPDATE sellers SET balance = balance + $1 WHERE id = $2`,
      [escrow.net_amount, escrow.seller_id]
    );

    return res.json({ message: "Escrow confirmé et fonds libérés", escrow: updated });
  } catch (error) {
    console.error("Erreur confirmEscrow:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Marquer un litige (admin uniquement)
 */
exports.markDispute = async (req, res) => {
  const { escrow_id } = req.body;

  try {
    const escrow = await db.oneOrNone(
      "SELECT * FROM escrows WHERE id = $1",
      [escrow_id]
    );

    if (!escrow) {
      return res.status(404).json({ message: "Escrow introuvable" });
    }

    if (escrow.status !== "pending") {
      return res.status(400).json({ message: "Impossible de marquer un litige sur un escrow traité" });
    }

    const updated = await db.one(
      `UPDATE escrows
       SET status = 'dispute', updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [escrow_id]
    );

    return res.json({ message: "Escrow marqué en litige", escrow: updated });
  } catch (error) {
    console.error("Erreur markDispute:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
