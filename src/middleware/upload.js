import// src/middleware/upload.js
import multer from "multer";
import path from "path";

// 📂 Dossier où stocker les fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// ✅ Filtre : accepte images, vidéos, docs
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg", "image/png", "image/gif",
    "video/mp4", "video/mpeg", "video/quicktime",
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format de fichier non supporté"), false);
  }
};

export const upload = multer({ storage, fileFilter });
