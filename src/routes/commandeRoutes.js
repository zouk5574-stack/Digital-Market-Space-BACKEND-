import express from "express";
import pool from "../config/db.js"; // connexion PostgreSQL
const router = express.Router();

/**
 * ✅ Créer une nouvelle commande freelance
 */
router.post("/", async (req, res) => {
  try {
    const { utilisateur_id, produit_id, montant } = req.body;

    if (!utilisateur_id || !produit_id || !montant) {
      return res.status(400).json({ error: "Données incomplètes" });
    }

    const result = await pool.query(
      `INSERT INTO commandes_freelance (utilisateur_id, produit_id, montant, statut) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [utilisateur_id, produit_id, montant, "en_attente"]
    );

    res.status(201).json({
      success: true,
      commande: result.rows[0],
    });
  } catch (err) {
    console.error("Erreur création commande:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * ✅ Récupérer toutes les commandes d’un utilisateur
 */
router.get("/utilisateur/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.*, p.nom AS produit_nom, p.type AS produit_type
       FROM commandes_freelance c
       JOIN produits p ON c.produit_id = p.id
       WHERE c.utilisateur_id = $1
       ORDER BY c.date_creation DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Erreur récupération commandes utilisateur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * ✅ Récupérer une commande par son ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.*, u.nom AS acheteur_nom, p.nom AS produit_nom
       FROM commandes_freelance c
       JOIN utilisateurs u ON c.utilisateur_id = u.id
       JOIN produits p ON c.produit_id = p.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Commande introuvable" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur récupération commande:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * ✅ Mettre à jour le statut d’une commande
 */
router.put("/:id/statut", async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    if (!statut) {
      return res.status(400).json({ error: "Statut requis" });
    }

    const result = await pool.query(
      `UPDATE commandes_freelance
       SET statut = $1
       WHERE id = $2
       RETURNING *`,
      [statut, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Commande introuvable" });
    }

    res.json({
      success: true,
      commande: result.rows[0],
    });
  } catch (err) {
    console.error("Erreur mise à jour statut commande:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
