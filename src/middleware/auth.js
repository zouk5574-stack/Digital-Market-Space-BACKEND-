import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export async function protect(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authorized' });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const r = await query('SELECT id, full_name, email, role FROM users WHERE id=$1', [decoded.id]);
    if (!r.rows[0]) return res.status(401).json({ error: 'User not found' });
    req.user = r.rows[0];
    next();
  } catch (err) {
    console.error('protect error', err.message || err);
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
}

export function adminOnly(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}
