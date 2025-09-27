import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// 📂 Middleware pour vérifier le vendorId
function checkVendor(req, res, next) {
  const { vendorId } = req.query; // ⚠️ récupéré depuis la requête
  if (!vendorId) {
    return res.status(400).json({
      success: false,
      message: "vendorId est requis dans la requête ❌"
    });
  }

  // 📂 Créer un dossier unique pour ce vendeur si nécessaire
  const vendorPath = path.join("uploads", vendorId);
  if (!fs.existsSync(vendorPath)) {
    fs.mkdirSync(vendorPath, { recursive: true });
  }

  req.vendorPath = vendorPath;
  req.vendorId = vendorId;
  next();
}

// 📂 Config Multer (stockage par vendeur)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, req.vendorPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// 🔒 Sécurité : limiter taille & types
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv|pdf/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (extname) cb(null, true);
    else cb(new Error("Format non supporté"));
  },
});

// ✅ Upload d’un seul fichier
router.post("/upload", checkVendor, upload.single("file"), (req, res) => {
  res.json({
    success: true,
    message: "Fichier uploadé avec succès 🎉",
    file: req.file,
    url: `/uploads/${req.vendorId}/${req.file.filename}`
  });
});

// ✅ Upload de plusieurs fichiers
router.post("/uploads", checkVendor, upload.array("files", 10), (req, res) => {
  res.json({
    success: true,
    message: "Fichiers uploadés avec succès 🎉",
    files: req.files.map(f => ({
      ...f,
      url: `/uploads/${req.vendorId}/${f.filename}`
    }))
  });
});

// ✅ Lister fichiers d’un vendeur
router.get("/uploads/list", checkVendor, (req, res) => {
  fs.readdir(req.vendorPath, (err, files) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Erreur lecture dossier",
        error: err.message
      });
    }
    res.json({
      success: true,
      vendorId: req.vendorId,
      count: files.length,
      files: files.map(f => ({
        name: f,
        url: `/uploads/${req.vendorId}/${f}`
      }))
    });
  });
});

// ✅ Supprimer un fichier d’un vendeur
router.delete("/uploads/:filename", checkVendor, (req, res) => {
  const filePath = path.join(req.vendorPath, req.params.filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(404).json({
        success: false,
        message: "Fichier introuvable ou déjà supprimé ❌"
      });
    }
    res.json({
      success: true,
      message: `Fichier ${req.params.filename} supprimé avec succès 🗑️`
    });
  });
});

export default router;
