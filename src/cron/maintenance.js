import cron from 'node-cron';
import { query } from '../config/db.js';

// Runs every day at 02:00 UTC (adjust as necessary)
cron.schedule('0 2 * * *', async () => {
  try {
    console.log('[cron] Running maintenance tasks');

    // 1) Archive draft products older than 4 months OR products older that sold less than 40 in 4 months
    // Identify products: created_at < now() - 4 months AND total_sales < 40
    const toArchive = await query(`SELECT * FROM products WHERE (status='draft' AND created_at < now() - INTERVAL '4 months') OR (created_at < now() - INTERVAL '4 months' AND total_sales < 40)`);
    for (const p of toArchive.rows) {
      // insert into archives
      await query('INSERT INTO archives (original_table, original_id, payload, reason) VALUES ($1,$2,$3,$4)', ['products', p.id, JSON_BUILD_OBJECT('product', p), 'auto-archive-inactive-4months']);
      // update original to archived
      await query('UPDATE products SET status=$1 WHERE id=$2', ['archived', p.id]);
    }

    // 2) Delete archives older than 6 months
    await query(`DELETE FROM archives WHERE archived_at < now() - INTERVAL '6 months'`);

    console.log('[cron] Maintenance finished');
  } catch (err) {
    console.error('[cron] Maintenance error', err);
  }
});
