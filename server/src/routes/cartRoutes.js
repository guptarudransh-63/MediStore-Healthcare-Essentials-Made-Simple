import express from 'express';
import { getCart, addItem, updateItem, removeItem, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getCart);
router.post('/items', addItem);
router.patch('/items/:productId', updateItem);
router.delete('/items/:productId', removeItem);
router.delete('/', clearCart);

export default router;
