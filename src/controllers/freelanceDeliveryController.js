import db from "../config/db.js";

/**
 * 🛠️ Le freelance livre un travail
 */
export const deliverWork = async (req, res) => {
  const { order_id, seller_id, file_url, note } = req.body;

  try {
    // Vérif commande
    const order = await db.oneOrNone(
      "SELECT * FROM freelance_orders WHERE id = $1 AND seller_id = $2",
      [order_id, seller_id]
    );

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable ou non autorisée" });
    }

    // Vérifie que pas déjà livré
    const already = await db.oneOrNone(
      "SELECT * FROM freelance_deliveries WHERE order_id = $1",
      [order_id]
    );

    if (already) {
      return res.status(400).json({ message: "Travail déjà livré" });
    }

    // Insère la livraison
    const delivery = await db.one(
      `INSERT INTO freelance_deliveries (order_id, seller_id, file_url, note, status, delivered_at)
       VALUES ($1, $2, $3, $4, 'delivered', NOW())
       RETURNING *`,
      [order_id, seller_id, file_url, note]
    );

    return res.status(201).json({ message: "Travail livré avec succès 🎉", delivery });
  } catch (err) {
    console.error("Erreur deliverWork:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * ✅ L’acheteur confirme la réception
 */
export const confirmDelivery = async (req, res) => {
  const { delivery_id, buyer_id } = req.body;

  try {
    const delivery = await db.oneOrNone(
      `SELECT fd.*, fo.buyer_id, fo.amount, fo.seller_id
       FROM freelance_deliveries fd
       JOIN freelance_orders fo ON fo.id = fd.order_id
       WHERE fd.id = $1`,
      [delivery_id]
    );

    if (!delivery) {
      return res.status(404).json({ message: "Livraison introuvable" });
    }

    if (delivery.buyer_id !== buyer_id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    if (delivery.status === "confirmed") {
      return res.status(400).json({ message: "Déjà confirmé" });
    }

    // Commission (sauf admin)
    const seller = await db.one("SELECT role FROM users WHERE id = $1", [
      delivery.seller_id,
    ]);
    let commissionRate = 10; // par défaut
    if (seller.role === "admin") commissionRate = 0;

    const commission = (delivery.amount * commissionRate) / 100;
    const netAmount = delivery.amount - commission;

    // Met à jour la livraison
    const updated = await db.one(
      `UPDATE freelance_deliveries
       SET status = 'confirmed', confirmed_at = NOW()
       WHERE id = $1 RETURNING *`,
      [delivery_id]
    );

    // Créditer le vendeur
    await db.none(
      `UPDATE sellers SET balance = balance + $1 WHERE id = $2`,
      [netAmount, delivery.seller_id]
    );

    return res.json({
      message: "Livraison confirmée ✅, fonds libérés",
      delivery: updated,
    });
  } catch (err) {
    console.error("Erreur confirmDelivery:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
