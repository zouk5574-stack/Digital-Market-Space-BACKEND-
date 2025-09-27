/**
 * src/cron/autoConfirmWithdrawals.js
 *
 * Cron job : auto-confirme les retraits en attente trop longtemps
 */

import { query } from "../config/db.js";

// Durée avant auto-confirmation (exemple : 48 heures)
const AUTO_CONFIRM_DELAY_HOURS = 48;

export const autoConfirmWithdrawals = async () => {
  try {
    console.log("⏳ Vérification auto-confirmation retraits...");

    const result = await query(
      `UPDATE withdrawals
       SET status = 'approved'
       WHERE status = 'pending'
       AND created_at <= NOW() - INTERVAL '${AUTO_CONFIRM_DELAY_HOURS} hours'
       RETURNING *`
    );

    if (result.rows.length > 0) {
      console.log(`✅ ${result.rows.length} retraits auto-confirmés`);
    }
  } catch (error) {
    console.error("❌ Erreur auto-confirmation retraits :", error);
  }
};
