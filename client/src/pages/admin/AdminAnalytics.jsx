import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  Boxes, 
  History, 
  CreditCard,
  Building
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import api from '../../services/api';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [anaRes, movRes] = await Promise.all([
        api.get(`/analytics/sales?timeRange=${timeRange}`),
        api.get('/inventory/movements?limit=30')
      ]);
      setAnalytics(anaRes.data.analytics);
      setMovements(movRes.data.movements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const COLORS = ['#0284c7', '#0d9488', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="space-y-8">
      
      {/* Header and Time Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sales & Inventory Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time database metrics, financial revenue reports, and stock movement audit logs</p>
        </div>

        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === '7d' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === '30d' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === '90d' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Last 90 Days
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === 'all' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Revenue Over Time Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Gross Medicine Sales Trend</h3>
          <p className="text-xs text-slate-400">Total completed order transactions over selected timeframe</p>
        </div>

        <div className="h-80 w-full">
          {analytics?.revenueOverTime?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenueOverTime}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Gross Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No sales data recorded in this timeframe.
            </div>
          )}
        </div>
      </div>

      {/* Grid: Top Products Bar Chart & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Top Products */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Top Dispensed Formulations</h3>
            <p className="text-xs text-slate-400">High revenue prescription & OTC medications</p>
          </div>

          <div className="h-72 w-full">
            {analytics?.topProducts?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tickFormatter={(val) => `₹${val}`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: '#334155' }} />
                  <Tooltip formatter={(val) => [formatCurrency(val), 'Revenue']} />
                  <Bar dataKey="revenue" fill="#0284c7" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No product sales data.
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Payment Breakdown</h3>
            <p className="text-xs text-slate-400">Order payment preferences</p>
          </div>

          <div className="h-56 w-full">
            {analytics?.paymentMethods?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.paymentMethods}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                  >
                    {analytics.paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No payments.
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
            {analytics?.paymentMethods?.map((pm, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span>{pm.name}</span>
                </div>
                <strong className="text-slate-900">{pm.count} orders</strong>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Inventory Movements Audit Trail (Section 7: Inventory Rules & Movements) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-brand-600" />
              <span>Inventory Movements Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-400">Every stock in, FEFO order dispatch, and quarantine adjustment recorded with actor and timestamp</p>
          </div>
          <span className="text-xs text-slate-400">Latest 30 recorded movements</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Batch Number</th>
                <th className="py-2.5 px-3">Movement Type</th>
                <th className="py-2.5 px-3 text-center">Qty Change</th>
                <th className="py-2.5 px-3">Prev → New Qty</th>
                <th className="py-2.5 px-3">Logged Actor</th>
                <th className="py-2.5 px-3">Audit Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {movements.map((m) => {
                const isPositive = m.quantityChange > 0;

                return (
                  <tr key={m._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 font-medium">
                      {formatDateTime(m.createdAt)}
                    </td>

                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      {m.product?.name || 'Deleted Product'}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {m.batch?.batchNumber || '-'}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        m.movementType === 'stock_in' ? 'bg-emerald-50 text-emerald-800' :
                        m.movementType === 'stock_out_order' ? 'bg-blue-50 text-blue-800' :
                        m.movementType === 'order_cancellation_return' ? 'bg-teal-50 text-teal-800' :
                        'bg-red-50 text-red-800'
                      }`}>
                        {m.movementType.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center font-bold">
                      <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                        {isPositive ? `+${m.quantityChange}` : m.quantityChange}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {m.previousQuantity} → <strong className="text-slate-900">{m.newQuantity}</strong>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600">
                      {m.actor?.name || 'System / Auto FEFO'}
                    </td>

                    <td className="py-2.5 px-3 text-slate-500 italic max-w-xs truncate" title={m.reason}>
                      {m.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
