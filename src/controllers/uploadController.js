// src/controllers/uploadController.js
import db from "../config/db.js";
import fs from "fs";
import path from "path";
import { assignCategory } from "../utils/categoryHelper.js"; // 🔥 Catégorisation auto

// ➕ Upload fichier
export const uploadFile = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    // Catégorisation automatique selon l'extension ou mimetype
    const categoryId = await assignCategory(file.originalname);

    const result = await db.query(
      `INSERT INTO uploads (user_id, file_name, file_type, file_path, category_id, created_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW() + INTERVAL '5 months')
       RETURNING *`,
      [userId, file.filename, file.mimetype, file.path, categoryId]
    );

    res.json({ success: true, file: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur upload :", err);
    res.status(500).json({ message: "Erreur lors de l’upload" });
  }
};

// 📥 Télécharger fichier
export const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT * FROM uploads WHERE id = $1 AND expires_at > NOW()`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Fichier introuvable ou expiré" });
    }

    const file = result.rows[0];
    res.download(path.resolve(file.file_path), file.file_name);
  } catch (err) {
    console.error("❌ Erreur téléchargement :", err);
    res.status(500).json({ message: "Erreur téléchargement" });
  }
};

// 🗑️ Auto-suppression fichiers après expiration (5 mois)
export const cleanupExpiredFiles = async () => {
  try {
    const expired = await db.query(
      `SELECT * FROM uploads WHERE expires_at <= NOW()`
    );

    for (const file of expired.rows) {
      if (fs.existsSync(file.file_path)) {
        fs.unlinkSync(file.file_path);
      }
    }

    await db.query(`DELETE FROM uploads WHERE expires_at <= NOW()`);
    if (expired.rows.length > 0) {
      console.log(`🧹 ${expired.rows.length} fichier(s) supprimé(s) automatiquement`);
    }
  } catch (err) {
    console.error("❌ Erreur cleanup :", err);
  }
};
