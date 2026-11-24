import React, { useState, useEffect } from 'react';
import { Users, Search, ShoppingBag, FileText, Phone, Mail, MapPin, X, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate, getOrderStatusBadge } from '../../utils/formatters';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers${searchTerm ? `?search=${searchTerm}` : ''}`);
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const handleOpenProfile = async (customerId) => {
    try {
      const res = await api.get(`/customers/${customerId}`);
      setSelectedCustomerProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Management</h1>
        <p className="text-xs text-slate-500 mt-1">Patient accounts, prescription association, and lifetime order histories</p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs text-slate-400">{customers.length} registered patients</span>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-3">Email & Phone</th>
                <th className="py-3 px-3">Registered On</th>
                <th className="py-3 px-3 text-center">Total Orders</th>
                <th className="py-3 px-3">Lifetime Spend</th>
                <th className="py-3 px-3">Most Recent Order</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">No customers found.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 text-xs">
                      {c.name}
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      <p>{c.email}</p>
                      <p className="text-[10px] text-slate-400">{c.phone || '-'}</p>
                    </td>

                    <td className="py-3 px-3 text-slate-500">
                      {formatDate(c.createdAt)}
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-900">
                      {c.totalOrders || 0}
                    </td>

                    <td className="py-3 px-3 font-bold text-brand-700">
                      {formatCurrency(c.totalSpent)}
                    </td>

                    <td className="py-3 px-3 text-slate-500">
                      {c.lastOrderDate ? formatDate(c.lastOrderDate) : <span className="text-slate-400 italic">None</span>}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {c.accountStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenProfile(c._id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 text-brand-700 font-bold rounded-lg transition-colors"
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detailed Profile Drawer / Modal */}
      {selectedCustomerProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedCustomerProfile.customer?.name}</h3>
                <p className="text-xs text-slate-400">Patient Account & Dispensing Audit</p>
              </div>
              <button onClick={() => setSelectedCustomerProfile(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Total Orders</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">{selectedCustomerProfile.stats?.totalOrders}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Total Spend</span>
                <p className="text-lg font-black text-brand-700 mt-0.5">{formatCurrency(selectedCustomerProfile.stats?.totalSpent)}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Prescriptions</span>
                <p className="text-lg font-black text-teal-700 mt-0.5">{selectedCustomerProfile.stats?.prescriptionsCount}</p>
              </div>
            </div>

            {/* Orders list */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-brand-600" />
                <span>Patient Orders ({selectedCustomerProfile.orders?.length || 0})</span>
              </h4>

              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl">
                {selectedCustomerProfile.orders?.map(o => (
                  <div key={o._id} className="p-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
                      <p className="text-[10px] text-slate-400">{formatDate(o.createdAt)} • {o.items?.length} items</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{formatCurrency(o.grandTotal)}</span>
                      <p className="text-[10px] uppercase font-bold text-brand-600">{o.orderStatus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prescriptions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Uploaded Prescriptions ({selectedCustomerProfile.prescriptions?.length || 0})</span>
              </h4>

              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl text-xs">
                {selectedCustomerProfile.prescriptions?.map(p => (
                  <div key={p._id} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{p.originalFileName}</p>
                      <p className="text-[10px] text-slate-400">Doctor: {p.doctorName || 'Self uploaded'}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
