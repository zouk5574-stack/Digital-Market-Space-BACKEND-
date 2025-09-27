import pool from "../config/db.js";
import fs from "fs";
import cron from "node-cron";

// ⏰ Tous les jours à minuit
cron.schedule("0 0 * * *", async () => {
  console.log("🧹 Nettoyage automatique des vieux fichiers...");

  try {
    // Sélectionner les fichiers de +90 jours
    const result = await pool.query(
      `SELECT * FROM uploads WHERE created_at < NOW() - INTERVAL '90 days'`
    );

    for (const file of result.rows) {
      // Supprimer du système de fichiers
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      // Supprimer de la base
      await pool.query(`DELETE FROM uploads WHERE id = $1`, [file.id]);
    }

    if (result.rows.length > 0) {
      console.log(`✅ ${result.rows.length} fichier(s) supprimé(s) automatiquement`);
    }
  } catch (error) {
    console.error("Erreur cleanup uploads:", error);
  }
});
