import cron from "node-cron";
import db from "../config/db.js";

// Nettoyage des notifications vieilles de 6 mois
cron.schedule("0 0 * * *", async () => {
  try {
    const result = await db.result(
      "DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '6 months'"
    );
    console.log(`🧹 Notifications nettoyées : ${result.rowCount} supprimées`);
  } catch (err) {
    console.error("Erreur cleanupNotifications:", err.message);
  }
});
