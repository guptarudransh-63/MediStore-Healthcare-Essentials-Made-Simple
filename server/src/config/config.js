export const APP_CONFIG = {
  pharmacy: {
    name: process.env.PHARMACY_NAME || 'MediStore Pharmacy & Healthcare Solutions',
    address: process.env.PHARMACY_ADDRESS || 'Plot 42, Health City, Sector 18, Gurugram, Haryana 122001',
    phone: process.env.PHARMACY_PHONE || '+91 98765 43210',
    email: process.env.PHARMACY_EMAIL || 'support@medistore.health',
    gstin: process.env.PHARMACY_GSTIN || '06AAAAA0000A1Z5',
    dlNumber: process.env.PHARMACY_DL || 'HR-GGM-2024-DL009876',
    currency: 'INR',
    currencySymbol: '₹'
  },
  expiryThresholds: {
    criticalDays: 7,
    nearExpiryDays: 30,
    alertDays60: 60,
    alertDays90: 90
  },
  roles: {
    CUSTOMER: 'customer',
    PHARMACIST: 'pharmacist',
    ADMIN: 'admin'
  },
  orderStatuses: {
    ORDER_PLACED: 'order_placed',
    PENDING_PRESCRIPTION_REVIEW: 'pending_prescription_review',
    PRESCRIPTION_APPROVED: 'prescription_approved',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    PACKED: 'packed',
    READY_FOR_PICKUP: 'ready_for_pickup',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected'
  },
  prescriptionStatuses: {
    NOT_REQUIRED: 'not_required',
    PENDING_REVIEW: 'pending_review',
    UNDER_REVIEW: 'under_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CLARIFICATION_REQUIRED: 'clarification_required',
    EXPIRED: 'expired'
  },
  prescriptionClassifications: {
    RX_REQUIRED: 'rx_required',
    NON_PRESCRIPTION: 'non_prescription',
    RESTRICTED: 'restricted'
  },
  batchStatuses: {
    ACTIVE: 'active',
    QUARANTINED: 'quarantined',
    EXPIRED: 'expired',
    RECALLED: 'recalled',
    DEPLETED: 'depleted'
  }
};
