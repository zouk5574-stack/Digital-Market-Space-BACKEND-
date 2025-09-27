import pool from "../config/db.js";
import fs from "fs";
import cron from "node-cron";
import path from "path";

// ⏰ Tâche CRON → tous les jours à minuit
cron.schedule("0 0 * * *", async () => {
  console.log("🧹 Nettoyage automatique des fichiers de plus de 5 mois...");

  try {
    // 1. Sélectionner les fichiers ayant plus de 5 mois
    const result = await pool.query(
      `SELECT * FROM uploads WHERE created_at < NOW() - INTERVAL '5 months'`
    );

    // 2. Supprimer du système de fichiers
    for (const file of result.rows) {
      const filePath = path.resolve(file.file_path); // sécurité chemin
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Fichier supprimé: ${file.file_path}`);
      }
    }

    // 3. Supprimer en DB
    await pool.query(
      `DELETE FROM uploads WHERE created_at < NOW() - INTERVAL '5 months'`
    );

    if (result.rows.length > 0) {
      console.log(`✅ ${result.rows.length} fichier(s) supprimé(s) automatiquement`);
    } else {
      console.log("ℹ️ Aucun fichier vieux de plus de 5 mois trouvé");
    }
  } catch (error) {
    console.error("❌ Erreur lors du cleanup des fichiers :", error);
  }
});
