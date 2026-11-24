import React, { useState, useEffect } from 'react';
import { Truck, Plus, Phone, Mail, MapPin, Building, Check, X, Search } from 'lucide-react';
import api from '../../services/api';

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    gstin: '',
    dlNumber: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/suppliers${searchTerm ? `?search=${searchTerm}` : ''}`);
      setSuppliers(res.data.suppliers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/suppliers', {
        name: formData.name,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        gstin: formData.gstin,
        dlNumber: formData.dlNumber,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode
        }
      });
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add supplier');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Suppliers & Distributors</h1>
          <p className="text-xs text-slate-500 mt-1">Verified pharmaceutical manufacturers and wholesale logistics partners</p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              contactPerson: '',
              email: '',
              phone: '',
              street: '',
              city: '',
              state: '',
              postalCode: '',
              gstin: '',
              dlNumber: ''
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search suppliers by name, contact, GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs text-slate-400">{suppliers.length} active vendors</span>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((sup) => (
          <div key={sup._id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                Active Partner
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm">{sup.name}</h3>
              <p className="text-xs text-slate-500 font-medium">Contact: {sup.contactPerson || 'Authorized Rep'}</p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{sup.phone}</span>
              </div>
              {sup.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{sup.email}</span>
                </div>
              )}
              {sup.address?.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{sup.address.city}, {sup.address.state}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5 font-mono">
              <p>GSTIN: <span className="text-slate-700 font-semibold">{sup.gstin || 'Pending'}</span></p>
              <p>Drug License: <span className="text-slate-700 font-semibold">{sup.dlNumber || 'Verified'}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Pharmaceutical Supplier</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cipla Healthcare Logistics"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Rohan Deshpande"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 22 6789 0123"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="supply@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="27AABCC5678G1Z2"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Drug License (DL No)</label>
                  <input
                    type="text"
                    placeholder="DL-MH-2022-7711"
                    value={formData.dlNumber}
                    onChange={(e) => setFormData({ ...formData, dlNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm"
                >
                  {isSaving ? 'Saving...' : 'Add Supplier'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
