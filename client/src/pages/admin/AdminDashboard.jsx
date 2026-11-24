import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Boxes, 
  CalendarClock, 
  FileCheck2, 
  AlertTriangle, 
  Users, 
  DollarSign, 
  ArrowUpRight,
  PlusCircle,
  Truck,
  Layers,
  Clock
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
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function AdminDashboard() {
  const [kpis, setKpis] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [kpiRes, anaRes] = await Promise.all([
          api.get('/analytics/kpis'),
          api.get('/analytics/sales?timeRange=30d')
        ]);
        setKpis(kpiRes.data.kpis);
        setAnalytics(anaRes.data.analytics);
      } catch (err) {
        console.error('Admin dashboard error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const COLORS = ['#0284c7', '#0d9488', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-brand-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-500 text-white">
            Pharmacy ERP Live
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
            Operations & Compliance Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time batch-level inventory tracking, FEFO order allocations, and licensed prescription dispensing workflows.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/stock-receipt"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Receive Stock</span>
          </Link>

          <Link
            to="/admin/prescriptions"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Prescription Queue ({kpis?.pendingPrescriptions || 0})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Sales</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(kpis?.totalSales)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Order: {formatCurrency(kpis?.averageOrderValue)}</span>
            <span className="text-emerald-600 font-bold">{kpis?.validOrdersCount} Completed</span>
          </div>
        </div>

        {/* Orders Pending */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fulfillment Queue</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {kpis?.pendingOrders}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{kpis?.deliveredOrders} Delivered</span>
            <Link to="/admin/orders" className="text-brand-600 font-bold hover:underline">Manage →</Link>
          </div>
        </div>

        {/* Expiry Risk Stock */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">At-Risk Value (≤30d)</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 tracking-tight">
            {formatCurrency(kpis?.nearExpiryValue)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{kpis?.nearExpiryUnits} Units Approaching Expiry</span>
            <Link to="/admin/expiry" className="text-rose-600 font-bold hover:underline">Alerts →</Link>
          </div>
        </div>

        {/* Low Stock Reorder Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Products</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {kpis?.lowStockCount}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Below reorder threshold</span>
            <Link to="/admin/inventory" className="text-orange-600 font-bold hover:underline">Restock →</Link>
          </div>
        </div>

      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Revenue Trend Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue & Sales Performance (30 Days)</h3>
              <p className="text-xs text-slate-400">Daily gross medicine sales calculated from non-cancelled orders</p>
            </div>
            <Link to="/admin/analytics" className="text-xs font-bold text-brand-600 hover:underline">
              View Detailed Analytics
            </Link>
          </div>

          <div className="h-72 w-full">
            {analytics?.revenueOverTime?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revenueOverTime}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No revenue transactions recorded in the selected range.
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Status Distribution */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900">Order Status Distribution</h3>
            <p className="text-xs text-slate-400">Workflow pipeline breakdown</p>
          </div>

          <div className="h-64 w-full">
            {analytics?.orderStatusDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.orderStatusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {analytics.orderStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No orders recorded yet.
              </div>
            )}
          </div>

          {/* Status legend list */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
            {analytics?.orderStatusDistribution?.slice(0, 6).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate">{item.status}: <strong className="text-slate-900">{item.count}</strong></span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top Selling Products Bar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Products */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Top Dispensed Products by Revenue</h3>
            <p className="text-xs text-slate-400">High turnover prescription & OTC lines</p>
          </div>

          <div className="space-y-3">
            {analytics?.topProducts?.slice(0, 5).map((prod, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 font-bold text-[10px] flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{prod.name}</p>
                    <p className="text-[11px] text-slate-400">{prod.units} units sold</p>
                  </div>
                </div>
                <span className="font-black text-slate-800 text-sm">
                  {formatCurrency(prod.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Manufacturers */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Top Pharmaceutical Manufacturers</h3>
            <p className="text-xs text-slate-400">Sourced supplier volume breakdown</p>
          </div>

          <div className="space-y-3">
            {analytics?.topManufacturers?.slice(0, 5).map((mfg, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 font-bold text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <p className="font-bold text-slate-900">{mfg.name}</p>
                </div>
                <span className="font-black text-slate-800 text-sm">
                  {formatCurrency(mfg.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
