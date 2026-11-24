import express from 'express';
import { getDashboardKPIs, getSalesAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'pharmacist'));

router.get('/kpis', getDashboardKPIs);
router.get('/sales', getSalesAnalytics);

export default router;
