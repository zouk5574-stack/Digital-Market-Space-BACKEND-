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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 Mo
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv|pdf/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (extname) cb(null, true);
    else cb(new Error("Format non supporté ❌"));
  },
});

// 📂 Détection type fichier
function detectFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) return "image";
  if ([".mp4", ".mov", ".avi", ".mkv"].includes(ext)) return "video";
  if ([".pdf"].includes(ext)) return "document";
  return "autre";
}

//
// 🚀 ROUTES
//

// ✅ Vendeur : upload fichier lié à une commande
router.post("/deliveries/upload/:orderId", checkVendor, upload.single("file"), async (req, res) => {
  const fileUrl = `/uploads/${req.vendorId}/${req.file.filename}`;
  const fileType = detectFileType(req.file.filename);
  const { orderId } = req.params;

  try {
    // On récupère buyer_id depuis la table orders
    const order = await db.oneOrNone("SELECT buyer_id FROM orders WHERE id = $1", [orderId]);
    if (!order) {
      return res.status(404).json({ success: false, message: "Commande introuvable ❌" });
    }

    await db.none(
      `INSERT INTO deliveries(order_id, vendor_id, buyer_id, filename, url, type)
       VALUES($1, $2, $3, $4, $5, $6)`,
      [orderId, req.vendorId, order.buyer_id, req.file.filename, fileUrl, fileType]
    );

    res.json({
      success: true,
      message: "Fichier livré avec succès 🎉",
      url: fileUrl,
      type: fileType
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur DB", error: err.message });
  }
});

// ✅ Acheteur : lister fichiers livrés pour une commande
router.get("/deliveries/list/:orderId", async (req, res) => {
  const buyerId = req.query.buyerId; // ⚠️ à sécuriser via JWT dans la vraie vie
  const { orderId } = req.params;

  try {
    const files = await db.any(
      "SELECT id, filename, url, type, created_at FROM deliveries WHERE order_id = $1 AND buyer_id = $2 ORDER BY created_at DESC",
      [orderId, buyerId]
    );

    res.json({
      success: true,
      orderId,
      count: files.length,
      files
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur DB", error: err.message });
  }
});

// ✅ Acheteur : télécharger un fichier livré
router.get("/deliveries/download/:deliveryId", async (req, res) => {
  const buyerId = req.query.buyerId; // ⚠️ à sécuriser via token
  const { deliveryId } = req.params;

  try {
    const file = await db.oneOrNone(
      "SELECT * FROM deliveries WHERE id = $1 AND buyer_id = $2",
      [deliveryId, buyerId]
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
