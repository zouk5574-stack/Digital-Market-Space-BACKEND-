import { query } from '../config/db.js';

export async function sendMessage(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const { order_id, to_user_id, content } = req.body;
    if (!order_id || !to_user_id || !content) return res.status(400).json({ error: 'Missing fields' });
    const r = await query('INSERT INTO messages (order_id, from_user, to_user, content, created_at) VALUES ($1,$2,$3,$4,now()) RETURNING *', [order_id, user.id, to_user_id, content]);
    res.status(201).json({ message: r.rows[0] });
  } catch (err) {
    console.error('sendMessage', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function listMessages(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const { order_id } = req.query;
    if (!order_id) return res.status(400).json({ error: 'order_id required' });
    const r = await query('SELECT m.*, uf.full_name as from_name, ut.full_name as to_name FROM messages m LEFT JOIN users uf ON m.from_user=uf.id LEFT JOIN users ut ON m.to_user=ut.id WHERE m.order_id=$1 ORDER BY m.created_at ASC', [order_id]);
    res.json({ messages: r.rows });
  } catch (err) {
    console.error('listMessages', err);
    res.status(500).json({ error: 'Server error' });
  }
}
