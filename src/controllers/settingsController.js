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
