// cronJobs.js
const cron = require("node-cron");
const db = require("./config/db");
const moment = require("moment");

// ⚡ 1. Auto-approve withdrawals après le délai défini par l’admin
cron.schedule("0 * * * *", async () => {
  console.log("⏳ Vérification des retraits en attente...");

  try {
    // Récupérer le délai auto withdraw depuis la table settings
    const settings = await db.oneOrNone("SELECT auto_withdraw_delay FROM settings LIMIT 1");
    const delayHours = settings ? settings.auto_withdraw_delay : 24; // défaut : 24h

    const pendingWithdrawals = await db.any(
      `SELECT * FROM withdrawals
       WHERE status = 'pending'
       AND requested_at <= NOW() - INTERVAL '${delayHours} hours'`
    );

    for (const withdrawal of pendingWithdrawals) {
      await db.none(
        `UPDATE withdrawals
         SET status = 'approved', approved_at = NOW()
         WHERE id = $1`,
        [withdrawal.id]
      );
      console.log(`✅ Retrait auto-approuvé (ID: ${withdrawal.id})`);
    }
  } catch (error) {
    console.error("Erreur auto-approve withdrawals:", error);
  }
});

// ⚡ 2. Auto-confirm escrow après X minutes si l’acheteur ne confirme pas
cron.schedule("*/10 * * * *", async () => {
  console.log("⏳ Vérification des escrows...");

  try {
    const settings = await db.oneOrNone("SELECT auto_confirm_minutes FROM settings LIMIT 1");
    const delayMinutes = settings ? settings.auto_confirm_minutes : 60; // défaut : 1h

    const escrows = await db.any(
      `SELECT * FROM escrows
       WHERE status = 'pending'
       AND created_at <= NOW() - INTERVAL '${delayMinutes} minutes'`
    );

    for (const escrow of escrows) {
      await db.none(
        `UPDATE escrows
         SET status = 'released', released_at = NOW()
         WHERE id = $1`,
        [escrow.id]
      );
      console.log(`✅ Escrow auto-confirmé (ID: ${escrow.id})`);
    }
  } catch (error) {
    console.error("Erreur auto-confirm escrow:", error);
  }
});
