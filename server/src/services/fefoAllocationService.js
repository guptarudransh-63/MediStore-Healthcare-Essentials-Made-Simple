import mongoose from 'mongoose';
import { InventoryBatch } from '../models/InventoryBatch.js';
import { Product } from '../models/Product.js';
import { InventoryMovement } from '../models/InventoryMovement.js';

/**
 * FEFO (First Expiry, First Out) batch allocation service.
 * Finds eligible non-expired, active batches with earliest expiry dates
 * and allocates the requested quantity across them.
 */
export async function allocateStockFEFO({ productId, requestedQuantity, orderId = null, actorId = null }) {
  if (requestedQuantity <= 0) {
    throw new Error('Requested quantity must be greater than zero');
  }

  const now = new Date();

  // Find all active batches for the product with expiry date in the future and availableQuantity > 0,
  // sorted by expiryDate ascending (earliest expiry first)
  const eligibleBatches = await InventoryBatch.find({
    product: productId,
    batchStatus: 'active',
    expiryDate: { $gt: now },
    availableQuantity: { $gt: 0 }
  }).sort({ expiryDate: 1 });

  const totalAvailable = eligibleBatches.reduce((acc, b) => acc + b.availableQuantity, 0);
  if (totalAvailable < requestedQuantity) {
    const product = await Product.findById(productId);
    throw new Error(
      `Insufficient sellable stock for "${product?.name || productId}". Requested: ${requestedQuantity}, Available non-expired: ${totalAvailable}`
    );
  }

  let remainingToAllocate = requestedQuantity;
  const allocations = [];

  for (const batch of eligibleBatches) {
    if (remainingToAllocate <= 0) break;

    const allocateFromThisBatch = Math.min(batch.availableQuantity, remainingToAllocate);
    const prevQty = batch.availableQuantity;
    const newQty = prevQty - allocateFromThisBatch;

    // Update batch quantity
    batch.availableQuantity = newQty;
    if (newQty === 0) {
      batch.batchStatus = 'depleted';
    }
    await batch.save();

    // Record inventory movement
    await InventoryMovement.create({
      product: productId,
      batch: batch._id,
      movementType: 'stock_out_order',
      quantityChange: -allocateFromThisBatch,
      previousQuantity: prevQty,
      newQuantity: newQty,
      relatedOrder: orderId && mongoose.isValidObjectId(orderId) ? orderId : undefined,
      actor: actorId,
      reason: `FEFO order fulfillment for Order ${orderId || 'checkout'}`
    });

    allocations.push({
      batch: batch._id,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      quantity: allocateFromThisBatch,
      unitPrice: batch.purchasePrice
    });

    remainingToAllocate -= allocateFromThisBatch;
  }

  // Recalculate and sync Product.totalAvailableStock
  await syncProductTotalStock(productId);

  return allocations;
}

/**
 * Restores allocated batch stock in the event of an order cancellation.
 */
export async function restoreStockFromOrder({ order, actorId = null, reason = 'Order cancellation' }) {
  for (const item of order.items) {
    if (!item.batchAllocations || item.batchAllocations.length === 0) continue;

    for (const alloc of item.batchAllocations) {
      const batch = await InventoryBatch.findById(alloc.batch);
      if (batch) {
        const prevQty = batch.availableQuantity;
        const newQty = prevQty + alloc.quantity;

        batch.availableQuantity = newQty;
        // If it was depleted, reactivate if not expired
        if (batch.batchStatus === 'depleted') {
          batch.batchStatus = batch.expiryDate > new Date() ? 'active' : 'expired';
        }
        await batch.save();

        await InventoryMovement.create({
          product: item.product,
          batch: batch._id,
          movementType: 'order_cancellation_return',
          quantityChange: alloc.quantity,
          previousQuantity: prevQty,
          newQuantity: newQty,
          relatedOrder: order._id,
          actor: actorId,
          reason: `${reason} - Order ${order.orderNumber}`
        });
      }
    }

    await syncProductTotalStock(item.product);
  }
}

/**
 * Calculates sum of all active, non-expired batches and updates Product.totalAvailableStock
 */
export async function syncProductTotalStock(productId) {
  const now = new Date();
  const batches = await InventoryBatch.find({
    product: productId,
    batchStatus: 'active',
    expiryDate: { $gt: now }
  });

  const total = batches.reduce((acc, b) => acc + (b.availableQuantity || 0), 0);
  await Product.findByIdAndUpdate(productId, { totalAvailableStock: total });
  return total;
}
