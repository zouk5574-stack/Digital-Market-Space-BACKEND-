import express from "express";
import pool from "../config/db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ✅ Créer une commande produit
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { produit_id, quantite, prix_total } = req.body;
    const utilisateur_id = req.user.id; // récupéré via le token

    const result = await pool.query(
      `INSERT INTO ordres (id, utilisateur_id, produit_id, quantite, prix_total, statut)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'en_attente')
       RETURNING *`,
      [utilisateur_id, produit_id, quantite, prix_total]
    );

    res.status(201).json({ success: true, commande: result.rows[0] });
  } catch (error) {
    console.error("❌ Erreur création commande produit :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

/**
 * ✅ Récupérer toutes les commandes de l’utilisateur connecté
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const utilisateur_id = req.user.id;

    const result = await pool.query(
      `SELECT o.*, p.nom AS produit_nom
       FROM ordres o
       JOIN produits p ON o.produit_id = p.id
       WHERE o.utilisateur_id = $1`,
      [utilisateur_id]
    );

    res.json({ success: true, commandes: result.rows });
  } catch (error) {
    console.error("❌ Erreur récupération commandes :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

/**
 * ✅ Mettre à jour le statut d’une commande
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const result = await pool.query(
      `UPDATE ordres SET statut = $1 WHERE id = $2 RETURNING *`,
      [statut, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Commande introuvable" });
    }

    res.json({ success: true, commande: result.rows[0] });
  } catch (error) {
    console.error("❌ Erreur update commande produit :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

export default router;
