// controllers/freelanceServiceController.js
import db from "../config/db.js";

/**
 * ✅ Créer un service freelance
 */
export const createService = async (req, res) => {
  try {
    const { title, description, price_cents, delivery_time_days } = req.body;
    const sellerId = req.user.id;

    const service = await db.one(
      `INSERT INTO freelance_services (seller_id, title, description, price_cents, delivery_time_days)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [sellerId, title, description, price_cents, delivery_time_days]
    );

    res.status(201).json({ message: "Service créé avec succès", service });
  } catch (err) {
    console.error("Erreur createService:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * ✅ Voir mes services
 */
export const getMyServices = async (req, res) => {
  try {
    const services = await db.any(
      `SELECT * FROM freelance_services WHERE seller_id=$1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(services);
  } catch (err) {
    console.error("Erreur getMyServices:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * ✅ Pause ou supprimer un service
 */
export const updateServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await db.oneOrNone(
      `UPDATE freelance_services SET status=$1, updated_at=NOW()
       WHERE id=$2 AND seller_id=$3 RETURNING *`,
      [status, id, req.user.id]
    );

    if (!updated) return res.status(404).json({ error: "Service introuvable" });
    res.json({ message: "Statut mis à jour", service: updated });
  } catch (err) {
    console.error("Erreur updateServiceStatus:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
