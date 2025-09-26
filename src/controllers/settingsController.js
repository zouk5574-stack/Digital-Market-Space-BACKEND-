import { query } from '../config/db.js';
import { createPayout } from '../config/fedapay.js';

export async function getSettings(req, res) {
  try {
    const r = await query('SELECT * FROM settings LIMIT 1');
    res.json({ settings: r.rows[0] });
  } catch (err) {
    console.error('getSettings', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updateSettings(req, res) {
  try {
    const { commission_rate, auto_confirm_minutes, auto_cancel_minutes, fedapay_public_key, fedapay_secret_key, auto_withdraw_delay_hours } = req.body;
    const r = await query(`UPDATE settings SET
      commission_rate = COALESCE($1, commission_rate),
      auto_confirm_minutes = COALESCE($2, auto_confirm_minutes),
      auto_cancel_minutes = COALESCE($3, auto_cancel_minutes),
      fedapay_public_key = COALESCE($4, fedapay_public_key),
      fedapay_secret_key = COALESCE($5, fedapay_secret_key),
      auto_withdraw_delay_hours = COALESCE($6, auto_withdraw_delay_hours),
      updated_at=now() RETURNING *`, [commission_rate, auto_confirm_minutes, auto_cancel_minutes, fedapay_public_key, fedapay_secret_key, auto_withdraw_delay_hours]);
    res.json({ settings: r.rows[0] });
  } catch (err) {
    console.error('updateSettings', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// run-cron endpoint (secured by x-cron-key header)
export async function runCron(req, res) {
  try {
    const secret = req.headers['x-cron-key'];
    if (!secret || secret !== process.env.CRON_SECRET) return res.status(403).json({ error: 'Forbidden' });

    // reuse cron logic in maintenance module if you prefer; here we execute similar logic inline
    const s = await query('SELECT auto_confirm_minutes, auto_cancel_minutes, auto_withdraw_delay_hours, commission_rate FROM settings LIMIT 1');
    const settings = s.rows[0];

    // auto-confirm paid orders older than configured minutes
    await query(`UPDATE orders SET status='completed', updated_at=now()
      WHERE status='paid' AND created_at < now() - INTERVAL '${settings.auto_confirm_minutes} minutes'`);

    // auto-cancel pending orders older than configured minutes
    await query(`UPDATE orders SET status='cancelled', updated_at=now()
      WHERE status='pending' AND created_at < now() - INTERVAL '${settings.auto_cancel_minutes} minutes'`);

    // auto-approve withdrawals older than auto_withdraw_delay_hours
    await query(`UPDATE withdrawals SET status='approved', processed_at=now()
      WHERE status='requested' AND requested_at < now() - INTERVAL '${settings.auto_withdraw_delay_hours} hours'`);

    // auto-release transactions where release_at <= now()
    const txs = await query(`SELECT * FROM transactions WHERE status='paid' AND release_at IS NOT NULL AND release_at <= now()`);
    for (const tx of txs.rows) {
      // compute commission if missing
      let commission = tx.commission;
      let net = tx.net_amount;
      if (!commission || commission == 0) {
        commission = Number(tx.amount) * Number(settings.commission_rate) / 100.0;
        net = Number(tx.amount) - commission;
        await query('UPDATE transactions SET commission=$1, net_amount=$2 WHERE id=$3', [commission, net, tx.id]);
      }
      // credit seller
      if (tx.seller_id && net) await query('UPDATE users SET balance = balance + $1 WHERE id=$2', [net, tx.seller_id]);
      await query('UPDATE transactions SET status=$1, updated_at=now() WHERE id=$2', ['released', tx.id]);
      await query('INSERT INTO escrows (transaction_id, status, amount, released_at, created_at) VALUES ($1,$2,$3,now(),now())', [tx.id, 'released', tx.amount]);
    }

    res.json({ ok: true, message: 'Cron executed' });
  } catch (err) {
    console.error('runCron', err);
    res.status(500).json({ error: 'Server error' });
  }
}
