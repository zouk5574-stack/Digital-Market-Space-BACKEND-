import pool from "../config/db.js";

/**
 * Récupérer le délai actuel d’auto-confirmation
 */
export const getAutoConfirmDelay = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT auto_confirm_delay_hours FROM admin_settings LIMIT 1"
    );
    res.json({ delay: result.rows[0].auto_confirm_delay_hours });
  } catch (err) {
    console.error("Erreur getAutoConfirmDelay:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * Mettre à jour le délai d’auto-confirmation
 */
export const updateAutoConfirmDelay = async (req, res) => {
  try {
    const { delay } = req.body;

    if (!delay || isNaN(delay) || delay < 1) {
      return res.status(400).json({ error: "Délai invalide" });
    }

    const result = await pool.query(
      `UPDATE admin_settings
       SET auto_confirm_delay_hours = $1, updated_at = NOW()
       RETURNING auto_confirm_delay_hours`,
      [delay]
    );

    res.json({
      success: true,
      delay: result.rows[0].auto_confirm_delay_hours,
    });
  } catch (err) {
    console.error("Erreur updateAutoConfirmDelay:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
