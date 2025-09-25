// src/middleware/errorHandler.js
export default function errorHandler(err, req, res, next) {
  console.error("❌ Erreur capturée:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Erreur serveur interne",
  });
}
