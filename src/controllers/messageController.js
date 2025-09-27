/**
 * src/controllers/messageController.js
 *
 * Contrôleur pour la messagerie (texte uniquement).
 * Chaque message est lié à une commande freelance.
 */

import pool from "../config/db.js";

// ✅ Envoyer un message lié à une commande
export const sendMessage = async (req, res) => {
  const { order_id, receiver_id, content } = req.body;
  const sender_id = req.user.id; // l’utilisateur connecté (auth middleware)

  try {
    if (!order_id || !receiver_id || !content) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    const result = await pool.query(
      `INSERT INTO messages (order_id, sender_id, receiver_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [order_id, sender_id, receiver_id, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur envoi message:", error);
    res.status(500).json({ error: "Erreur lors de l’envoi du message" });
  }
};

// ✅ Récupérer tous les messages d’une commande
export const getMessagesByOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const result = await pool.query(
      `SELECT m.*, u.username AS sender_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.order_id = $1
       ORDER BY m.created_at ASC`,
      [orderId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erreur récupération messages:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des messages" });
  }
};

// ✅ Marquer un message comme lu
export const markAsRead = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `UPDATE messages
       SET is_read = true
       WHERE id = $1 AND receiver_id = $2
       RETURNING *`,
      [messageId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Message non trouvé ou non autorisé." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur marquage message:", error);
    res.status(500).json({ error: "Erreur lors du marquage du message" });
  }
};
