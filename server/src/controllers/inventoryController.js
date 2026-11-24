import { InventoryBatch } from '../models/InventoryBatch.js';
import { Product } from '../models/Product.js';
import { Supplier } from '../models/Supplier.js';
import { StockReceipt } from '../models/StockReceipt.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { syncProductTotalStock } from '../services/fefoAllocationService.js';
import { getExpiryAnalysis, removeExpiredBatch } from '../services/expiryService.js';

export const getInventorySummary = async (req, res, next) => {
  try {
    const now = new Date();
    const day30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [totalProducts, allBatches, lowStockProducts] = await Promise.all([
      Product.countDocuments({ isPublished: true }),
      InventoryBatch.find().populate('product', 'sellingPrice purchasePrice name sku'),
      Product.find({
        isPublished: true,
        $expr: { $lte: ['$totalAvailableStock', '$reorderThreshold'] }
      }).populate('category', 'name')
    ]);

    let totalStockUnits = 0;
    let totalInventoryValue = 0;
    let expiredBatchesCount = 0;
    let nearExpiryBatchesCount = 0;

    for (const b of allBatches) {
      if (b.availableQuantity > 0) {
        const expDate = new Date(b.expiryDate);
        if (expDate <= now) {
          expiredBatchesCount++;
        } else {
          totalStockUnits += b.availableQuantity;
          totalInventoryValue += b.availableQuantity * (b.purchasePrice || 0);

          if (expDate <= day30) {
            nearExpiryBatchesCount++;
          }
        }
      }
    }

    res.json({
      success: true,
      summary: {
        totalProducts,
        totalStockUnits,
        totalInventoryValue,
        expiredBatchesCount,
        nearExpiryBatchesCount,
        lowStockCount: lowStockProducts.length
      },
      lowStockProducts
    });
  } catch (error) {
    next(error);
  }
};

