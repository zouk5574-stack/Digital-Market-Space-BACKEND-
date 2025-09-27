import pool from "../config/db.js";
import fs from "fs";
import cron from "node-cron";
import path from "path";

// ⏰ Tous les jours à minuit
cron.schedule("0 0 * * *", async () => {
  console.log("🧹 Nettoyage automatique des fichiers expirés...");

  try {
    // 1. Récupérer les fichiers expirés
    const result = await pool.query(
      `SELECT * FROM uploads WHERE expires_at <= NOW()`
    );

    // 2. Supprimer du système de fichiers
    for (const file of result.rows) {
      const filePath = path.resolve(file.file_path); // chemin absolu
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 3. Supprimer en DB
    await pool.query(`DELETE FROM uploads WHERE expires_at <= NOW()`);

    if (result.rows.length > 0) {
      console.log(`✅ ${result.rows.length} fichier(s) supprimé(s) automatiquement`);
    } else {
      console.log("ℹ️ Aucun fichier expiré à supprimer aujourd’hui");
    }
  } catch (error) {
    console.error("❌ Erreur cleanup uploads:", error);
  }
});
