// controllers/notificationController.js
import db from "../config/db.js";

/**
 * Créer une nouvelle notification globale (admin uniquement)
 */
export async function createNotification(req, res) {
  const { title, message } = req.body;

  try {
    const notif = await db.one(
      `INSERT INTO notifications (title, message, is_global)
       VALUES ($1, $2, true) RETURNING *`,
      [title, message]
    );

    // Associer à tous les utilisateurs
    await db.none(
      `INSERT INTO user_notifications (user_id, notification_id)
       SELECT id, $1 FROM users`,
      [notif.id]
    );

    res.status(201).json({ message: "Notification créée et envoyée ✅", notif });
  } catch (error) {
    console.error("Erreur createNotification:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * Récupérer les notifications d’un utilisateur
 */
export async function getUserNotifications(req, res) {
  const userId = req.user.id;

  try {
    const notifications = await db.manyOrNone(
      `SELECT n.id, n.title, n.message, un.is_read, n.created_at
       FROM notifications n
       JOIN user_notifications un ON un.notification_id = n.id
       WHERE un.user_id = $1
       ORDER BY n.created_at DESC`,
      [userId]
    );

    res.json({ notifications });
  } catch (error) {
    console.error("Erreur getUserNotifications:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * Marquer une notification comme lue
 */
export async function markAsRead(req, res) {
  const { notificationId } = req.body;
  const userId = req.user.id;

  try {
    await db.none(
      `UPDATE user_notifications SET is_read = true WHERE user_id = $1 AND notification_id = $2`,
      [userId, notificationId]
    );

    res.json({ message: "Notification marquée comme lue ✅" });
  } catch (error) {
    console.error("Erreur markAsRead:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
