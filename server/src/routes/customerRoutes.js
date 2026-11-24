import express from 'express';
import { getCustomers, getCustomerProfile } from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'pharmacist'));

router.get('/', getCustomers);
router.get('/:id', getCustomerProfile);

export default router;
