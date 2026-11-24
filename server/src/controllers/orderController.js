import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { Prescription } from '../models/Prescription.js';
import { Payment } from '../models/Payment.js';
import { allocateStockFEFO, restoreStockFromOrder, syncProductTotalStock } from '../services/fefoAllocationService.js';
import { formatTaxInvoice } from '../services/invoiceService.js';

export const validateCheckout = async (req, res, next) => {
  try {
    const { items, prescriptionId } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart items are required for checkout validation' });
    }

    let subtotal = 0;
    let taxTotal = 0;
    let requiresPrescription = false;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId || item.product?._id || item.product);
      if (!product || !product.isPublished) {
        return res.status(400).json({ success: false, message: `Product not found or unavailable` });
      }

      const availableStock = await syncProductTotalStock(product._id);
      if (availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${availableStock}, Requested: ${item.quantity}`
        });
      }

      if (product.prescriptionClassification === 'rx_required') {
        requiresPrescription = true;
      }

      const unitPrice = product.sellingPrice;
      const totalAmount = Number((unitPrice * item.quantity).toFixed(2));
      const taxRate = product.taxRate || 12;
      const taxAmount = Number(((totalAmount * taxRate) / 100).toFixed(2));

      subtotal += totalAmount;
      taxTotal += taxAmount;

      validatedItems.push({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        dosageForm: product.dosageForm,
        packSize: product.packSize,
        quantity: item.quantity,
        unitPrice,
        taxRate,
        taxAmount,
        totalAmount,
        requiresPrescription: product.prescriptionClassification === 'rx_required'
      });
    }

    if (requiresPrescription && !prescriptionId) {
      return res.status(400).json({
        success: false,
        requiresPrescription: true,
        message: 'A valid prescription upload is required to purchase prescription-only items in your cart.'
      });
    }

    const deliveryCharge = subtotal > 500 ? 0 : 50;
    const grandTotal = Number((subtotal + taxTotal + deliveryCharge).toFixed(2));
    const cgst = Number((taxTotal / 2).toFixed(2));
    const sgst = Number((taxTotal / 2).toFixed(2));

    res.json({
      success: true,
      requiresPrescription,
      pricing: {
        subtotal: Number(subtotal.toFixed(2)),
        taxTotal: Number(taxTotal.toFixed(2)),
        cgst,
        sgst,
        deliveryCharge,
        grandTotal
      },
      items: validatedItems
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const {
      deliveryAddress,
      paymentMethod = 'cash_on_delivery',
      prescriptionId,
      customerDetails
    } = req.body;

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.postalCode) {
      return res.status(400).json({ success: false, message: 'Please provide a complete delivery address' });
    }

    // Retrieve user's cart
    const cart = await Cart.findOne({ customer: req.user._id }).populate('items.product');
    if (!cart || !cart.items.length) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    let subtotal = 0;
    let taxTotal = 0;
    let hasPrescriptionItem = false;
    const orderItems = [];

    // Pre-validate all items and check stock before allocating
    for (const cartItem of cart.items) {
      const product = cartItem.product;
      if (!product || !product.isPublished) {
        return res.status(400).json({ success: false, message: `Product ${product?.name} is no longer available` });
      }

      const availableStock = await syncProductTotalStock(product._id);
      if (availableStock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${availableStock}, In cart: ${cartItem.quantity}`
        });
      }

      if (product.prescriptionClassification === 'rx_required') {
        hasPrescriptionItem = true;
      }
    }

    // Prescription validation
    let prescriptionDoc = null;
    if (hasPrescriptionItem) {
      if (!prescriptionId) {
        return res.status(400).json({
          success: false,
          message: 'Prescription is mandatory for prescription medicines in your cart.'
        });
      }
      prescriptionDoc = await Prescription.findById(prescriptionId);
      if (!prescriptionDoc || prescriptionDoc.customer.toString() !== req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'Invalid prescription provided' });
      }
    }

    const orderId = new mongoose.Types.ObjectId();
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const invoiceNumber = `INV-${orderNumber}`;

    // Perform FEFO batch allocation for each item
    for (const cartItem of cart.items) {
      const product = cartItem.product;
      const qty = cartItem.quantity;
      const unitPrice = product.sellingPrice;
      const totalAmount = Number((unitPrice * qty).toFixed(2));
      const taxRate = product.taxRate || 12;
      const taxAmount = Number(((totalAmount * taxRate) / 100).toFixed(2));

      // FEFO allocation!
      const batchAllocations = await allocateStockFEFO({
        productId: product._id,
        requestedQuantity: qty,
        orderId: orderId,
        actorId: req.user._id
      });

      subtotal += totalAmount;
      taxTotal += taxAmount;

      orderItems.push({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        dosageForm: product.dosageForm,
        packSize: product.packSize,
        quantity: qty,
        unitPrice,
        taxRate,
        taxAmount,
        totalAmount,
        requiresPrescription: product.prescriptionClassification === 'rx_required',
        batchAllocations
      });
    }

    const deliveryCharge = subtotal > 500 ? 0 : 50;
    const grandTotal = Number((subtotal + taxTotal + deliveryCharge).toFixed(2));
    const cgst = Number((taxTotal / 2).toFixed(2));
    const sgst = Number((taxTotal / 2).toFixed(2));

    const initialOrderStatus = hasPrescriptionItem ? 'pending_prescription_review' : 'order_placed';
    const prescriptionStatus = hasPrescriptionItem ? 'pending_review' : 'not_required';

    const order = await Order.create({
      _id: orderId,
      orderNumber,
      invoiceNumber,
      customer: req.user._id,
      customerSnapshot: {
        name: customerDetails?.name || req.user.name,
        email: customerDetails?.email || req.user.email,
        phone: customerDetails?.phone || req.user.phone || ''
      },
      deliveryAddress: {
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state || 'Haryana',
        postalCode: deliveryAddress.postalCode,
        landmark: deliveryAddress.landmark || '',
        deliveryInstructions: deliveryAddress.deliveryInstructions || ''
      },
      items: orderItems,
      subtotal: Number(subtotal.toFixed(2)),
      taxTotal: Number(taxTotal.toFixed(2)),
      cgst,
      sgst,
      deliveryCharge,
      grandTotal,
      prescription: prescriptionDoc?._id || null,
      prescriptionStatus,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'completed',
      orderStatus: initialOrderStatus,
      statusHistory: [
        {
          status: initialOrderStatus,
          changedBy: req.user._id,
          changedAt: new Date(),
          note: hasPrescriptionItem
            ? 'Order placed with prescription. Awaiting pharmacist verification.'
            : 'Order placed successfully by customer.'
        }
      ]
    });

    // Record Payment
    await Payment.create({
      order: order._id,
      customer: req.user._id,
      provider: paymentMethod,
      amount: grandTotal,
      currency: 'INR',
      status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'captured',
      paymentDetails: {
        method: paymentMethod,
        orderNumber
      }
    });

    // Link prescription back to order if present
    if (prescriptionDoc) {
      prescriptionDoc.order = order._id;
      await prescriptionDoc.save();
    }

    // Clear user's cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const { status, search, paymentStatus, prescriptionStatus, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.query.customerId) {
      query.customer = req.query.customerId;
    }

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (prescriptionStatus) query.prescriptionStatus = prescriptionStatus;

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customerSnapshot.name': { $regex: search, $options: 'i' } },
        { 'customerSnapshot.email': { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('prescription', 'fileUrl status reviewNotes')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('prescription')
      .populate('items.product', 'name sku images')
      .populate('statusHistory.changedBy', 'name role');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Validation: prevent fulfilling prescription order if prescription was rejected
    if (order.prescriptionStatus === 'rejected' && ['confirmed', 'processing', 'packed', 'out_for_delivery', 'delivered'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot progress order: prescription has been rejected by pharmacist.'
      });
    }

    const prevStatus = order.orderStatus;
    order.orderStatus = status;

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    order.statusHistory.push({
      status,
      changedBy: req.user._id,
      changedAt: new Date(),
      note: note || `Status transitioned from ${prevStatus} to ${status}`
    });

    await order.save();

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role === 'customer' && order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (['delivered', 'cancelled', 'rejected'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in its current status: ${order.orderStatus}`
      });
    }

    // Restore stock back to batches!
    await restoreStockFromOrder({
      order,
      actorId: req.user._id,
      reason: reason || 'Customer requested order cancellation'
    });

    order.orderStatus = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      changedBy: req.user._id,
      changedAt: new Date(),
      note: reason || 'Order cancelled. Batch inventory restored.'
    });

    if (order.paymentStatus === 'completed') {
      order.paymentStatus = 'refunded';
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled and allocated inventory returned to stock',
      order
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
    }

    const invoiceData = formatTaxInvoice(order);

    res.json({
      success: true,
      invoice: invoiceData
    });
  } catch (error) {
    next(error);
  }
};
