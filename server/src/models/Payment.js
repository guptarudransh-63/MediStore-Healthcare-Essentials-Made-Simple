import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    provider: {
      type: String,
      enum: ['cash_on_delivery', 'razorpay_mock', 'upi', 'bank_transfer'],
      default: 'cash_on_delivery'
    },
    transactionId: {
      type: String,
      default: () => `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['pending', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    refundReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Payment = mongoose.model('Payment', paymentSchema);
