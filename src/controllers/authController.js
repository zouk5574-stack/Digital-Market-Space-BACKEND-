import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

export async function register(req, res) {
  try {
    const { full_name, email, phone, password, role } = req.body;
    if (!full_name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const pwHash = await bcrypt.hash(password, 10);
    const r = await query(`INSERT INTO users (full_name,email,phone,password_hash,role) VALUES ($1,$2,$3,$4,$5) RETURNING id, full_name, email, role`, [full_name, email, phone || null, pwHash, role || 'buyer']);
    const user = r.rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '14d' });

    // send verification email (simple link with token)
    const verifyLink = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${token}`;
    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: user.email,
        subject: 'Confirmez votre email - Digital Market Space',
        html: `<p>Bonjour ${user.full_name},</p><p>Cliquez <a href="${verifyLink}">ici</a> pour vérifier votre email.</p>`
      });
    } catch (e) {
      console.warn('Mail send failed', e.message || e);
    }

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('register error', err);
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Server error' });
  }
}

export async function verifyEmail(req, res) {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).send('Token missing');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await query('UPDATE users SET email_verified=true WHERE id=$1', [decoded.id]);
    res.send('Email verified. You can close this page.');
  } catch (err) {
    console.error('verifyEmail', err);
    res.status(400).send('Invalid token');
  }
}

export async function login(req, res) {
  try {
    const { email, phone, password } = req.body;
    if (!password || (!email && !phone)) return res.status(400).json({ error: 'Missing credentials' });
    const q = email ? 'SELECT * FROM users WHERE email=$1' : 'SELECT * FROM users WHERE phone=$1';
    const val = email || phone;
    const r = await query(q, [val]);
    const user = r.rows[0];
    if (!user) return res.status(400).json({ error: 'User not found' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '14d' });
    res.json({ user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, email_verified: user.email_verified }, token });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error("Mot de passe incorrect");
      error.statusCode = 400;
      return next(error);
    }

    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: "Connexion réussie ✅",
      user: { id: user.id, fullname: user.fullname, phone: user.phone, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
};

// 📌 Profil utilisateur connecté
export const getMe = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id, fullname, phone, role FROM users WHERE id = $1", [req.user.id]);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
