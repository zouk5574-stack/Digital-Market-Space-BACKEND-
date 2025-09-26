import { query } from '../config/db.js';
import { createCheckout } from '../config/fedapay.js';
import { toCents } from '../utils/helpers.js';

export async function createPayment(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const { order_id } = req.body;
    if (!order_id) return res.status(400).json({ error: 'order_id required' });

    const or = await query('SELECT * FROM orders WHERE id=$1', [order_id]);
    if (!or.rows[0]) return res.status(404).json({ error: 'Order not found' });
    const order = or.rows[0];

    // create transaction
    const txRes = await query('INSERT INTO transactions (order_id, buyer_id, seller_id, amount, currency, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [order.id, order.buyer_id, null, order.total_amount, order.currency, 'pending']);
    const tx = txRes.rows[0];

    // create Fedapay checkout
    const amountCents = toCents(order.total_amount);
    const checkout = await createCheckout(amountCents, order.currency, { order_id: order.id, transaction_id: tx.id });

    // save fedapay id if present
    if (checkout && checkout.id) {
      await query('UPDATE transactions SET fedapay_payment_id=$1 WHERE id=$2', [checkout.id, tx.id]);
    }

    res.json({ transaction: tx, checkout });
  } catch (err) {
    console.error('createPayment', err);
    res.status(500).json({ error: 'Server error' });
  }
}
