import cron from "node-cron";
import db from "../config/db.js";

/**
 * ✅ Cron job : suppression automatique des services freelance inactifs
 * - Drafts vieux de 5 mois → supprimés
 * - Services publiés sans commandes depuis 5 mois → supprimés
 */
cron.schedule("30 3 * * *", async () => {
  console.log("⏳ Vérification auto-suppression services freelance...");

  try {
    // 1) Supprimer les drafts vieux de 5 mois
    const draftDeleted = await db.result(
      `DELETE FROM freelance_services
       WHERE status = 'draft'
       AND created_at <= NOW() - INTERVAL '5 months'`
    );

    if (draftDeleted.rowCount > 0) {
      console.log(`🗑️ ${draftDeleted.rowCount} service(s) draft supprimé(s).`);
    }

    // 2) Supprimer les services publiés mais sans commandes depuis 5 mois
    const inactiveDeleted = await db.result(
      `DELETE FROM freelance_services fs
       WHERE fs.status = 'active'
       AND fs.created_at <= NOW() - INTERVAL '5 months'
       AND NOT EXISTS (
         SELECT 1 FROM freelance_orders fo WHERE fo.service_id = fs.id
       )`
    );

    if (inactiveDeleted.rowCount > 0) {
      console.log(`🗑️ ${inactiveDeleted.rowCount} service(s) actif(s) sans commande supprimé(s).`);
    }

    console.log("✅ Auto-suppression services freelance terminée.");
  } catch (err) {
    console.error("❌ Erreur auto-suppression services freelance:", err.message);
  }
});
