// controllers/productController.js
const pool = require("../db");

exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.createProduct = async (req, res) => {
  const { vendor_id, title, description, price, stock } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO products (vendor_id, title, description, price, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [vendor_id, title, description, price, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
