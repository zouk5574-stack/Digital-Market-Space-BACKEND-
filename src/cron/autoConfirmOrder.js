import cron from "node-cron";
import db from "../config/db.js";

// ✅ Chaque heure : vérifie les commandes produits non confirmées
cron.schedule("30 * * * *", async () => {
  console.log("⏳ Vérification des commandes produits non confirmées...");

  try {
    const settings = await db.oneOrNone(
      "SELECT confirmation_delay_hours FROM admin_settings LIMIT 1"
    );
    const delay = settings ? settings.confirmation_delay_hours : 38;

    const orders = await db.manyOrNone(
      `SELECT o.*, u.role
       FROM orders o
       JOIN users u ON u.id = o.seller_id
       WHERE o.status = 'delivered'
       AND o.updated_at <= NOW() - ($1 || ' hours')::INTERVAL`,
      [delay]
    );

    for (const order of orders) {
      let commissionRate = 10;
      if (order.role === "admin") commissionRate = 0;

      const commission = (order.total_amount * commissionRate) / 100;
      const netAmount = order.total_amount - commission;

      await db.none(
        `UPDATE orders
         SET status = 'completed', completed_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [order.id]
      );

      await db.none(
        `UPDATE sellers
         SET balance = balance + $1
         WHERE id = $2`,
        [netAmount, order.seller_id]
      );

      console.log(`✅ Commande produit ${order.id} confirmée automatiquement.`);
    }
  } catch (err) {
    console.error("❌ Erreur cron autoConfirmOrders:", err.message);
  }
});
