import cron from "node-cron";
import { query } from "../config/db.js";

// ✅ Maintenance quotidienne (02h00 UTC)
cron.schedule("0 2 * * *", async () => {
  try {
    console.log("⏳ [cron] Lancement des tâches de maintenance...");

    // 1) Archiver les produits inactifs ou peu performants
    const toArchive = await query(
      `SELECT id, status, created_at, total_sales, title, seller_id, price
       FROM products
       WHERE 
         (status = 'draft' AND created_at < NOW() - INTERVAL '4 months')
         OR 
         (created_at < NOW() - INTERVAL '4 months' AND total_sales < 40)`
    );

    for (const p of toArchive.rows) {
      // Stocker l’ancien produit dans les archives
      await query(
        `INSERT INTO archives (original_table, original_id, payload, reason, archived_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        ["products", p.id, JSON.stringify(p), "auto-archive-inactive-4months"]
      );

      // Marquer le produit comme archivé
      await query(`UPDATE products SET status = $1 WHERE id = $2`, [
        "archived",
        p.id,
      ]);

      console.log(`📦 Produit ${p.id} archivé automatiquement`);
    }

    // 2) Supprimer les archives trop anciennes
    const deleted = await query(
      `DELETE FROM archives WHERE archived_at < NOW() - INTERVAL '6 months' RETURNING id`
    );

    if (deleted.rows.length > 0) {
      console.log(`🗑️ ${deleted.rows.length} archives supprimées (plus de 6 mois)`);
    }

    console.log("✅ [cron] Maintenance terminée");
  } catch (err) {
    console.error("❌ [cron] Erreur maintenance :", err.message);
  }
});
