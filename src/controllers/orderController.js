import { query } from '../config/db.js';

export async function createOrder(req, res) {
  try {
    const buyer = req.user;
    if (!buyer) return res.status(401).json({ error: 'Not authenticated' });

    const { items } = req.body; // [{ product_id, quantity }]
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'No items' });

    const client = await (await import('../config/db.js')).default.connect();
    try {
      await client.query('BEGIN');
      let total = 0;
      const orderRes = await client.query('INSERT INTO orders (buyer_id, total_amount, currency, status) VALUES ($1,$2,$3,$4) RETURNING *', [buyer.id, 0, 'USD', 'pending']);
      const order = orderRes.rows[0];

      for (const it of items) {
        const p = await client.query('SELECT id, price, seller_id, is_digital, stock FROM products WHERE id=$1 FOR UPDATE', [it.product_id]);
        if (!p.rows[0]) throw new Error('Product not found');
        const prod = p.rows[0];
        const qty = Number(it.quantity) || 1;
        if (prod.stock !== null && prod.stock < qty) throw new Error('Insufficient stock');

        total += Number(prod.price) * qty;
        await client.query('INSERT INTO order_items (order_id, product_id, seller_id, unit_price, quantity) VALUES ($1,$2,$3,$4,$5)', [order.id, prod.id, prod.seller_id, prod.price, qty]);

        // decrement stock
        if (prod.stock !== null) {
          await client.query('UPDATE products SET stock = stock - $1 WHERE id=$2', [qty, prod.id]);
        }
      }

      await client.query('UPDATE orders SET total_amount=$1 WHERE id=$2', [total, order.id]);
      await client.query('COMMIT');

      res.status(201).json({ order_id: order.id, total });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('createOrder', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
}
