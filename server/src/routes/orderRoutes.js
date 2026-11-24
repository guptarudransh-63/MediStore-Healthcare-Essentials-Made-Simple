import express from 'express';
import {
  validateCheckout,
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getInvoice
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/validate', validateCheckout);
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.get('/:id/invoice', getInvoice);
router.post('/:id/cancel', cancelOrder);
router.patch('/:id/status', authorize('admin', 'pharmacist'), updateOrderStatus);

export default router;
