// controllers/productController.js
const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

// GET /api/products
async function getAllProducts(req, res) {
  try {
    const q = await pool.query("SELECT * FROM products ORDER BY created_at DESC LIMIT 100");
    res.json(q.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// GET /api/products/:id
async function getProduct(req, res) {
  try {
    const { id } = req.params;
    const q = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (q.rows.length === 0) return res.status(404).json({ error: "Produit non trouvé" });
    res.json(q.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// POST /api/products
async function createProduct(req, res) {
  try {
    const { title, description, price, currency, stock, is_digital, category_id, featured_image_url } = req.body;

    if (!title || price == null) return res.status(400).json({ error: "title et price requis" });

    // Vérif rôle: autoriser seulement vendor/admin
    const user = req.user || {};
    if (!["vendor", "admin"].includes(user.role)) {
      return res.status(403).json({ error: "Accès refusé: role vendeur requis" });
    }

    const id = uuidv4();
    const vendor_q = await pool.query("SELECT id FROM vendors WHERE user_id = $1", [user.id]);
    const vendor_id = vendor_q.rows.length ? vendor_q.rows[0].id : null;

    const insertQ = `
      INSERT INTO products (id, vendor_id, title, description, price, currency, stock, is_digital, category_id, featured_image_url, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now(),now()) RETURNING *`;
    const values = [id, vendor_id, title, description || null, price, currency || "EUR", stock || 0, is_digital || false, category_id || null, featured_image_url || null];
    const result = await pool.query(insertQ, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// PUT /api/products/:id
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { title, description, price, currency, stock, is_digital, category_id, featured_image_url, status } = req.body;

    // Vérif produit exist
    const check = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: "Produit non trouvé" });

    // Autorisation simple: vendeur/admin
    const user = req.user || {};
    if (!["vendor", "admin"].includes(user.role)) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const q = `
      UPDATE products SET title=$1, description=$2, price=$3, currency=$4, stock=$5, is_digital=$6, category_id=$7, featured_image_url=$8, status=$9, updated_at=now()
      WHERE id=$10 RETURNING *`;
    const values = [title, description, price, currency, stock, is_digital, category_id, featured_image_url, status || "published", id];
    const result = await pool.query(q, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// DELETE /api/products/:id
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const user = req.user || {};
    if (!["vendor", "admin"].includes(user.role)) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    const result = await pool.query("DELETE FROM products WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Produit non trouvé" });
    res.json({ message: "Produit supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { getAllProducts, getProduct, createProduct, updateProduct, deleteProduct };
