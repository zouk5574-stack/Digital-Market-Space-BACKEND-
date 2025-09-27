import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// 📂 Config Multer (stockage disque)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// 🔒 Sécurité : limiter taille & type
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5 MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      cb(null, true);
    } else {
      cb(new Error("Format de fichier non supporté (jpg, png, pdf uniquement)"));
    }
  },
});

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
