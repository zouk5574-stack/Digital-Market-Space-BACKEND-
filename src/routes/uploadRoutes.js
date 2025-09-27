import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

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

// 🔒 Sécurité : limiter taille & types (images + vidéos + pdf)
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // max 50 MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv|pdf/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (extname) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Format de fichier non supporté (jpg, png, gif, mp4, mov, avi, mkv, pdf uniquement)"
        )
      );
    }
  },
});

// ✅ Upload d’un seul fichier
router.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    success: true,
    message: "Fichier uploadé avec succès 🎉",
    file: req.file,
    url: `/uploads/${req.file.filename}`
  });
});

// ✅ Upload de plusieurs fichiers
router.post("/uploads", upload.array("files", 10), (req, res) => {
  res.json({
    success: true,
    message: "Fichiers uploadés avec succès 🎉",
    files: req.files.map(f => ({
      ...f,
      url: `/uploads/${f.filename}`
    }))
  });
});

// ✅ Lister tous les fichiers uploadés
router.get("/uploads/list", (req, res) => {
  fs.readdir("uploads/", (err, files) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la lecture du dossier uploads",
        error: err.message
      });
    }

    const fileList = files.map(filename => ({
      name: filename,
      url: `/uploads/${filename}`
    }));

    res.json({
      success: true,
      count: files.length,
      files: fileList
    });
  });
});

export default router;
