import express from 'express';
import { createProduct, listProducts, getProduct } from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
router.get('/', listProducts);
router.post('/', protect, createProduct);
router.get('/:id', getProduct);
export default router;
