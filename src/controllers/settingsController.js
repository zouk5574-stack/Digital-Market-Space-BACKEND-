// controllers/settingsController.js
import pool from "../config/db.js";

/**
 * Récupérer tous les réglages admin
 */
export const getAdminSettings = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM admin_settings LIMIT 1");
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Aucun réglage trouvé" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur getAdminSettings:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * Mettre à jour un ou plusieurs réglages admin
 */
export const updateAdminSettings = async (req, res) => {
  try {
    const {
      commission_rate,
      auto_confirm_delay_hours,
      auto_cancel_delay_minutes,
      auto_withdraw_delay_hours,
    } = req.body;

    const result = await pool.query(
      `UPDATE admin_settings
       SET commission_rate = COALESCE($1, commission_rate),
           auto_confirm_delay_hours = COALESCE($2, auto_confirm_delay_hours),
           auto_cancel_delay_minutes = COALESCE($3, auto_cancel_delay_minutes),
           auto_withdraw_delay_hours = COALESCE($4, auto_withdraw_delay_hours),
           updated_at = NOW()
       RETURNING *`,
      [
        commission_rate,
        auto_confirm_delay_hours,
        auto_cancel_delay_minutes,
        auto_withdraw_delay_hours,
      ]
    );

    res.json({
      success: true,
      settings: result.rows[0],
    });
  } catch (err) {
    console.error("Erreur updateAdminSettings:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/* ------------------------------------------------------------------
   🔑 Partie Fedapay (importée depuis adminPaymentController.js)
------------------------------------------------------------------ */

/**
 * Récupérer la configuration Fedapay
 */
export const getPaymentKeys = async (req, res) => {
  try {
    const settings = await pool.query(
      "SELECT fedapay_api_url, fedapay_public_key, fedapay_secret_key FROM settings LIMIT 1"
    );

    if (settings.rows.length === 0) {
      return res.status(404).json({ error: "Configuration Fedapay introuvable" });
    }

    res.json({
      message: "Clés Fedapay récupérées avec succès",
      data: settings.rows[0],
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
    const updated = await pool.query(
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
      data: updated.rows[0],
    });
  } catch (error) {
    console.error("Erreur updatePaymentKeys:", error.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
