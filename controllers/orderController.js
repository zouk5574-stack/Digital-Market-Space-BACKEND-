// controllers/orderController.js
const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

// POST /api/orders
async function createOrder(req, res) {
  try {
    const user = req.user;
    const { items, currency } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "items requis" });

    // Calcul total (simple)
    let total = 0;
    for (const it of items) {
      if (!it.product_id || !it.quantity) return res.status(400).json({ error: "item invalide" });
      // get price
      const pq = await pool.query("SELECT price FROM products WHERE id=$1", [it.product_id]);
      if (pq.rows.length === 0) return res.status(400).json({ error: `Produit introuvable: ${it.product_id}` });
      total += parseFloat(pq.rows[0].price) * parseInt(it.quantity, 10);
    }

    const orderId = uuidv4();
    // Create order (buyer_id set)
    await pool.query(
      `INSERT INTO orders (id, buyer_id, total, currency, status, created_at) VALUES ($1,$2,$3,$4,'pending',now())`,
      [orderId, user.id, total, currency || "EUR"]
    );

    // Insert items
    for (const it of items) {
      const priceQ = await pool.query("SELECT price FROM products WHERE id=$1", [it.product_id]);
      const price = priceQ.rows[0].price;
      await pool.query(
        "INSERT INTO order_items (id, order_id, product_id, price, quantity) VALUES ($1,$2,$3,$4,$5)",
        [uuidv4(), orderId, it.product_id, price, it.quantity]
      );
    }

    return res.status(201).json({ message: "Commande créée", order_id: orderId, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// GET /api/orders/:id
async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const q = await pool.query("SELECT * FROM orders WHERE id=$1", [id]);
    if (q.rows.length === 0) return res.status(404).json({ error: "Commande introuvable" });

    // check ownership: buyer or vendor or admin
    const order = q.rows[0];
    const user = req.user;
    if (user.role !== "admin" && user.id !== order.buyer_id && user.id !== order.vendor_id) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    const items = await pool.query("SELECT * FROM order_items WHERE order_id=$1", [id]);
    res.json({ order, items: items.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// GET /api/orders  -> renvoie commandes de l'utilisateur
async function getOrdersForUser(req, res) {
  try {
    const user = req.user;
    let q;
    if (user.role === "admin") {
      q = await pool.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 200");
    } else {
      q = await pool.query("SELECT * FROM orders WHERE buyer_id=$1 ORDER BY created_at DESC LIMIT 200", [user.id]);
    }
    res.json(q.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { createOrder, getOrderById, getOrdersForUser };