export const getBatches = async (req, res, next) => {
  try {
    const { product, status, expiryFilter, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (product) {
      query.product = product;
    }

    if (status) {
      query.batchStatus = status;
    }

    const now = new Date();
    if (expiryFilter === 'expired') {
      query.expiryDate = { $lte: now };
    } else if (expiryFilter === 'within7') {
      const d7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      query.expiryDate = { $gt: now, $lte: d7 };
    } else if (expiryFilter === 'within30') {
      const d30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      query.expiryDate = { $gt: now, $lte: d30 };
    } else if (expiryFilter === 'within90') {
      const d90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      query.expiryDate = { $gt: now, $lte: d90 };
    } else if (expiryFilter === 'safe') {
      const d90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      query.expiryDate = { $gt: d90 };
    }

    if (search) {
      query.batchNumber = { $regex: search, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await InventoryBatch.countDocuments(query);
    const batches = await InventoryBatch.find(query)
      .populate('product', 'name sku brand genericName sellingPrice purchasePrice dosageForm')
      .populate('supplier', 'name phone email')
      .sort({ expiryDate: 1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: batches.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      batches
    });
  } catch (error) {
    next(error);
  }
};

export const receiveStock = async (req, res, next) => {
  try {
    const { supplierId, invoiceNumber, invoiceDate, items, notes } = req.body;

    if (!supplierId || !invoiceNumber || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Please provide supplier, invoice number, and items' });
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const {
        productId,
        batchNumber,
        mfgDate,
        expiryDate,
        quantity,
        purchasePrice,
        storageLocation
      } = item;

      if (!productId || !batchNumber || !expiryDate || !quantity || quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid product, batch or quantity specification' });
      }

      const parsedExp = new Date(expiryDate);
      if (parsedExp <= new Date()) {
        return res.status(400).json({
          success: false,
          message: `Cannot receive expired batch (${batchNumber}). Expiry date must be in the future.`
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${productId} not found` });
      }

      const itemCost = Number((quantity * (purchasePrice || product.purchasePrice)).toFixed(2));
      totalAmount += itemCost;

      // Find or create batch
      let batch = await InventoryBatch.findOne({
        product: productId,
        batchNumber: batchNumber.toUpperCase().trim()
      });

      let prevQty = 0;
      if (batch) {
        prevQty = batch.availableQuantity;
        batch.quantityReceived += quantity;
        batch.availableQuantity += quantity;
        batch.purchasePrice = purchasePrice || batch.purchasePrice;
        batch.expiryDate = parsedExp;
        batch.batchStatus = 'active';
        await batch.save();
      } else {
        batch = await InventoryBatch.create({
          product: productId,
          batchNumber: batchNumber.toUpperCase().trim(),
          manufacturer: product.manufacturer || 'Standard Pharma',
          mfgDate: mfgDate ? new Date(mfgDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          expiryDate: parsedExp,
          quantityReceived: quantity,
          availableQuantity: quantity,
          purchasePrice: purchasePrice || product.purchasePrice,
          supplier: supplierId,
          storageLocation: storageLocation || 'Shelf A-1',
          batchStatus: 'active'
        });
      }

      // Record movement
      await InventoryMovement.create({
        product: productId,
        batch: batch._id,
        movementType: 'stock_in',
        quantityChange: quantity,
        previousQuantity: prevQty,
        newQuantity: prevQty + quantity,
        actor: req.user?._id,
        reason: `Stock receipt from supplier: ${supplier.name} (Invoice: ${invoiceNumber})`
      });

      // Sync product total stock
      await syncProductTotalStock(productId);

      processedItems.push({
        product: productId,
        batchNumber: batch.batchNumber,
        mfgDate: batch.mfgDate,
        expiryDate: batch.expiryDate,
        quantity,
        purchasePrice: purchasePrice || product.purchasePrice,
        totalCost: itemCost,
        storageLocation: storageLocation || 'Shelf A-1'
      });
    }

    const receipt = await StockReceipt.create({
      receiptNumber,
      supplier: supplierId,
      invoiceNumber,
      invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
      receivedDate: new Date(),
      receivedBy: req.user._id,
      items: processedItems,
      totalAmount,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      receipt
    });
  } catch (error) {
    next(error);
  }
};

export const recordAdjustment = async (req, res, next) => {
  try {
    const { batchId, adjustmentType, quantityChange, reason } = req.body;

    const batch = await InventoryBatch.findById(batchId).populate('product');
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const prevQty = batch.availableQuantity;
    let newQty = prevQty;

    if (adjustmentType === 'damaged_removal' || adjustmentType === 'expired_removal') {
      const deductQty = Math.abs(quantityChange || prevQty);
      if (deductQty > prevQty) {
        return res.status(400).json({ success: false, message: 'Cannot remove more quantity than available' });
      }
      newQty = prevQty - deductQty;
      batch.availableQuantity = newQty;
      if (newQty === 0 && adjustmentType === 'expired_removal') {
        batch.batchStatus = 'expired';
      }
    } else if (adjustmentType === 'stock_correction') {
      newQty = prevQty + quantityChange;
      if (newQty < 0) {
        return res.status(400).json({ success: false, message: 'Resulting quantity cannot be negative' });
      }
      batch.availableQuantity = newQty;
    } else if (adjustmentType === 'quarantine_hold') {
      batch.batchStatus = 'quarantined';
    } else if (adjustmentType === 'quarantine_release') {
      batch.batchStatus = batch.expiryDate > new Date() ? 'active' : 'expired';
    }

    await batch.save();

    await InventoryMovement.create({
      product: batch.product._id,
      batch: batch._id,
      movementType: adjustmentType,
      quantityChange: newQty - prevQty,
      previousQuantity: prevQty,
      newQuantity: newQty,
      actor: req.user._id,
      reason: reason || `Manual adjustment: ${adjustmentType}`
    });

    await syncProductTotalStock(batch.product._id);

    res.json({
      success: true,
      batch
    });
  } catch (error) {
    next(error);
  }
};

export const handleRemoveExpired = async (req, res, next) => {
  try {
    const { batchId, reason } = req.body;
    const batch = await removeExpiredBatch({
      batchId,
      actorId: req.user._id,
      reason: reason || 'Expired batch quarantined and removed from sellable stock'
    });

    res.json({
      success: true,
      message: 'Expired batch removed from sellable stock',
      batch
    });
  } catch (error) {
    next(error);
  }
};

export const getExpiryAlerts = async (req, res, next) => {
  try {
    const analysis = await getExpiryAnalysis();
    res.json({
      success: true,
      ...analysis
    });
  } catch (error) {
    next(error);
  }
};

export const getMovements = async (req, res, next) => {
  try {
    const { product, batch, movementType, page = 1, limit = 50 } = req.query;
    const query = {};

    if (product) query.product = product;
    if (batch) query.batch = batch;
    if (movementType) query.movementType = movementType;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await InventoryMovement.countDocuments(query);
    const movements = await InventoryMovement.find(query)
      .populate('product', 'name sku brand')
      .populate('batch', 'batchNumber expiryDate')
      .populate('actor', 'name email role')
      .populate('relatedOrder', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      movements
    });
  } catch (error) {
    next(error);
  }
};
