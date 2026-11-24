import { APP_CONFIG } from '../config/config.js';

export function formatTaxInvoice(order) {
  const pharmacy = APP_CONFIG.pharmacy;
  const isInterState = order.deliveryAddress?.state && 
    order.deliveryAddress.state.trim().toLowerCase() !== 'haryana'; // Pharmacy is registered in Haryana

  const invoiceNumber = order.invoiceNumber || `INV-${order.orderNumber}`;
  const invoiceDate = order.createdAt;

  const items = order.items.map((item, idx) => {
    const rate = item.unitPrice;
    const qty = item.quantity;
    const taxableValue = Number((rate * qty).toFixed(2));
    const taxRate = item.taxRate || 12;
    const totalTax = Number(((taxableValue * taxRate) / 100).toFixed(2));

    const batchesList = (item.batchAllocations || []).map(b => `${b.batchNumber} (Exp: ${new Date(b.expiryDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })})`).join(', ');

    return {
      srNo: idx + 1,
      name: item.productName,
      sku: item.sku,
      dosageForm: item.dosageForm,
      packSize: item.packSize,
      hsnCode: item.hsnCode || '3004',
      batchInfo: batchesList || 'Default Stock',
      qty,
      rate,
      taxableValue,
      taxRate: `${taxRate}%`,
      taxAmount: totalTax,
      totalAmount: taxableValue + totalTax
    };
  });

  return {
    invoiceNumber,
    orderNumber: order.orderNumber,
    date: invoiceDate,
    pharmacy: {
      name: pharmacy.name,
      address: pharmacy.address,
      phone: pharmacy.phone,
      email: pharmacy.email,
      gstin: pharmacy.gstin,
      dlNumber: pharmacy.dlNumber
    },
    customer: {
      name: order.customerSnapshot?.name || 'Walk-in Customer',
      email: order.customerSnapshot?.email || '',
      phone: order.customerSnapshot?.phone || '',
      address: `${order.deliveryAddress?.street || ''}, ${order.deliveryAddress?.city || ''}, ${order.deliveryAddress?.state || ''} - ${order.deliveryAddress?.postalCode || ''}`
    },
    items,
    pricing: {
      subtotal: order.subtotal,
      discount: order.discountAmount || 0,
      cgst: isInterState ? 0 : Number((order.taxTotal / 2).toFixed(2)),
      sgst: isInterState ? 0 : Number((order.taxTotal / 2).toFixed(2)),
      igst: isInterState ? order.taxTotal : 0,
      taxTotal: order.taxTotal,
      deliveryCharge: order.deliveryCharge || 0,
      grandTotal: order.grandTotal
    },
    payment: {
      method: order.paymentMethod,
      status: order.paymentStatus
    },
    prescriptionStatus: order.prescriptionStatus,
    prescriptionId: order.prescription
  };
}
