import pool from "../db.js";

// ✅ GET tous les produits
export const getProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET un produit par ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ POST créer produit
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, currency, stock, is_digital, category, featured_image_url } = req.body;
    const result = await pool.query(
      `INSERT INTO products 
      (title, description, price, currency, stock, is_digital, category, featured_image_url) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, description, price, currency, stock, is_digital, category, featured_image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ PUT modifier produit
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, currency, stock, is_digital, category, featured_image_url } = req.body;
    const result = await pool.query(
      `UPDATE products SET 
      title=$1, description=$2, price=$3, currency=$4, stock=$5, is_digital=$6, category=$7, featured_image_url=$8, updated_at=NOW()
      WHERE id=$9 RETURNING *`,
      [title, description, price, currency, stock, is_digital, category, featured_image_url, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE supprimer produit
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM products WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    res.json({ message: "Produit supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
