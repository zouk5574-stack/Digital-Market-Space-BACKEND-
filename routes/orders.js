// routes/orders.js
const express = require("express");
const auth = require("../middleware/auth");
const { createOrder, getOrderById, getOrdersForUser } = require("../controllers/orderController");

const router = express.Router();

router.post("/", auth, createOrder);
router.get("/:id", auth, getOrderById);
router.get("/", auth, getOrdersForUser);

module.exports = router;
