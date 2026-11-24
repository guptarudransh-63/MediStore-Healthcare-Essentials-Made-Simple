import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { syncProductTotalStock } from '../services/fefoAllocationService.js';

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ customer: req.user._id }).populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name slug' }
    });

    if (!cart) {
      cart = await Cart.create({ customer: req.user._id, items: [] });
    }

    // Refresh stock numbers and calculate summary
    let subtotal = 0;
    let taxTotal = 0;
    let hasPrescriptionRequiredItems = false;
    let hasOutOfStockItems = false;

    const validatedItems = [];

    for (const item of cart.items) {
      if (!item.product) continue;

      const currentStock = await syncProductTotalStock(item.product._id);
      item.product.totalAvailableStock = currentStock;

      const qty = item.quantity;
      const isOutOfStock = currentStock < qty;
      if (isOutOfStock) hasOutOfStockItems = true;

      if (item.product.prescriptionClassification === 'rx_required') {
        hasPrescriptionRequiredItems = true;
      }

      const itemTotal = Number((item.product.sellingPrice * qty).toFixed(2));
      const taxRate = item.product.taxRate || 12;
      const itemTax = Number(((itemTotal * taxRate) / 100).toFixed(2));

      subtotal += itemTotal;
      taxTotal += itemTax;

      validatedItems.push({
        ...item.toObject(),
        itemTotal,
        itemTax,
        isOutOfStock
      });
    }

    const deliveryCharge = subtotal > 500 || subtotal === 0 ? 0 : 50; // Free delivery over ₹500
    const grandTotal = Number((subtotal + taxTotal + deliveryCharge).toFixed(2));

    res.json({
      success: true,
      cart: {
        _id: cart._id,
        items: validatedItems,
        subtotal: Number(subtotal.toFixed(2)),
        taxTotal: Number(taxTotal.toFixed(2)),
        deliveryCharge,
        grandTotal,
        hasPrescriptionRequiredItems,
        hasOutOfStockItems
      }
    });
  } catch (error) {
    next(error);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isPublished) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    }

    const availableStock = await syncProductTotalStock(productId);
    if (availableStock <= 0) {
      return res.status(400).json({ success: false, message: 'Product is currently out of stock' });
    }

    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      cart = await Cart.create({ customer: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(i => i.product.toString() === productId);
    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + parseInt(quantity, 10);
      if (newQty > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than available stock (${availableStock} units)`
        });
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      const addQty = parseInt(quantity, 10);
      if (addQty > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than available stock (${availableStock} units)`
        });
      }
      cart.items.push({ product: productId, quantity: addQty });
    }

    await cart.save();
    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      return removeItem(req, res, next);
    }

    const availableStock = await syncProductTotalStock(productId);
    if (qty > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${availableStock} units)`
      });
    }

    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find(i => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    item.quantity = qty;
    await cart.save();

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(i => i.product.toString() !== productId);
    await cart.save();

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};
