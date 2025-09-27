import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// 📂 Définir le stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // dossier où stocker les fichiers
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// ✅ Config Multer
const upload = multer({ storage });

// 🎯 Route pour un seul fichier
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier envoyé" });
  }
  res.json({
    message: "✅ Fichier uploadé avec succès !",
    file: req.file,
  });
});

// 🎯 Route pour plusieurs fichiers
router.post("/uploads", upload.array("files", 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "Aucun fichier envoyé" });
  }
  res.json({
    message: "✅ Fichiers uploadés avec succès !",
    files: req.files,
  });
});

export default router;
