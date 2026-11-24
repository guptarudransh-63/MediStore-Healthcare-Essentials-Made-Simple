import express from 'express';
import {
  uploadPrescriptionController,
  getPrescriptions,
  getPrescriptionById,
  updatePrescriptionStatus
} from '../controllers/prescriptionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadPrescription } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/upload', uploadPrescription.single('prescription'), uploadPrescriptionController);
router.get('/', getPrescriptions);
router.get('/:id', getPrescriptionById);
router.patch('/:id/status', authorize('admin', 'pharmacist'), updatePrescriptionStatus);

export default router;
