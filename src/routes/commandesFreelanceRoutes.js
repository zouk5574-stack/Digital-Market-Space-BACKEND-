import express from "express";
import pool from "../config/db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ✅ Créer une commande freelance
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { service_id, vendeur_id, prix } = req.body;
    const acheteur_id = req.user.id;

    const result = await pool.query(
      `INSERT INTO commandes_freelance (id, acheteur_id, vendeur_id, service_id, prix, statut)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'en_attente')
       RETURNING *`,
      [acheteur_id, vendeur_id, service_id, prix]
    );

    res.status(201).json({ success: true, commande: result.rows[0] });
  } catch (error) {
    console.error("❌ Erreur création commande freelance :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

/**
 * ✅ Récupérer toutes les commandes d’un utilisateur (acheteur ou vendeur)
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const utilisateur_id = req.user.id;

    const result = await pool.query(
      `SELECT cf.*, s.titre AS service_nom
       FROM commandes_freelance cf
       JOIN services s ON cf.service_id = s.id
       WHERE cf.acheteur_id = $1 OR cf.vendeur_id = $1`,
      [utilisateur_id]
    );

    res.json({ success: true, commandes: result.rows });
  } catch (error) {
    console.error("❌ Erreur récupération commandes freelance :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

/**
 * ✅ Mettre à jour le statut d’une commande freelance
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const result = await pool.query(
      `UPDATE commandes_freelance SET statut = $1 WHERE id = $2 RETURNING *`,
      [statut, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Commande introuvable" });
    }

    res.json({ success: true, commande: result.rows[0] });
  } catch (error) {
    console.error("❌ Erreur update commande freelance :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

export default router;
