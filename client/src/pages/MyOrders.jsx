import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Printer, 
  XCircle, 
  Clock, 
  ChevronRight, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Package
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDate, formatDateTime, getOrderStatusBadge } from '../utils/formatters';
import InvoiceModal from '../components/InvoiceModal';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenInvoice = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}/invoice`);
      setInvoiceData(res.data.invoice);
      setInvoiceModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;
    setIsCancelling(true);
    try {
      await api.post(`/orders/${cancelModalOrder._id}/cancel`, { reason: cancelReason });
      setCancelModalOrder(null);
      setCancelReason('');
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancel = (status) => {
    return ['order_placed', 'pending_prescription_review', 'prescription_approved', 'confirmed'].includes(status);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Order History
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Track medicine deliveries, batch allocations, and access certified GST invoices.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No orders placed yet</h3>
          <p className="text-xs text-slate-500">Your ordered medications and health essentials will appear here.</p>
          <Link to="/products" className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = getOrderStatusBadge(order.orderStatus);

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-colors space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900 text-sm font-mono">{order.orderNumber}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{formatDate(order.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <button
                      onClick={() => handleOpenInvoice(order._id)}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                      title="View GST Invoice"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>

                {/* Items Summary & Batch Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  <div className="md:col-span-8 space-y-2 text-xs">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-800">{item.quantity} × {item.productName}</span>
                          <span className="text-slate-400 text-[11px] ml-2">({item.packSize})</span>
                        </div>
                        <span className="font-bold text-slate-900">{formatCurrency(item.totalAmount)}</span>
                      </div>
                    ))}

                    {/* Batch Allocations preview */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {order.items?.flatMap(item => item.batchAllocations || []).map((b, bIdx) => (
                        <span key={bIdx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-50 text-teal-800 border border-teal-200">
                          FEFO Batch: {b.batchNumber} (Exp: {formatDate(b.expiryDate)})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Total and Cancellation */}
                  <div className="md:col-span-4 flex flex-col items-start md:items-end justify-between space-y-2 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Total Paid</p>
                      <p className="text-lg font-black text-brand-700">{formatCurrency(order.grandTotal)}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{order.paymentMethod} • {order.paymentStatus}</p>
                    </div>

                    {canCancel(order.orderStatus) && (
                      <button
                        onClick={() => setCancelModalOrder(order)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline pt-1"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>

                </div>

                {/* Status history last update */}
                {order.statusHistory?.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-600 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span><strong>Status Note:</strong> {order.statusHistory[order.statusHistory.length - 1].note || 'Updated'}</span>
                    </div>
                    <span className="text-slate-400 text-[10px]">
                      {formatDateTime(order.statusHistory[order.statusHistory.length - 1].changedAt)}
                    </span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Cancel Order {cancelModalOrder.orderNumber}?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Cancelling this order will automatically release allocated batch stock back to inventory.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reason for Cancellation</label>
              <textarea
                rows={2}
                placeholder="e.g. Ordered incorrect dosage / Changed mind"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setCancelModalOrder(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        invoice={invoiceData}
      />

    </div>
  );
}
