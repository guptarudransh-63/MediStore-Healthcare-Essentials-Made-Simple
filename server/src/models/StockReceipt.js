import mongoose from 'mongoose';

const stockReceiptItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  batchNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  mfgDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalCost: {
    type: Number,
    required: true
  },
  storageLocation: {
    type: String,
    default: 'Standard Storage'
  }
});

const stockReceiptSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true
    },
    invoiceNumber: {
      type: String,
      required: true,
      trim: true
    },
    invoiceDate: {
      type: Date,
      default: Date.now
    },
    receivedDate: {
      type: Date,
      default: Date.now
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [stockReceiptItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'partial'],
      default: 'paid'
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

export const StockReceipt = mongoose.model('StockReceipt', stockReceiptSchema);
