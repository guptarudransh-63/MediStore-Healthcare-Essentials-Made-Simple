import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, FileText, ArrowRight, Printer, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDate, getOrderStatusBadge } from '../utils/formatters';
import InvoiceModal from '../components/InvoiceModal';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleOpenInvoice = async () => {
    try {
      const res = await api.get(`/orders/${id}/invoice`);
      setInvoiceData(res.data.invoice);
      setInvoiceModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-slate-500">Confirming order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Order not found</h2>
        <Link to="/" className="text-xs font-bold text-brand-600">Return to Storefront</Link>
      </div>
    );
  }

  const badge = getOrderStatusBadge(order.orderStatus);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      
      {/* Success Banner */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Order Confirmed & Processed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Thank you for your order!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Order Reference: <strong className="text-slate-800 font-mono text-sm">{order.orderNumber}</strong>
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border" style={{ backgroundColor: 'transparent' }}>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}>
            {badge.label}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600 font-medium">Payment: {order.paymentMethod?.toUpperCase()} ({order.paymentStatus})</span>
        </div>

        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          {order.prescriptionStatus === 'pending_review' ? (
            <span className="text-amber-800 bg-amber-50 p-2.5 rounded-xl block border border-amber-200">
              Your prescription has been submitted to our licensed pharmacist for verification. Once approved, items will be dispatched immediately.
            </span>
          ) : (
            <span>Your healthcare package is being prepared for express delivery to your address.</span>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={handleOpenInvoice}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>View GST Tax Invoice</span>
          </button>

          <Link
            to="/my-orders"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            <span>Track in My Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Order Itemized Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Order Items & Batch Allocations
        </h3>

        <div className="divide-y divide-slate-100">
          {order.items?.map((item, idx) => (
            <div key={idx} className="py-3 flex justify-between items-start text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-900">{item.productName}</p>
                <p className="text-[11px] text-slate-500">
                  Qty: {item.quantity} • Rate: {formatCurrency(item.unitPrice)}
                </p>
                {/* FEFO Batch Badges */}
                {item.batchAllocations?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.batchAllocations.map((b, bIdx) => (
                      <span key={bIdx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-50 text-teal-800 border border-teal-200">
                        Batch: {b.batchNumber} (Exp: {formatDate(b.expiryDate)}) × {b.quantity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="font-bold text-slate-800 text-sm">
                {formatCurrency(item.totalAmount)}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Totals */}
        <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>GST Total:</span>
            <span>{formatCurrency(order.taxTotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Delivery:</span>
            <span>{order.deliveryCharge === 0 ? <strong className="text-emerald-600">FREE</strong> : formatCurrency(order.deliveryCharge)}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
            <span>Grand Total:</span>
            <span className="text-brand-700">{formatCurrency(order.grandTotal)}</span>
          </div>
        </div>

        {/* Delivery Address Snapshot */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
          <p className="font-bold text-slate-800 mb-1">Delivering to:</p>
          <p>{order.customerSnapshot?.name} • {order.customerSnapshot?.phone}</p>
          <p>{order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.postalCode}</p>
        </div>
      </div>

      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        invoice={invoiceData}
      />

    </div>
  );
}
