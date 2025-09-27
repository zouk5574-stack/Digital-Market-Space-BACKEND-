// src/controllers/uploadController.js
import db from "../config/db.js";
import fs from "fs";
import path from "path";

// ➕ Upload fichier
export const uploadFile = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    const result = await db.query(
      `INSERT INTO uploads (user_id, file_name, file_type, file_path)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, file.filename, file.mimetype, file.path]
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
    res.status(500).json({ message: "Erreur téléchargement" });
  }
};

// 🗑️ Auto-suppression fichiers expirés
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
    console.log("🧹 Nettoyage des fichiers expirés terminé");
  } catch (err) {
    console.error("❌ Erreur cleanup :", err);
  }
};
