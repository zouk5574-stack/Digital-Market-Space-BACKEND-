import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "../config/db.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 📂 Config Multer (dossier par vendeur)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.user.role !== "vendor") {
      return cb(new Error("Seuls les vendeurs peuvent uploader ❌"));
    }

    const vendorPath = path.join("uploads", req.user.id);
    if (!fs.existsSync(vendorPath)) {
      fs.mkdirSync(vendorPath, { recursive: true });
    }
    cb(null, vendorPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 📂 Détection type fichier
function detectFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) return "image";
  if ([".mp4", ".mov", ".avi", ".mkv"].includes(ext)) return "video";
  if ([".pdf"].includes(ext)) return "document";
  return "autre";
}

// ✅ Vendeur : upload fichier lié à une commande
router.post(
  "/deliveries/upload/:orderId",
  authenticate,
  upload.single("file"),
  async (req, res) => {
    if (req.user.role !== "vendor") {
      return res.status(403).json({ success: false, message: "Accès refusé ❌" });
    }

    const fileUrl = `/uploads/${req.user.id}/${req.file.filename}`;
    const fileType = detectFileType(req.file.filename);
    const { orderId } = req.params;

    try {
      // On récupère buyer_id depuis la commande
      const order = await db.oneOrNone("SELECT buyer_id FROM orders WHERE id = $1", [orderId]);
      if (!order) {
        return res.status(404).json({ success: false, message: "Commande introuvable ❌" });
      }

      await db.none(
        `INSERT INTO deliveries(order_id, vendor_id, buyer_id, filename, url, type)
         VALUES($1, $2, $3, $4, $5, $6)`,
        [orderId, req.user.id, order.buyer_id, req.file.filename, fileUrl, fileType]
      );

      res.json({
        success: true,
        message: "Fichier livré avec succès 🎉",
        url: fileUrl,
        type: fileType,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: "Erreur DB", error: err.message });
    }
  }
);

// ✅ Acheteur : lister ses fichiers livrés
router.get("/deliveries/list/:orderId", authenticate, async (req, res) => {
  if (req.user.role !== "buyer") {
    return res.status(403).json({ success: false, message: "Accès refusé ❌" });
  }

  const { orderId } = req.params;

  try {
    const files = await db.any(
      "SELECT id, filename, url, type, created_at FROM deliveries WHERE order_id = $1 AND buyer_id = $2 ORDER BY created_at DESC",
      [orderId, req.user.id]
    );

    res.json({
      success: true,
      orderId,
      count: files.length,
      files,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur DB", error: err.message });
  }
});

// ✅ Acheteur : télécharger un fichier livré
router.get("/deliveries/download/:deliveryId", authenticate, async (req, res) => {
  if (req.user.role !== "buyer") {
    return res.status(403).json({ success: false, message: "Accès refusé ❌" });
  }

  const { deliveryId } = req.params;

  try {
    const file = await db.oneOrNone(
      "SELECT * FROM deliveries WHERE id = $1 AND buyer_id = $2",
      [deliveryId, req.user.id]
    );

    if (!file) {
      return res.status(403).json({ success: false, message: "Accès refusé ❌" });
    }

    res.download(path.join("uploads", file.vendor_id, file.filename));
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur téléchargement", error: err.message });
  }
});

export default router;
