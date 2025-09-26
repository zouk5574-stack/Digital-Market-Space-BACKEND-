import cron from "node-cron";
import pool from "../config/db.js";

/**
 * Cron job pour confirmer automatiquement les livraisons freelance
 * après expiration du délai admin (par défaut 38h).
 */
cron.schedule("0 * * * *", async () => {
  // ⏰ exécution toutes les heures
  console.log("⏳ Vérification des livraisons freelance en attente...");

  try {
    // Récupérer le délai défini par l’admin
    const settingsRes = await pool.query(
      "SELECT auto_confirm_delay_hours FROM admin_settings LIMIT 1"
    );
    const delayHours = settingsRes.rows[0]?.auto_confirm_delay_hours || 38;

    // Confirmer automatiquement les livraisons expirées
    const result = await pool.query(
      `
      UPDATE freelance_deliveries fd
      SET status = 'confirmed', confirmed_at = NOW()
      FROM freelance_orders fo
      WHERE fd.order_id = fo.id
        AND fd.status = 'delivered'
        AND fo.status = 'in_progress'
        AND fd.delivered_at <= NOW() - ($1 || ' hours')::interval
      RETURNING fd.id, fd.order_id;
      `,
      [delayHours]
    );

    if (result.rowCount > 0) {
      console.log(`✅ ${result.rowCount} livraisons confirmées automatiquement.`);
    } else {
      console.log("ℹ️ Aucune livraison à confirmer automatiquement.");
    }
  } catch (err) {
    console.error("❌ Erreur cron autoConfirmFreelance:", err.message);
  }
});
