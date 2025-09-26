import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export async function createProduct(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (user.role !== 'seller') return res.status(403).json({ error: 'Only sellers can create products' });
    const { title, description, price, currency='USD', is_digital=true, photo_url, file_url, stock=1, category } = req.body;
    if (!title || !description || !photo_url) return res.status(400).json({ error: 'title, description and photo_url required' });
    if (is_digital && (!file_url || file_url.trim()==='')) return res.status(400).json({ error: 'file_url required for digital product' });

    const r = await query(`INSERT INTO products (seller_id,title,description,price,currency,is_digital,photo_url,file_url,stock,category) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [user.id, title, description, price, currency, is_digital, photo_url, file_url || null, stock, category || null]);
    res.status(201).json({ product: r.rows[0] });
  } catch (err) {
    console.error('createProduct', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function listProducts(req, res) {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    const r = await query('SELECT p.*, u.full_name as seller_name FROM products p JOIN users u ON p.seller_id=u.id WHERE p.status=$1 ORDER BY p.created_at DESC LIMIT $2 OFFSET $3', ['published', limit, offset]);
    res.json({ products: r.rows });
  } catch (err) {
    console.error('listProducts', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getProduct(req, res) {
  try {
    const { id } = req.params;
    const r = await query('SELECT p.*, u.full_name as seller_name FROM products p JOIN users u ON p.seller_id=u.id WHERE p.id=$1', [id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: r.rows[0] });
  } catch (err) {
    console.error('getProduct', err);
    res.status(500).json({ error: 'Server error' });
  }
}
