import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Clock, 
  Printer, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Truck, 
  Boxes,
  X
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate, formatDateTime, getOrderStatusBadge } from '../../utils/formatters';
import InvoiceModal from '../../components/InvoiceModal';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Active Order Detail Drawer
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Invoice Modal
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (searchTerm) params.set('search', searchTerm);
      params.set('limit', '50');

      const res = await api.get(`/orders?${params.toString()}`);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchTerm]);

  const handleOpenDetail = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setSelectedOrder(res.data.order);
      setNewStatus(res.data.order.orderStatus);
      setStatusNote('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdatingStatus(true);
    try {
      await api.patch(`/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        note: statusNote
      });

      // Refresh order detail & list
      const res = await api.get(`/orders/${selectedOrder._id}`);
      setSelectedOrder(res.data.order);
      setStatusNote('');
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOpenInvoice = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}/invoice`);
      setInvoiceData(res.data.invoice);
      setInvoiceModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const allStatuses = [
    { value: '', label: 'All Orders' },
    { value: 'order_placed', label: 'Order Placed' },
    { value: 'pending_prescription_review', label: 'Pending Rx' },
    { value: 'prescription_approved', label: 'Rx Approved' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'packed', label: 'Packed' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Management & Fulfillment</h1>
        <p className="text-xs text-slate-500 mt-1">Review incoming patient orders, monitor batch allocations, and advance delivery workflows</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar text-xs">
          {allStatuses.map((st) => (
            <button
              key={st.value}
              onClick={() => setStatusFilter(st.value)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                statusFilter === st.value
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <input
              type="text"
              placeholder="Search by Order # or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <span className="text-xs text-slate-400">{orders.length} orders found</span>
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Items Summary</th>
                <th className="py-3 px-3 text-center">Rx Verification</th>
                <th className="py-3 px-3">Total (INR)</th>
                <th className="py-3 px-3 text-center">Order Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">No orders found matching criteria.</td>
                </tr>
              ) : (
                orders.map((order) => {
                  const badge = getOrderStatusBadge(order.orderStatus);

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-brand-700 text-xs">
                        {order.orderNumber}
                      </td>

                      <td className="py-3 px-3 text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{order.customerSnapshot?.name}</p>
                        <p className="text-[10px] text-slate-400">{order.customerSnapshot?.phone}</p>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-800 line-clamp-1">
                          {order.items?.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                        </p>
                        <p className="text-[10px] text-slate-400">{order.items?.length || 0} item lines</p>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.prescriptionStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          order.prescriptionStatus === 'pending_review' ? 'bg-amber-100 text-amber-800' :
                          order.prescriptionStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {order.prescriptionStatus.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-900">
                        {formatCurrency(order.grandTotal)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenInvoice(order._id)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                            title="Print GST Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDetail(order._id)}
                            className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg transition-colors"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Fulfillment Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-900 font-mono">{selectedOrder.orderNumber}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getOrderStatusBadge(selectedOrder.orderStatus).color}`}>
                    {getOrderStatusBadge(selectedOrder.orderStatus).label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Placed on {formatDateTime(selectedOrder.createdAt)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenInvoice(selectedOrder._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>GST Invoice</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Customer & Delivery address */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Customer Details</h4>
                <p className="font-bold text-slate-900">{selectedOrder.customerSnapshot?.name}</p>
                <p className="text-slate-600">{selectedOrder.customerSnapshot?.email}</p>
                <p className="text-slate-600">{selectedOrder.customerSnapshot?.phone}</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Delivery Address</h4>
                <p className="text-slate-700">{selectedOrder.deliveryAddress?.street}, {selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.state} - {selectedOrder.deliveryAddress?.postalCode}</p>
                {selectedOrder.deliveryAddress?.deliveryInstructions && (
                  <p className="text-amber-800 text-[11px] mt-1 italic">Note: {selectedOrder.deliveryAddress?.deliveryInstructions}</p>
                )}
              </div>
            </div>

            {/* FEFO Batch Allocation Breakdown Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-brand-600" />
                <span>Allocated Items & FEFO Batches</span>
              </h4>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                      <th className="py-2.5 px-3">Item Name</th>
                      <th className="py-2.5 px-3">FEFO Allocated Batches</th>
                      <th className="py-2.5 px-2 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900">{item.productName}</p>
                          <p className="text-[10px] text-slate-400">{item.packSize}</p>
                        </td>

                        <td className="py-2.5 px-3 font-mono text-[10px] space-y-1">
                          {item.batchAllocations?.length > 0 ? (
                            item.batchAllocations.map((b, bIdx) => (
                              <div key={bIdx} className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200 w-fit">
                                Batch {b.batchNumber} (Exp: {formatDate(b.expiryDate)}) × {b.quantity}
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">No batches attached</span>
                          )}
                        </td>

                        <td className="py-2.5 px-2 text-center font-bold text-slate-900">
                          {item.quantity}
                        </td>

                        <td className="py-2.5 px-3 text-right text-slate-700">
                          {formatCurrency(item.unitPrice)}
                        </td>

                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatCurrency(item.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Advance Status Form */}
            <form onSubmit={handleUpdateStatus} className="p-4 bg-brand-50/50 rounded-2xl border border-brand-100 space-y-3 text-xs">
              <h4 className="font-bold text-brand-900 uppercase tracking-wider text-[10px]">
                Update Order Lifecycle Status
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Next Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="order_placed">Order Placed</option>
                    <option value="pending_prescription_review">Pending Rx Review</option>
                    <option value="prescription_approved">Prescription Approved</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing / Picking</option>
                    <option value="packed">Packed</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status Transition Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Dispatched via Express Pharma Courier"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {isUpdatingStatus ? 'Updating...' : 'Save Status Update'}
                </button>
              </div>
            </form>

            {/* Audit Status History */}
            {selectedOrder.statusHistory?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Audit History Trail
                </h4>
                <div className="space-y-1 text-[11px] text-slate-600 max-h-36 overflow-y-auto pr-1">
                  {selectedOrder.statusHistory.map((h, hIdx) => (
                    <div key={hIdx} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 uppercase text-[10px]">{h.status}:</span>
                        <span className="ml-1 text-slate-600">{h.note || 'Status updated'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{formatDateTime(h.changedAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
