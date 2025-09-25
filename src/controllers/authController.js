// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  console.error('JWT_SECRET not set in env');
  process.exit(1);
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function register(req, res) {
  try {
    const { full_name, email, password, role = 'vendeur' } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'full_name, email and password required' });
    }

    // check existing email
    const { rows: existing } = await query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert - adapt column names to your table if different
    const insertSQL = `INSERT INTO users (nom_complet, email, password_hash, role, created_at)
                       VALUES ($1,$2,$3,$4,now())
                       RETURNING id, email, role`;
    // Many DBs may use 'nom_complet' or 'full_name'; if your column name is different,
    // change the above SQL accordingly.
    const { rows } = await query(insertSQL, [full_name, email, password_hash, role]);
    const user = rows[0];

    const token = signToken(user);
    return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ message: 'Internal error' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const { rows } = await query('SELECT id, email, password_hash, role FROM users WHERE email=$1', [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ message: 'Internal error' });
  }
}

export async function getMe(req, res) {
  try {
    const userId = req.user.id;
    const { rows } = await query('SELECT id, nom_complet, email, role, created_at FROM users WHERE id=$1', [userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('getMe error', err);
    return res.status(500).json({ message: 'Internal error' });
  }
}
