// controllers/adminPaymentController.js
import db from "../config/db.js";

/**
 * Récupérer la configuration Fedapay
 */
export const getPaymentKeys = async (req, res) => {
  try {
    const settings = await db.oneOrNone(
      "SELECT fedapay_api_url, fedapay_public_key, fedapay_secret_key FROM settings LIMIT 1"
    );

    if (!settings) {
      return res.status(404).json({ error: "Configuration Fedapay introuvable" });
    }

    res.json({
      message: "Clés Fedapay récupérées avec succès",
      data: settings,
    });
  } catch (error) {
    console.error("Erreur getPaymentKeys:", error.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * Mettre à jour les clés Fedapay
 */
export const updatePaymentKeys = async (req, res) => {
  const { fedapay_api_url, fedapay_public_key, fedapay_secret_key } = req.body;

  try {
    const updated = await db.one(
      `UPDATE settings
       SET 
         fedapay_api_url = COALESCE($1, fedapay_api_url),
         fedapay_public_key = COALESCE($2, fedapay_public_key),
         fedapay_secret_key = COALESCE($3, fedapay_secret_key),
         updated_at = NOW()
       RETURNING fedapay_api_url, fedapay_public_key, fedapay_secret_key`,
      [fedapay_api_url, fedapay_public_key, fedapay_secret_key]
    );

    res.json({
      message: "Clés Fedapay mises à jour avec succès",
      data: updated,
    });
  } catch (error) {
    console.error("Erreur updatePaymentKeys:", error.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
