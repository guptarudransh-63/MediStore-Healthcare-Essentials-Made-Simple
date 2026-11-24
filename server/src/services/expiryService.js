import { InventoryBatch } from '../models/InventoryBatch.js';
import { Product } from '../models/Product.js';
import { InventoryMovement } from '../models/InventoryMovement.js';

export async function getExpiryAnalysis() {
  const now = new Date();
  const day7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const day30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const day60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const day90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // Fetch all batches with availableQuantity > 0 or expired status
  const batches = await InventoryBatch.find({
    availableQuantity: { $gt: 0 }
  }).populate('product', 'name sku brand genericName sellingPrice purchasePrice')
    .populate('supplier', 'name phone')
    .sort({ expiryDate: 1 });

  const expiredBatches = [];
  const within7Days = [];
  const within30Days = [];
  const within60Days = [];
  const within90Days = [];
  const safeBatches = [];

  let totalValueAtRisk = 0;
  let expiredValue = 0;
  let nearExpiryValue = 0; // <= 30 days

  for (const b of batches) {
    const expDate = new Date(b.expiryDate);
    const value = (b.availableQuantity || 0) * (b.purchasePrice || 0);

    if (expDate <= now) {
      expiredBatches.push(b);
      expiredValue += value;
    } else if (expDate <= day7) {
      within7Days.push(b);
      nearExpiryValue += value;
      totalValueAtRisk += value;
    } else if (expDate <= day30) {
      within30Days.push(b);
      nearExpiryValue += value;
      totalValueAtRisk += value;
    } else if (expDate <= day60) {
      within60Days.push(b);
      totalValueAtRisk += value;
    } else if (expDate <= day90) {
      within90Days.push(b);
      totalValueAtRisk += value;
    } else {
      safeBatches.push(b);
    }
  }

  return {
    summary: {
      expiredCount: expiredBatches.length,
      expiredUnits: expiredBatches.reduce((a, b) => a + b.availableQuantity, 0),
      expiredValue,
      within7DaysCount: within7Days.length,
      within7DaysUnits: within7Days.reduce((a, b) => a + b.availableQuantity, 0),
      within30DaysCount: within30Days.length,
      within30DaysUnits: within30Days.reduce((a, b) => a + b.availableQuantity, 0),
      nearExpiryValue, // within 30 days
      within60DaysCount: within60Days.length,
      within90DaysCount: within90Days.length,
      totalValueAtRisk,
      safeBatchesCount: safeBatches.length
    },
    expiredBatches,
    within7Days,
    within30Days,
    within60Days,
    within90Days
  };
}

/**
 * Quarantines or discards an expired batch and logs movement.
 */
export async function removeExpiredBatch({ batchId, actorId, reason = 'Expired stock removal' }) {
  const batch = await InventoryBatch.findById(batchId);
  if (!batch) {
    throw new Error('Batch not found');
  }

  const prevQty = batch.availableQuantity;
  batch.availableQuantity = 0;
  batch.batchStatus = 'expired';
  await batch.save();

  await InventoryMovement.create({
    product: batch.product,
    batch: batch._id,
    movementType: 'expired_removal',
    quantityChange: -prevQty,
    previousQuantity: prevQty,
    newQuantity: 0,
    actor: actorId,
    reason
  });

  // Re-sync product stock
  const now = new Date();
  const batches = await InventoryBatch.find({
    product: batch.product,
    batchStatus: 'active',
    expiryDate: { $gt: now }
  });
  const total = batches.reduce((acc, b) => acc + (b.availableQuantity || 0), 0);
  await Product.findByIdAndUpdate(batch.product, { totalAvailableStock: total });

  return batch;
}
