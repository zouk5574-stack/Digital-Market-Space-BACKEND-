import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "../config/db.js"; // ⚡ Connexion PostgreSQL

const router = express.Router();

// 📂 Middleware pour vérifier le vendorId
function checkVendor(req, res, next) {
  const { vendorId } = req.query;
  if (!vendorId) {
    return res.status(400).json({
      success: false,
      message: "vendorId est requis ❌"
    });
  }

  const vendorPath = path.join("uploads", vendorId);
  if (!fs.existsSync(vendorPath)) {
    fs.mkdirSync(vendorPath, { recursive: true });
  }

  req.vendorPath = vendorPath;
  req.vendorId = vendorId;
  next();
}

// 📂 Config Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, req.vendorPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// 🔒 Sécurité
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv|pdf/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (extname) cb(null, true);
    else cb(new Error("Format non supporté ❌"));
  },
});

// 📂 Fonction utilitaire → détecter type
function detectFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) return "image";
  if ([".mp4", ".mov", ".avi", ".mkv"].includes(ext)) return "video";
  if ([".pdf"].includes(ext)) return "document";
  return "autre";
}

// ✅ Upload 1 fichier
router.post("/upload", checkVendor, upload.single("file"), async (req, res) => {
  const fileUrl = `/uploads/${req.vendorId}/${req.file.filename}`;
  const fileType = detectFileType(req.file.filename);

  try {
    await db.none(
      "INSERT INTO uploads(vendor_id, filename, url, type) VALUES($1, $2, $3, $4)",
      [req.vendorId, req.file.filename, fileUrl, fileType]
    );

    res.json({
      success: true,
      message: "Fichier uploadé et enregistré 🎉",
      file: req.file,
      url: fileUrl,
      type: fileType
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur DB", error: err.message });
  }
});

// ✅ Upload plusieurs fichiers
router.post("/uploads", checkVendor, upload.array("files", 10), async (req, res) => {
  const filesData = req.files.map(f => ({
    filename: f.filename,
    url: `/uploads/${req.vendorId}/${f.filename}`,
    type: detectFileType(f.filename)
  }));

  try {
    const queries = filesData.map(f =>
      db.none(
        "INSERT INTO uploads(vendor_id, filename, url, type) VALUES($1, $2, $3, $4)",
        [req.vendorId, f.filename, f.url, f.type]
      )
    );
    await Promise.all(queries);

    res.json({
      success: true,
      message: "Fichiers uploadés et enregistrés 🎉",
      files: filesData,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur DB", error: err.message });
  }
});

// ✅ Lister fichiers d’un vendeur
router.get("/uploads/list", checkVendor, async (req, res) => {
  try {
    const files = await db.any(
      "SELECT id, filename, url, type, created_at FROM uploads WHERE vendor_id = $1 ORDER BY created_at DESC",
      [req.vendorId]
    );

    res.json({
      success: true,
      vendorId: req.vendorId,
      count: files.length,
      files,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur DB", error: err.message });
  }
});

// ✅ Supprimer un fichier (DB + disque)
router.delete("/uploads/:filename", checkVendor, async (req, res) => {
  const filePath = path.join(req.vendorPath, req.params.filename);

  try {
    const result = await db.result(
      "DELETE FROM uploads WHERE vendor_id = $1 AND filename = $2",
      [req.vendorId, req.params.filename]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Fichier introuvable dans la base ❌"
      });
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(404).json({
          success: false,
          message: "Fichier introuvable sur le disque ❌"
        });
      }

      res.json({
        success: true,
        message: `Fichier ${req.params.filename} supprimé avec succès 🗑️`
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur DB", error: err.message });
  }
});

export default router;
