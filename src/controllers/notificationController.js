import db from "../config/db.js";

/**
 * Envoyer une notification à tous les utilisateurs
 */
export const sendNotification = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "Titre et message requis" });
    }

    // On insère une notif pour tous les utilisateurs
    const users = await db.manyOrNone("SELECT id FROM users");

    for (const user of users) {
      await db.none(
        "INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)",
        [user.id, title, message]
      );
    }

    res.json({ success: true, message: "Notification envoyée à tous les utilisateurs 🚀" });
  } catch (err) {
    console.error("Erreur sendNotification:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * Récupérer les notifications d’un utilisateur
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifs = await db.manyOrNone(
      "SELECT id, title, message, created_at, read FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json(notifs);
  } catch (err) {
    console.error("Erreur getNotifications:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * Marquer une notification comme lue
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.none(
      "UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    res.json({ success: true, message: "Notification marquée comme lue ✅" });
  } catch (err) {
    console.error("Erreur markAsRead:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
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
