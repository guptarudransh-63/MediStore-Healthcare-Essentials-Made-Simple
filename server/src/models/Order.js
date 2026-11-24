import mongoose from 'mongoose';

const batchAllocationSchema = new mongoose.Schema({
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryBatch',
    required: true
  },
  batchNumber: {
    type: String,
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
  unitPrice: {
    type: Number,
    required: true
  }
});

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  dosageForm: {
    type: String,
    default: 'Tablet'
  },
  packSize: {
    type: String,
    default: '10'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true
  },
  taxRate: {
    type: Number,
    default: 12
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  requiresPrescription: {
    type: Boolean,
    default: false
  },
  batchAllocations: [batchAllocationSchema]
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    default: ''
  }
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    customerSnapshot: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' }
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      landmark: { type: String, default: '' },
      deliveryInstructions: { type: String, default: '' }
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    taxTotal: {
      type: Number,
      required: true
    },
    cgst: {
      type: Number,
      default: 0
    },
    sgst: {
      type: Number,
      default: 0
    },
    deliveryCharge: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      required: true
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription'
    },
    prescriptionStatus: {
      type: String,
      enum: ['not_required', 'pending_review', 'approved', 'rejected'],
      default: 'not_required'
    },
    paymentMethod: {
      type: String,
      enum: ['cash_on_delivery', 'upi', 'card', 'net_banking'],
      default: 'cash_on_delivery'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    orderStatus: {
      type: String,
      enum: [
        'order_placed',
        'pending_prescription_review',
        'prescription_approved',
        'confirmed',
        'processing',
        'packed',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'rejected'
      ],
      default: 'order_placed',
      index: true
    },
    statusHistory: [statusHistorySchema],
    invoiceNumber: {
      type: String,
      default: ''
    },
    internalNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Order = mongoose.model('Order', orderSchema);
