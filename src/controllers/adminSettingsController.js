import pool from "../config/db.js";

/**
 * ✅ Récupérer les paramètres actuels
 */
export const getSettings = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT auto_confirm_delay_hours, auto_withdraw_delay_hours, updated_at FROM admin_settings LIMIT 1"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Paramètres introuvables" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur getSettings:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * ✅ Mettre à jour les paramètres
 */
export const updateSettings = async (req, res) => {
  try {
    const { auto_confirm_delay_hours, auto_withdraw_delay_hours } = req.body;

    if (
      (auto_confirm_delay_hours && (isNaN(auto_confirm_delay_hours) || auto_confirm_delay_hours < 1)) ||
      (auto_withdraw_delay_hours && (isNaN(auto_withdraw_delay_hours) || auto_withdraw_delay_hours < 1))
    ) {
      return res.status(400).json({ error: "Valeurs invalides" });
    }

    const result = await pool.query(
      `UPDATE admin_settings
       SET 
         auto_confirm_delay_hours = COALESCE($1, auto_confirm_delay_hours),
         auto_withdraw_delay_hours = COALESCE($2, auto_withdraw_delay_hours),
         updated_at = NOW()
       RETURNING auto_confirm_delay_hours, auto_withdraw_delay_hours, updated_at`,
      [auto_confirm_delay_hours, auto_withdraw_delay_hours]
    );

    res.json({ success: true, settings: result.rows[0] });
  } catch (err) {
    console.error("Erreur updateSettings:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
