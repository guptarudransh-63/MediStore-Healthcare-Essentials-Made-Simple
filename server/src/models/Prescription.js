import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    fileUrl: {
      type: String,
      required: true
    },
    originalFileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    patientName: {
      type: String,
      default: ''
    },
    patientAge: {
      type: Number
    },
    doctorName: {
      type: String,
      default: ''
    },
    doctorRegNumber: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending_review', 'under_review', 'approved', 'rejected', 'clarification_required', 'expired'],
      default: 'pending_review',
      index: true
    },
    reviewNotes: {
      type: String,
      default: ''
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    validUntil: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const Prescription = mongoose.model('Prescription', prescriptionSchema);
