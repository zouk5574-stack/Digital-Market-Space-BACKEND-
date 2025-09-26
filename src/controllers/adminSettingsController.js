import pool from "../config/db.js";

/**
 * Récupérer les paramètres globaux
 */
export const getAdminSettings = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM admin_settings LIMIT 1");
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Paramètres non trouvés" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur getAdminSettings:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * Mettre à jour les délais (auto-confirmation, auto-retrait)
 */
export const updateAdminSettings = async (req, res) => {
  try {
    const { auto_confirm_delay_hours, auto_withdraw_delay_hours } = req.body;

    const result = await pool.query(
      `UPDATE admin_settings
       SET 
         auto_confirm_delay_hours = COALESCE($1, auto_confirm_delay_hours),
         auto_withdraw_delay_hours = COALESCE($2, auto_withdraw_delay_hours),
         updated_at = NOW()
       RETURNING *`,
      [auto_confirm_delay_hours, auto_withdraw_delay_hours]
    );

    res.json({ success: true, settings: result.rows[0] });
  } catch (err) {
    console.error("Erreur updateAdminSettings:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
