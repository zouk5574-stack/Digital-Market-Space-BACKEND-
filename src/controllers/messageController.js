import { query } from "../config/db.js";

// ✅ Envoyer un message
export const sendMessage = async (req, res) => {
  const { receiver_id, content } = req.body;
  const sender_id = req.user.id;

  try {
    if (!receiver_id || !content) {
      return res.status(400).json({ error: "Receiver et message obligatoires" });
    }

    const result = await query(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [sender_id, receiver_id, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erreur envoi message :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ✅ Récupérer la conversation entre 2 utilisateurs
export const getConversation = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  try {
    const result = await query(
      `SELECT * FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [currentUserId, userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Erreur récupération conversation :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ✅ Lister les messages reçus
export const getInbox = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await query(
      `SELECT m.*, u.username AS sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.receiver_id = $1
       ORDER BY m.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Erreur récupération inbox :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ✅ Marquer comme lu
export const markAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await query(
      `UPDATE messages
       SET is_read = true
       WHERE id = $1 AND receiver_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Message introuvable" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erreur marquage message :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
