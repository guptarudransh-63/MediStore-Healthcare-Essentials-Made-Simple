import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  AlertTriangle, 
  Sliders, 
  Layers, 
  Plus, 
  Check, 
  X,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate, getExpiryTag } from '../../utils/formatters';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [productBatches, setProductBatches] = useState({});
  const [loadingBatches, setLoadingBatches] = useState({});

  // Adjustment Modal
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [adjustingBatch, setAdjustingBatch] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('damaged_removal');
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [sumRes, prodRes] = await Promise.all([
        api.get('/inventory/summary'),
        api.get('/products?limit=100')
      ]);
      setSummary(sumRes.data.summary);
      setProducts(prodRes.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const toggleExpand = async (productId) => {
    if (expandedProduct === productId) {
      setExpandedProduct(null);
      return;
    }

    setExpandedProduct(productId);
    if (!productBatches[productId]) {
      setLoadingBatches(prev => ({ ...prev, [productId]: true }));
      try {
        const res = await api.get(`/inventory/batches?product=${productId}`);
        setProductBatches(prev => ({ ...prev, [productId]: res.data.batches || [] }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBatches(prev => ({ ...prev, [productId]: false }));
      }
    }
  };

  const handleOpenAdjustment = (batch) => {
    setAdjustingBatch(batch);
    setAdjustmentType('damaged_removal');
    setAdjustmentQty('');
    setAdjustmentReason('');
    setAdjustmentModalOpen(true);
  };

  const submitAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustingBatch) return;

    setIsAdjusting(true);
    try {
      await api.post('/inventory/adjustment', {
        batchId: adjustingBatch._id,
        adjustmentType,
        quantityChange: adjustmentType === 'damaged_removal' ? -Math.abs(parseInt(adjustmentQty, 10)) : parseInt(adjustmentQty, 10),
        reason: adjustmentReason
      });

      setAdjustmentModalOpen(false);
      // Reload batches for that product and inventory summary
      const res = await api.get(`/inventory/batches?product=${adjustingBatch.product._id || adjustingBatch.product}`);
      setProductBatches(prev => ({ ...prev, [adjustingBatch.product._id || adjustingBatch.product]: res.data.batches || [] }));
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording adjustment');
    } finally {
      setIsAdjusting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Batch-Level Inventory</h1>
        <p className="text-xs text-slate-500 mt-1">Multi-batch tracking, FEFO priority queues, and live stock adjustments</p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stock Units</span>
          <p className="text-2xl font-black text-slate-900">{summary?.totalStockUnits || 0}</p>
          <p className="text-[11px] text-slate-500">Across {summary?.totalProducts || 0} catalog formulations</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Value</span>
          <p className="text-2xl font-black text-brand-700">{formatCurrency(summary?.totalInventoryValue)}</p>
          <p className="text-[11px] text-slate-500">Based on batch purchase price</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Near-Expiry Batches</span>
          <p className="text-2xl font-black text-amber-600">{summary?.nearExpiryBatchesCount || 0}</p>
          <p className="text-[11px] text-amber-700 font-medium">Expiring within 30 days</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Products</span>
          <p className="text-2xl font-black text-rose-600">{summary?.lowStockCount || 0}</p>
          <p className="text-[11px] text-slate-500">At or below reorder threshold</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Filter by product name, SKU, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <p className="text-xs text-slate-500">{filteredProducts.length} formulations displayed</p>
      </div>

      {/* Products with Nested Batch Accordion Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3 px-4 w-10"></th>
                <th className="py-3 px-3">Medicine Description</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Dosage / Pack</th>
                <th className="py-3 px-3 text-center">Reorder Level</th>
                <th className="py-3 px-3 text-center">Total Available Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((prod) => {
                const isExpanded = expandedProduct === prod._id;
                const isLow = prod.totalAvailableStock <= prod.reorderThreshold;
                const batches = productBatches[prod._id] || [];

                return (
                  <React.Fragment key={prod._id}>
                    <tr 
                      onClick={() => toggleExpand(prod._id)}
                      className={`cursor-pointer transition-colors ${
                        isExpanded ? 'bg-brand-50/40' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-brand-600" /> : <ChevronRight className="w-4 h-4" />}
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{prod.name}</span>
                          {prod.prescriptionClassification === 'rx_required' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Rx
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-normal">{prod.brand} • {prod.manufacturer}</p>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                        {prod.sku}
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        {prod.dosageForm} ({prod.packSize})
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-slate-500">
                        {prod.reorderThreshold}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                          prod.totalAvailableStock === 0
                            ? 'bg-red-100 text-red-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {prod.totalAvailableStock} Units
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(prod._id);
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          {isExpanded ? 'Hide Batches' : 'View Batches'}
                        </button>
                      </td>
                    </tr>

                    {/* Nested Batches Sub-Table */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="p-0 bg-slate-50/80 border-y border-slate-200">
                          <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                <Layers className="w-4 h-4 text-brand-600" />
                                <span>Recorded Batches for {prod.name} (FEFO Priority Queue)</span>
                              </h4>
                              <span className="text-[11px] text-slate-400">Order allocations deduct automatically from top of queue</span>
                            </div>

                            {loadingBatches[prod._id] ? (
                              <div className="py-6 text-center text-xs text-slate-400">Loading batch details...</div>
                            ) : batches.length === 0 ? (
                              <div className="py-6 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                                No batches currently recorded for this product. Use <strong>Receive Stock</strong> to add inventory batches.
                              </div>
                            ) : (
                              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="bg-slate-100 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                                      <th className="py-2.5 px-3">Batch Number</th>
                                      <th className="py-2.5 px-3">Expiry Date & Status</th>
                                      <th className="py-2.5 px-3">Available / Reserved / Received</th>
                                      <th className="py-2.5 px-3">Purchase Cost</th>
                                      <th className="py-2.5 px-3">Location</th>
                                      <th className="py-2.5 px-3">Batch Status</th>
                                      <th className="py-2.5 px-3 text-right">Adjustment</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-[11px]">
                                    {batches.map((batch) => {
                                      const expTag = getExpiryTag(batch.expiryDate);

                                      return (
                                        <tr key={batch._id} className="hover:bg-slate-50/50">
                                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                                            {batch.batchNumber}
                                          </td>

                                          <td className="py-2.5 px-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] border ${expTag.color}`}>
                                              {expTag.label}
                                            </span>
                                          </td>

                                          <td className="py-2.5 px-3">
                                            <strong className="text-slate-900 font-bold">{batch.availableQuantity}</strong>
                                            <span className="text-slate-400"> / {batch.reservedQuantity} / {batch.quantityReceived}</span>
                                          </td>

                                          <td className="py-2.5 px-3 font-semibold text-slate-700">
                                            {formatCurrency(batch.purchasePrice)}
                                          </td>

                                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[10px]">
                                            {batch.storageLocation}
                                          </td>

                                          <td className="py-2.5 px-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                              batch.batchStatus === 'active' ? 'bg-emerald-50 text-emerald-800' :
                                              batch.batchStatus === 'expired' ? 'bg-red-100 text-red-800' :
                                              batch.batchStatus === 'quarantined' ? 'bg-amber-100 text-amber-800' :
                                              'bg-slate-100 text-slate-600'
                                            }`}>
                                              {batch.batchStatus}
                                            </span>
                                          </td>

                                          <td className="py-2.5 px-3 text-right">
                                            <button
                                              onClick={() => handleOpenAdjustment(batch)}
                                              className="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 text-brand-700 hover:text-brand-800 rounded font-bold transition-colors"
                                            >
                                              Adjust Stock
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {adjustmentModalOpen && adjustingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Stock Adjustment</h3>
                <p className="text-xs text-slate-400">Batch: <strong className="font-mono text-slate-700">{adjustingBatch.batchNumber}</strong></p>
              </div>
              <button onClick={() => setAdjustmentModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitAdjustment} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Adjustment Type</label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="damaged_removal">Damaged Stock Removal (Deduct)</option>
                  <option value="expired_removal">Expired Stock Discard (Deduct)</option>
                  <option value="stock_correction">Physical Audit Correction (+ / -)</option>
                  <option value="quarantine_hold">Move to Quarantine Hold</option>
                  <option value="quarantine_release">Release from Quarantine</option>
                </select>
              </div>

              {['damaged_removal', 'expired_removal', 'stock_correction'].includes(adjustmentType) && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {adjustmentType === 'stock_correction' ? 'Adjustment Quantity (+ or -)' : 'Quantity to Deduct *'}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder={adjustmentType === 'stock_correction' ? '-5 or 10' : 'Units'}
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Current available in batch: {adjustingBatch.availableQuantity} units
                  </p>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Audit Log Reason *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Broken vial during shelf stocking / Physical recount discrepancy"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustmentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm"
                >
                  {isAdjusting ? 'Saving Adjustment...' : 'Record Adjustment'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
