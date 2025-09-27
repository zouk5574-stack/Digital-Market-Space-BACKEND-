/**
 * src/middleware/upload.js
 *
 * Middleware pour gérer l’upload des fichiers (images, PDF, rendus freelances...).
 * Utilise multer (stockage local par défaut).
 */

import multer from "multer";
import path from "path";
import fs from "fs";

// 📂 Dossier de stockage
const UPLOADS_DIR = "uploads";

// Vérifie que le dossier existe sinon on le crée
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ⚙️ Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Exemple : 1695748392023-originalname.png
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

// ✅ Filtrage des fichiers autorisés
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
    "application/zip",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Type de fichier non autorisé"), false);
  }
};

// 📦 Middleware Multer
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10 Mo
  fileFilter,
});

export default upload;
