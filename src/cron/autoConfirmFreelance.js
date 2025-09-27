import cron from "node-cron";
import db from "../config/db.js";

cron.schedule("0 * * * *", async () => {
  console.log("⏳ Vérification des livraisons freelance non confirmées...");

  try {
    const settings = await db.oneOrNone(
      "SELECT confirmation_delay_hours, auto_confirm_freelance FROM admin_settings LIMIT 1"
    );

    if (!settings?.auto_confirm_freelance) {
      console.log("⚠️ Auto-confirmation freelance désactivée par l'admin.");
      return;
    }

    const delay = settings.confirmation_delay_hours || 38;

    const deliveries = await db.manyOrNone(
      `SELECT fd.*, fo.buyer_id, fo.amount, fo.seller_id, u.role
       FROM freelance_deliveries fd
       JOIN freelance_orders fo ON fo.id = fd.order_id
       JOIN users u ON u.id = fo.seller_id
       WHERE fd.status = 'delivered'
       AND fd.delivered_at <= NOW() - ($1 || ' hours')::INTERVAL`,
      [delay]
    );

    for (const delivery of deliveries) {
      let commissionRate = 10;
      if (delivery.role === "admin") commissionRate = 0;

      const commission = (delivery.amount * commissionRate) / 100;
      const netAmount = delivery.amount - commission;

      await db.none(
        `UPDATE freelance_deliveries
         SET status = 'confirmed', confirmed_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [delivery.id]
      );

      await db.none(
        `UPDATE sellers
         SET balance = balance + $1
         WHERE id = $2`,
        [netAmount, delivery.seller_id]
      );

      console.log(`✅ Livraison freelance ${delivery.id} confirmée automatiquement.`);
    }
  } catch (err) {
    console.error("❌ Erreur cron autoConfirmFreelance:", err.message);
  }
});
