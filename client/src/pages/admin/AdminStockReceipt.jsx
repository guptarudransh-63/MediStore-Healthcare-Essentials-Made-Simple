import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Building,
  Boxes
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

export default function AdminStockReceipt() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [supplierId, setSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState([
    {
      productId: '',
      batchNumber: '',
      mfgDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quantity: 50,
      purchasePrice: 0,
      storageLocation: 'Shelf A-01'
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successReceipt, setSuccessReceipt] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supRes, prodRes] = await Promise.all([
          api.get('/suppliers'),
          api.get('/products?limit=100')
        ]);
        setSuppliers(supRes.data.suppliers || []);
        setProducts(prodRes.data.products || []);

        if (supRes.data.suppliers?.length) setSupplierId(supRes.data.suppliers[0]._id);
        if (prodRes.data.products?.length) {
          setItems(prev => [
            {
              ...prev[0],
              productId: prodRes.data.products[0]._id,
              purchasePrice: prodRes.data.products[0].purchasePrice
            }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProductChange = (index, prodId) => {
    const prod = products.find(p => p._id === prodId);
    const updated = [...items];
    updated[index].productId = prodId;
    if (prod) {
      updated[index].purchasePrice = prod.purchasePrice;
    }
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        productId: products[0]?._id || '',
        batchNumber: '',
        mfgDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        quantity: 50,
        purchasePrice: products[0]?.purchasePrice || 0,
        storageLocation: 'Shelf A-01'
      }
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const totalReceiptCost = items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!supplierId || !invoiceNumber) {
      setError('Please select supplier and enter invoice reference number.');
      return;
    }

    // Validate future expiry dates
    const today = new Date();
    for (const item of items) {
      if (!item.batchNumber.trim()) {
        setError('Batch number is required for all line items.');
        return;
      }
      if (new Date(item.expiryDate) <= today) {
        setError(`Batch ${item.batchNumber} has an expiry date in the past or today. Must be in the future.`);
        return;
      }
      if (item.quantity <= 0) {
        setError('Received quantity must be greater than zero.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/inventory/stock-receipt', {
        supplierId,
        invoiceNumber,
        invoiceDate,
        notes,
        items
      });

      setSuccessReceipt(res.data.receipt);
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing stock receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Stock Purchase & Receiving</h1>
        <p className="text-xs text-slate-500 mt-1">Receive new batch shipments from verified pharmaceutical distributors with atomic stock updates</p>
      </div>

      {successReceipt ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Stock Ingested Successfully</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Receipt Ref: {successReceipt.receiptNumber}</h2>
            <p className="text-xs text-slate-500">Invoice: {successReceipt.invoiceNumber} • Total: {formatCurrency(successReceipt.totalAmount)}</p>
          </div>

          <div className="max-w-md mx-auto p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1 text-left">
            <p className="font-bold text-slate-900">Updated Batch Inventory:</p>
            {successReceipt.items?.map((it, idx) => (
              <p key={idx} className="font-mono text-[11px]">
                • Batch {it.batchNumber}: +{it.quantity} units (Shelf: {it.storageLocation})
              </p>
            ))}
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => {
                setSuccessReceipt(null);
                setInvoiceNumber('');
              }}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Receive Another Shipment
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Supplier and Invoice Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-slate-100 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Select Supplier / Distributor *</label>
              <select
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.contactPerson})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Supplier Invoice Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. INV-SUN-2026-991"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-brand-600" />
                <span>Shipment Batch Items</span>
              </h3>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Formulation</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs">
                  
                  {/* Product */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Product *</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      {products.map(p => (
                        <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>

                  {/* Batch Number */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Batch No *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. B2601"
                      value={item.batchNumber}
                      onChange={(e) => handleItemChange(idx, 'batchNumber', e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono uppercase text-xs"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={item.expiryDate}
                      onChange={(e) => handleItemChange(idx, 'expiryDate', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Qty *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value, 10))}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center"
                    />
                  </div>

                  {/* Purchase Price */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Unit Cost (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={item.purchasePrice}
                      onChange={(e) => handleItemChange(idx, 'purchasePrice', parseFloat(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>

                  {/* Storage Location */}
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Rack</label>
                    <input
                      type="text"
                      value={item.storageLocation}
                      onChange={(e) => handleItemChange(idx, 'storageLocation', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      disabled={items.length <= 1}
                      onClick={() => removeItemRow(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Notes and Total */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2">
              <input
                type="text"
                placeholder="Optional delivery notes or vehicle number..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500">Total Purchase Value: </span>
              <span className="text-xl font-black text-brand-700 ml-2">{formatCurrency(totalReceiptCost)}</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              {isSubmitting ? 'Recording Batch Inflow...' : 'Confirm Stock Receipt & Update FEFO'}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
