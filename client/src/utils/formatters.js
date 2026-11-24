export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount || 0);
};

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getOrderStatusBadge = (status) => {
  switch (status) {
    case 'order_placed':
      return { label: 'Order Placed', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'pending_prescription_review':
      return { label: 'Awaiting Rx Review', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'prescription_approved':
      return { label: 'Rx Approved', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'confirmed':
      return { label: 'Confirmed', color: 'bg-teal-100 text-teal-800 border-teal-200' };
    case 'processing':
      return { label: 'Processing', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    case 'packed':
      return { label: 'Packed', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    case 'ready_for_pickup':
      return { label: 'Ready for Pickup', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
    case 'out_for_delivery':
      return { label: 'Out for Delivery', color: 'bg-amber-100 text-amber-900 border-amber-300' };
    case 'delivered':
      return { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200' };
    case 'cancelled':
      return { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' };
    case 'rejected':
      return { label: 'Rejected', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    default:
      return { label: status || 'Unknown', color: 'bg-slate-100 text-slate-800 border-slate-200' };
  }
};

export const getPrescriptionStatusBadge = (status) => {
  switch (status) {
    case 'approved':
      return { label: 'Approved', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'pending_review':
      return { label: 'Under Review', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'clarification_required':
      return { label: 'Clarification Needed', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    case 'rejected':
      return { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' };
    case 'expired':
      return { label: 'Expired', color: 'bg-slate-200 text-slate-700 border-slate-300' };
    default:
      return { label: 'Not Required', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  }
};

export const getExpiryTag = (expiryDate) => {
  const now = new Date();
  const exp = new Date(expiryDate);
  const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { label: 'EXPIRED', color: 'bg-red-600 text-white font-bold', urgency: 'critical', days: diffDays };
  } else if (diffDays <= 7) {
    return { label: `Expiring in ${diffDays}d`, color: 'bg-red-100 text-red-800 border-red-300 font-semibold', urgency: 'high', days: diffDays };
  } else if (diffDays <= 30) {
    return { label: `Expiring in ${diffDays}d`, color: 'bg-amber-100 text-amber-800 border-amber-300 font-medium', urgency: 'medium', days: diffDays };
  } else if (diffDays <= 90) {
    return { label: `Expiring in ${diffDays}d`, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', urgency: 'low', days: diffDays };
  } else {
    return { label: `Safe (${formatDate(expiryDate)})`, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', urgency: 'safe', days: diffDays };
  }
};
