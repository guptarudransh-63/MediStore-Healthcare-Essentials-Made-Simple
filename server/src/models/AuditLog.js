import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      required: true
    },
    entityType: {
      type: String,
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    previousState: {
      type: mongoose.Schema.Types.Mixed
    },
    newState: {
      type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
