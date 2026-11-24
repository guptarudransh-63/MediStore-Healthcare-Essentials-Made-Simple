import mongoose from 'mongoose';

const inventoryBatchSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    batchNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true
    },
    mfgDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true
    },
    quantityReceived: {
      type: Number,
      required: true,
      min: 1
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true
    },
    stockReceivedDate: {
      type: Date,
      default: Date.now
    },
    storageLocation: {
      type: String,
      default: 'Main Storage Shelf A'
    },
    batchStatus: {
      type: String,
      enum: ['active', 'quarantined', 'expired', 'recalled', 'depleted'],
      default: 'active',
      index: true
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index to guarantee uniqueness of batch number per product
inventoryBatchSchema.index({ product: 1, batchNumber: 1 }, { unique: true });

export const InventoryBatch = mongoose.model('InventoryBatch', inventoryBatchSchema);
