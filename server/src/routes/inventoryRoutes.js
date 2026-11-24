import express from 'express';
import {
  getInventorySummary,
  getBatches,
  receiveStock,
  recordAdjustment,
  handleRemoveExpired,
  getExpiryAlerts,
  getMovements
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'pharmacist'));

router.get('/summary', getInventorySummary);
router.get('/batches', getBatches);
router.post('/stock-receipt', receiveStock);
router.post('/adjustment', recordAdjustment);
router.post('/remove-expired', handleRemoveExpired);
router.get('/expiry-alerts', getExpiryAlerts);
router.get('/movements', getMovements);

export default router;
