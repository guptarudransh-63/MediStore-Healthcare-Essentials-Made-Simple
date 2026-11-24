import { Prescription } from '../models/Prescription.js';
import { Order } from '../models/Order.js';

export const uploadPrescriptionController = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a prescription image or PDF' });
    }

    const { patientName, patientAge, doctorName, orderId } = req.body;
    const fileUrl = `/uploads/prescriptions/${req.file.filename}`;

    const prescription = await Prescription.create({
      customer: req.user._id,
      order: orderId || null,
      fileUrl,
      originalFileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      patientName: patientName || req.user.name,
      patientAge: patientAge ? parseInt(patientAge, 10) : undefined,
      doctorName: doctorName || '',
      status: 'pending_review'
    });

    // If orderId is provided, associate and update order
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.customer.toString() === req.user._id.toString()) {
        order.prescription = prescription._id;
        order.prescriptionStatus = 'pending_review';
        await order.save();
      }
    }

    res.status(201).json({
      success: true,
      prescription
    });
  } catch (error) {
    next(error);
  }
};

export const getPrescriptions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    // Customer can only view their own
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.query.customerId) {
      query.customer = req.query.customerId;
    }

    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Prescription.countDocuments(query);
    const prescriptions = await Prescription.find(query)
      .populate('customer', 'name email phone')
      .populate('order', 'orderNumber grandTotal orderStatus')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: prescriptions.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      prescriptions
    });
  } catch (error) {
    next(error);
  }
};

export const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('order', 'orderNumber grandTotal orderStatus items')
      .populate('reviewedBy', 'name email role');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Authorization check
    if (req.user.role === 'customer' && prescription.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this prescription' });
    }

    res.json({
      success: true,
      prescription
    });
  } catch (error) {
    next(error);
  }
};

export const updatePrescriptionStatus = async (req, res, next) => {
  try {
    const { status, reviewNotes, doctorRegNumber, validUntil } = req.body;
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    prescription.status = status;
    prescription.reviewNotes = reviewNotes || prescription.reviewNotes;
    if (doctorRegNumber) prescription.doctorRegNumber = doctorRegNumber;
    if (validUntil) prescription.validUntil = new Date(validUntil);
    prescription.reviewedBy = req.user._id;
    prescription.reviewedAt = new Date();

    await prescription.save();

    // If attached to an order, update order status and history
    if (prescription.order) {
      const order = await Order.findById(prescription.order);
      if (order) {
        if (status === 'approved') {
          order.prescriptionStatus = 'approved';
          if (order.orderStatus === 'pending_prescription_review') {
            order.orderStatus = 'prescription_approved';
            order.statusHistory.push({
              status: 'prescription_approved',
              changedBy: req.user._id,
              changedAt: new Date(),
              note: `Prescription approved by ${req.user.name}. ${reviewNotes || ''}`
            });
          }
        } else if (status === 'rejected') {
          order.prescriptionStatus = 'rejected';
          order.statusHistory.push({
            status: order.orderStatus,
            changedBy: req.user._id,
            changedAt: new Date(),
            note: `Prescription rejected: ${reviewNotes || 'Invalid document'}`
          });
        }
        await order.save();
      }
    }

    res.json({
      success: true,
      prescription
    });
  } catch (error) {
    next(error);
  }
};
