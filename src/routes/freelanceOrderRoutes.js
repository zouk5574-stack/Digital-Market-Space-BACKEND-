import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createOrder,
  deliverOrder,
  confirmOrder,
} from "../controllers/freelanceOrderController.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.post("/deliver", protect, deliverOrder);
router.post("/confirm", protect, confirmOrder);

export default router;
