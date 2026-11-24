import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  FileText, 
  Check, 
  X, 
  AlertCircle,
  Eye,
  SlidersHorizontal,
  Building
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(getInitialForm());
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  function getInitialForm() {
    return {
      name: '',
      sku: '',
      barcode: '',
      genericName: '',
      brand: '',
      manufacturer: '',
      category: '',
      description: '',
      activeIngredient: '',
      strength: '',
      dosageForm: 'Tablet',
      packSize: '10 Tablets/Strip',
      sellingPrice: '',
      mrp: '',
      purchasePrice: '',
      taxRate: 12,
      hsnCode: '3004',
      prescriptionClassification: 'non_prescription',
      storageRequirements: 'Store in a cool dry place below 25°C',
      reorderThreshold: 15
    };
  }

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (categoryFilter) params.set('category', categoryFilter);
      if (classificationFilter) params.set('classification', classificationFilter);
      params.set('limit', '100');

      const [prodRes, catRes] = await Promise.all([
        api.get(`/products?${params.toString()}`),
        api.get('/products/categories')
      ]);

      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
      if (!formData.category && catRes.data.categories?.length) {
        setFormData(prev => ({ ...prev, category: catRes.data.categories[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, categoryFilter, classificationFilter]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      ...getInitialForm(),
      category: categories[0]?._id || ''
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      barcode: prod.barcode || '',
      genericName: prod.genericName || '',
      brand: prod.brand,
      manufacturer: prod.manufacturer,
      category: prod.category?._id || prod.category,
      description: prod.description || '',
      activeIngredient: prod.activeIngredient || '',
      strength: prod.strength || '',
      dosageForm: prod.dosageForm || 'Tablet',
      packSize: prod.packSize || '10 Tablets/Strip',
      sellingPrice: prod.sellingPrice,
      mrp: prod.mrp || prod.sellingPrice,
      purchasePrice: prod.purchasePrice,
      taxRate: prod.taxRate || 12,
      hsnCode: prod.hsnCode || '3004',
      prescriptionClassification: prod.prescriptionClassification || 'non_prescription',
      storageRequirements: prod.storageRequirements || '',
      reorderThreshold: prod.reorderThreshold || 15
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setModalError(null);

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm('Are you sure you want to archive this product? It will be removed from customer view.')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert(err.response?.data?.message || 'Error archiving product');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Medicine Catalogue</h1>
          <p className="text-xs text-slate-500 mt-1">Manage pharmaceutical formulations, SKUs, classifications and pricing</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Medicine</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, SKU, active ingredient, brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
          >
            <option value="">All Classifications</option>
            <option value="rx_required">Prescription (Rx)</option>
            <option value="non_prescription">OTC Non-Prescription</option>
          </select>
        </div>

        <span className="text-slate-400 font-medium">{products.length} products loaded</span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3 px-4">Medicine / Description</th>
                <th className="py-3 px-3">SKU & HSN</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Manufacturer</th>
                <th className="py-3 px-3 text-center">Classification</th>
                <th className="py-3 px-3 text-right">Selling Price</th>
                <th className="py-3 px-3 text-center">Batch Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">No products match your filter.</td>
                </tr>
              ) : (
                products.map((prod) => {
                  const isRx = prod.prescriptionClassification === 'rx_required';
                  const isLow = prod.totalAvailableStock <= prod.reorderThreshold;

                  return (
                    <tr key={prod._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images && prod.images[0] ? prod.images[0] : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'}
                            alt={prod.name}
                            className="w-10 h-10 object-contain rounded-lg bg-slate-50 border border-slate-200 p-1 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{prod.name}</p>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">{prod.activeIngredient || prod.packSize}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        <p>{prod.sku}</p>
                        <p className="text-[10px] text-slate-400">HSN: {prod.hsnCode}</p>
                      </td>

                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {prod.category?.name || '-'}
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {prod.manufacturer}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {isRx ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Rx Required
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            OTC
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <p className="font-bold text-slate-900">{formatCurrency(prod.sellingPrice)}</p>
                        <p className="text-[10px] text-slate-400">Cost: {formatCurrency(prod.purchasePrice)}</p>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                          prod.totalAvailableStock === 0
                            ? 'bg-red-100 text-red-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-teal-50 text-teal-800'
                        }`}>
                          {prod.totalAvailableStock}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleArchive(prod._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Archive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingProduct ? 'Edit Medicine Details' : 'Add New Medicine to Catalogue'}
                </h3>
                <p className="text-xs text-slate-400">Ensure compliant formulation specs and regulatory classification</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Product Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Augmentin 625 Duo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AUG-625-TAB"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Augmentin"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Manufacturer *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GlaxoSmithKline"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Active Ingredient (API Composition)</label>
                <input
                  type="text"
                  placeholder="e.g. Amoxicillin 500mg + Potassium Clavulanate 125mg"
                  value={formData.activeIngredient}
                  onChange={(e) => setFormData({ ...formData, activeIngredient: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Dosage Format</label>
                  <select
                    value={formData.dosageForm}
                    onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Drops">Drops</option>
                    <option value="Device">Device</option>
                    <option value="Kit">Kit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Strength</label>
                  <input
                    type="text"
                    placeholder="e.g. 625mg"
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pack Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 10 Tablets/Strip"
                    value={formData.packSize}
                    onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Purchase Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">GST Tax Rate (%)</label>
                  <select
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="5">5% (Essential Drugs)</option>
                    <option value="12">12% (Standard Pharma)</option>
                    <option value="18">18% (Personal Care/Cosmeceuticals)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Prescription Classification</label>
                  <select
                    value={formData.prescriptionClassification}
                    onChange={(e) => setFormData({ ...formData, prescriptionClassification: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="non_prescription">OTC (Non-Prescription)</option>
                    <option value="rx_required">Schedule H (Prescription Required)</option>
                    <option value="restricted">Restricted (In-Store Dispensing Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reorder Low Stock Threshold</label>
                  <input
                    type="number"
                    value={formData.reorderThreshold}
                    onChange={(e) => setFormData({ ...formData, reorderThreshold: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Storage Instructions</label>
                <input
                  type="text"
                  value={formData.storageRequirements}
                  onChange={(e) => setFormData({ ...formData, storageRequirements: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
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
                  {isSaving ? 'Saving...' : 'Save Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
