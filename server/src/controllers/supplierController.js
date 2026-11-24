import { Supplier } from '../models/Supplier.js';
import { StockReceipt } from '../models/StockReceipt.js';

export const getSuppliers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { gstin: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const suppliers = await Supplier.find(query).sort({ name: 1 });

    res.json({
      success: true,
      count: suppliers.length,
      suppliers
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const receipts = await StockReceipt.find({ supplier: supplier._id })
      .populate('items.product', 'name sku')
      .populate('receivedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      supplier,
      receipts
    });
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req, res, next) => {
  try {
    const { name, contactPerson, email, phone, address, gstin, dlNumber } = req.body;

    const supplier = await Supplier.create({
      name,
      contactPerson,
      email,
      phone,
      address: address || {},
      gstin: gstin || '',
      dlNumber: dlNumber || ''
    });

    res.status(201).json({
      success: true,
      supplier
    });
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.json({
      success: true,
      supplier
    });
  } catch (error) {
    next(error);
  }
};
