import express from "express";
import upload from "../middleware/upload.js";
import { auth } from "../middleware/auth.js";
import pool from "../config/db.js";
import fs from "fs";

const router = express.Router();

// ✅ Upload multiple illimité (images/vidéos/documents)
router.post("/multiple", auth, upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "Aucun fichier reçu" });
  }

  try {
    const savedFiles = [];

    for (const file of req.files) {
      const result = await pool.query(
        `INSERT INTO uploads (user_id, filename, mimetype, path, size, type, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [
          req.user.id,
          file.filename,
          file.mimetype,
          file.path,
          file.size,
          file.mimetype.startsWith("video/") ? "video" : "image",
        ]
      );

      savedFiles.push(result.rows[0]);
    }

    res.json({
      success: true,
      message: "Fichiers uploadés et enregistrés en base 🎉",
      files: savedFiles,
    });
  } catch (error) {
    console.error("Erreur upload:", error);
    res.status(500).json({ error: "Erreur lors de l’upload" });
  }
});

// ✅ Supprimer un fichier (par le vendeur lui-même)
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifie si le fichier appartient à l’utilisateur
    const result = await pool.query(
      `SELECT * FROM uploads WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Fichier non trouvé ou non autorisé" });
    }

    const file = result.rows[0];

    // Supprimer du système de fichiers
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Supprimer de la base
    await pool.query(`DELETE FROM uploads WHERE id = $1`, [id]);

    res.json({ success: true, message: "Fichier supprimé avec succès ✅" });
  } catch (error) {
    console.error("Erreur suppression fichier:", error);
    res.status(500).json({ error: "Erreur lors de la suppression du fichier" });
  }
});

export default router;
