import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Trash2, 
  DollarSign, 
  Boxes,
  FileSpreadsheet
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate, getExpiryTag } from '../../utils/formatters';

export default function AdminExpiry() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expired'); // 'expired', 'within7', 'within30', 'within60'

  const fetchExpiryData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/expiry-alerts');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiryData();
  }, []);

  const handleQuarantine = async (batchId, batchNo) => {
    const reason = prompt(`Quarantine & Remove Expired Batch ${batchNo}? Enter reason:`, 'Quarantined and removed from active sellable inventory');
    if (reason) {
      try {
        await api.post('/inventory/remove-expired', { batchId, reason });
        fetchExpiryData();
      } catch (err) {
        alert(err.response?.data?.message || 'Error quarantining batch');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const currentList = 
    activeTab === 'expired' ? data?.expiredBatches || [] :
    activeTab === 'within7' ? data?.within7Days || [] :
    activeTab === 'within30' ? data?.within30Days || [] :
    data?.within60Days || [];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Expiry Tracking & Risk Management</h1>
        <p className="text-xs text-slate-500 mt-1">Multi-tier expiry monitoring, financial risk mitigation, and quarantine disposal</p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expired Batches</span>
          <p className="text-2xl font-black text-red-600">{summary.expiredCount || 0}</p>
          <p className="text-[11px] text-slate-500">{summary.expiredUnits || 0} units at risk ({formatCurrency(summary.expiredValue)})</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical (≤ 7 Days)</span>
          <p className="text-2xl font-black text-rose-600">{summary.within7DaysCount || 0}</p>
          <p className="text-[11px] text-slate-500">{summary.within7DaysUnits || 0} units near critical expiry</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Near Expiry (≤ 30 Days)</span>
          <p className="text-2xl font-black text-amber-600">{summary.within30DaysCount || 0}</p>
          <p className="text-[11px] text-amber-700 font-medium">{formatCurrency(summary.nearExpiryValue)} inventory value</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Value At Risk</span>
          <p className="text-2xl font-black text-brand-700">{formatCurrency(summary.totalValueAtRisk)}</p>
          <p className="text-[11px] text-slate-500">Across batches expiring ≤ 90 days</p>
        </div>

      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => setActiveTab('expired')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${
            activeTab === 'expired' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Expired Stock ({summary.expiredCount || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('within7')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${
            activeTab === 'within7' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>≤ 7 Days Critical ({summary.within7DaysCount || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('within30')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${
            activeTab === 'within30' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>≤ 30 Days Near Expiry ({summary.within30DaysCount || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('within60')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${
            activeTab === 'within60' ? 'bg-yellow-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>≤ 60 Days Watchlist ({summary.within60DaysCount || 0})</span>
        </button>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3 px-4">Medicine / Formulation</th>
                <th className="py-3 px-3">Batch Number</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Days Remaining</th>
                <th className="py-3 px-3 text-center">Available Units</th>
                <th className="py-3 px-3">Cost per Unit</th>
                <th className="py-3 px-3">At-Risk Value</th>
                <th className="py-3 px-3">Supplier Reference</th>
                <th className="py-3 px-4 text-right">Quarantine Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {currentList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No batches in this urgency category. All inventory stock is safe.
                  </td>
                </tr>
              ) : (
                currentList.map((batch) => {
                  const tag = getExpiryTag(batch.expiryDate);
                  const atRisk = (batch.availableQuantity || 0) * (batch.purchasePrice || 0);

                  return (
                    <tr key={batch._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{batch.product?.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{batch.product?.sku} • {batch.product?.brand}</p>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {batch.batchNumber}
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {formatDate(batch.expiryDate)}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${tag.color}`}>
                          {tag.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-slate-900">
                        {batch.availableQuantity}
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        {formatCurrency(batch.purchasePrice)}
                      </td>

                      <td className="py-3 px-3 font-bold text-rose-600">
                        {formatCurrency(atRisk)}
                      </td>

                      <td className="py-3 px-3 text-slate-500 truncate max-w-xs">
                        {batch.supplier?.name || '-'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {batch.availableQuantity > 0 ? (
                          <button
                            onClick={() => handleQuarantine(batch._id, batch.batchNumber)}
                            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg transition-colors"
                          >
                            Quarantine & Discard
                          </button>
                        ) : (
                          <span className="text-slate-400">Already Removed</span>
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
