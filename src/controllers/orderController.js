// controllers/orderController.js
const pool = require("../db");

exports.createOrder = async (req, res) => {
  const { buyer_id, vendor_id, total, currency } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO orders (buyer_id, vendor_id, total, currency, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [buyer_id, vendor_id, total, currency, "pending"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getOrdersByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM orders WHERE buyer_id = $1", [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
