// controllers/freelanceOrderController.js
import db from "../config/db.js";

/**
 * ✅ Créer une commande freelance
 */
export const createOrder = async (req, res) => {
  try {
    const { service_id, requirements } = req.body;
    const buyerId = req.user.id;

    const service = await db.oneOrNone(
      `SELECT * FROM freelance_services WHERE id=$1 AND status='active'`,
      [service_id]
    );
    if (!service) return res.status(404).json({ error: "Service introuvable" });

    // 💰 Commission
    const settings = await db.oneOrNone("SELECT commission_rate FROM settings LIMIT 1");
    const commissionRate = settings ? settings.commission_rate : 10;
    const isAdminSeller = await db.oneOrNone(
      "SELECT role FROM users WHERE id=$1",
      [service.seller_id]
    );
    const commission = isAdminSeller?.role === "admin"
      ? 0
      : Math.floor((service.price_cents * commissionRate) / 100);
    const net = service.price_cents - commission;

    const order = await db.one(
      `INSERT INTO freelance_orders (service_id, buyer_id, seller_id, price_cents, commission_cents, net_cents, requirements, status, auto_confirm_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'in_progress', NOW() + interval '5 days')
       RETURNING *`,
      [service.id, buyerId, service.seller_id, service.price_cents, commission, net, requirements]
    );

    res.status(201).json({ message: "Commande créée", order });
  } catch (err) {
    console.error("Erreur createOrder:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * ✅ Livraison par le vendeur
 */
export const deliverOrder = async (req, res) => {
  try {
    const { order_id, delivery_url } = req.body;
    const sellerId = req.user.id;

    const order = await db.oneOrNone(
      "SELECT * FROM freelance_orders WHERE id=$1 AND seller_id=$2",
      [order_id, sellerId]
    );
    if (!order) return res.status(404).json({ error: "Commande introuvable" });

    const updated = await db.one(
      `UPDATE freelance_orders SET delivery_url=$1, delivered_at=NOW(), status='delivered', updated_at=NOW()
       WHERE id=$2 RETURNING *`,
      [delivery_url, order_id]
    );

    res.json({ message: "Travail livré", order: updated });
  } catch (err) {
    console.error("Erreur deliverOrder:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * ✅ Confirmation par l’acheteur
 */
export const confirmOrder = async (req, res) => {
  try {
    const { order_id } = req.body;
    const buyerId = req.user.id;

    const order = await db.oneOrNone(
      "SELECT * FROM freelance_orders WHERE id=$1 AND buyer_id=$2",
      [order_id, buyerId]
    );
    if (!order) return res.status(404).json({ error: "Commande introuvable" });

    if (order.status !== "delivered") {
      return res.status(400).json({ error: "Commande non livrée" });
    }

    const updated = await db.one(
      `UPDATE freelance_orders
       SET status='completed', confirmed_at=NOW(), updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [order_id]
    );

    // 💰 créditer le vendeur
    await db.none(
      `UPDATE sellers SET balance=balance+$1 WHERE id=$2`,
      [order.net_cents, order.seller_id]
    );

    res.json({ message: "Commande confirmée", order: updated });
  } catch (err) {
    console.error("Erreur confirmOrder:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
