import mongoose from 'mongoose';

const inventoryMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryBatch',
      required: true,
      index: true
    },
    movementType: {
      type: String,
      enum: [
        'stock_in',
        'stock_out_order',
        'order_cancellation_return',
        'damaged_removal',
        'expired_removal',
        'stock_correction',
        'quarantine_hold',
        'quarantine_release'
      ],
      required: true
    },
    quantityChange: {
      type: Number,
      required: true
    },
    previousQuantity: {
      type: Number,
      required: true
    },
    newQuantity: {
      type: Number,
      required: true
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    relatedReceipt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StockReceipt'
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);
