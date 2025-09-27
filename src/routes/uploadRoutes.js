// routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// 📂 Config Multer (upload en mémoire ou disque)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // dossier où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ Upload d’un seul fichier
router.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    success: true,
    message: "Fichier uploadé avec succès 🎉",
    file: req.file,
  });
});

// ✅ Upload de plusieurs fichiers
router.post("/uploads", upload.array("files", 5), (req, res) => {
  res.json({
    success: true,
    message: "Fichiers uploadés avec succès 🎉",
    files: req.files,
  });
});

export default router;
