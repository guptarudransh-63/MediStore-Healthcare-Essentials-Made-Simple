import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  AlertTriangle, 
  CalendarClock, 
  ShieldCheck, 
  Trash2, 
  X,
  Plus
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate, getExpiryTag } from '../../utils/formatters';

export default function AdminBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expiryFilter, setExpiryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (expiryFilter) params.set('expiryFilter', expiryFilter);
      if (searchTerm) params.set('search', searchTerm);
      params.set('limit', '100');

      const res = await api.get(`/inventory/batches?${params.toString()}`);
      setBatches(res.data.batches || []);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [expiryFilter, searchTerm]);

  const handleQuarantineExpired = async (batchId, batchNo) => {
    const reason = prompt(`Enter reason for quarantining/removing expired batch ${batchNo}:`, 'Expired stock removal from active inventory');
    if (reason) {
      try {
        await api.post('/inventory/remove-expired', { batchId, reason });
        fetchBatches();
      } catch (err) {
        alert(err.response?.data?.message || 'Error updating batch');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Batches & FEFO Queue</h1>
        <p className="text-xs text-slate-500 mt-1">First-Expiry, First-Out sequence tracking across all active stock batches</p>
      </div>

      {/* Expiry Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setExpiryFilter('')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              !expiryFilter ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Batches
          </button>
          <button
            onClick={() => setExpiryFilter('expired')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              expiryFilter === 'expired' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Expired
          </button>
          <button
            onClick={() => setExpiryFilter('within7')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              expiryFilter === 'within7' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            ≤ 7 Days Critical
          </button>
          <button
            onClick={() => setExpiryFilter('within30')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              expiryFilter === 'within30' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            ≤ 30 Days Near Expiry
          </button>
          <button
            onClick={() => setExpiryFilter('within90')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              expiryFilter === 'within90' ? 'bg-yellow-600 text-white' : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100'
            }`}
          >
            ≤ 90 Days Watchlist
          </button>
          <button
            onClick={() => setExpiryFilter('safe')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              expiryFilter === 'safe' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Safe Stock (&gt;90d)
          </button>
        </div>

        {/* Search */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <input
              type="text"
              placeholder="Search batch number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <span className="text-xs text-slate-400">{batches.length} batches listed</span>
        </div>

      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-3">Product Name & SKU</th>
                <th className="py-3 px-3">Expiry Date & Timeline</th>
                <th className="py-3 px-3 text-center">Available Stock</th>
                <th className="py-3 px-3">Purchase Price</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">Loading batches...</td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">No batches match the selected criteria.</td>
                </tr>
              ) : (
                batches.map((batch) => {
                  const expTag = getExpiryTag(batch.expiryDate);
                  const isExpired = expTag.urgency === 'critical';

                  return (
                    <tr key={batch._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs">
                        {batch.batchNumber}
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-800 line-clamp-1">{batch.product?.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{batch.product?.sku}</p>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] border ${expTag.color}`}>
                          {expTag.label}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Exp: {formatDate(batch.expiryDate)}</p>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="font-black text-slate-900 text-xs">{batch.availableQuantity}</span>
                        <span className="text-slate-400 text-[10px]"> / {batch.quantityReceived}</span>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {formatCurrency(batch.purchasePrice)}
                      </td>

                      <td className="py-3 px-3 text-slate-600 truncate max-w-xs">
                        {batch.supplier?.name || '-'}
                      </td>

                      <td className="py-3 px-3 font-mono text-[10px] text-slate-500">
                        {batch.storageLocation}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          batch.batchStatus === 'active' ? 'bg-emerald-50 text-emerald-800' :
                          batch.batchStatus === 'expired' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {batch.batchStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {(isExpired || batch.batchStatus === 'expired') && batch.availableQuantity > 0 ? (
                          <button
                            onClick={() => handleQuarantineExpired(batch._id, batch.batchNumber)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded font-bold transition-colors"
                            title="Quarantine and deduct from sellable stock"
                          >
                            Quarantine
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
