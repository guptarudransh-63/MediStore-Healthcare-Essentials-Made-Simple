import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  AlertCircle,
  Truck
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/formatters';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, fetchCart, updateQuantity, removeItem, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchCart();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign in to view your cart</h2>
        <p className="text-xs text-slate-500">
          Sign in to access your saved healthcare items and prescription history.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const items = cart?.items || [];
  const hasItems = items.length > 0;
  const hasRx = cart?.hasPrescriptionRequiredItems;
  const hasOutOfStock = cart?.hasOutOfStockItems;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Your Shopping Cart
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your items and proceed with verified pharmacy dispensing.
        </p>
      </div>

      {!hasItems ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Your cart is currently empty</h3>
            <p className="text-xs text-slate-500 mt-1">
              Search for prescription medicines, vitamins, or home diagnostic tools.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Prescription Banner if Rx items exist */}
            {hasRx && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Prescription Required For Items In Cart</p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    One or more items in your cart are Schedule H prescription medicines. You will be prompted to select or upload a doctor's prescription during checkout.
                  </p>
                </div>
              </div>
            )}

            {/* Out of stock warning banner */}
            {hasOutOfStock && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">Some items exceed available stock</p>
                  <p className="text-[11px] text-red-700">Please reduce quantities for out-of-stock items before checkout.</p>
                </div>
              </div>
            )}

            {/* Cart Table Cards */}
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
              {items.map((item) => {
                const prod = item.product;
                if (!prod) return null;
                const isRxItem = prod.prescriptionClassification === 'rx_required';

                return (
                  <div key={prod._id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    
                    {/* Product Media & Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center flex-shrink-0">
                        <img
                          src={prod.images && prod.images[0] ? prod.images[0] : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'}
                          alt={prod.name}
                          className="max-h-12 object-contain"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link to={`/products/${prod._id}`} className="font-bold text-sm text-slate-900 hover:text-brand-600 transition-colors">
                            {prod.name}
                          </Link>
                          {isRxItem && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Rx
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {prod.brand} • <span className="font-medium text-slate-700">{prod.packSize}</span>
                        </p>
                        <p className="text-xs font-semibold text-slate-700">
                          {formatCurrency(prod.sellingPrice)} per unit
                        </p>
                        {item.isOutOfStock && (
                          <p className="text-[11px] font-bold text-red-600">
                            Available in stock: {prod.totalAvailableStock}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls & Line Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      
                      {/* Counter */}
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                        <button
                          onClick={() => updateQuantity(prod._id, item.quantity - 1)}
                          className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-l-xl transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(prod._id, item.quantity + 1)}
                          disabled={item.quantity >= (prod.totalAvailableStock || 0)}
                          className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-r-xl transition-colors disabled:text-slate-300"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right min-w-[80px]">
                        <p className="text-sm font-black text-slate-900">
                          {formatCurrency(item.itemTotal)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Tax: {formatCurrency(item.itemTax)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(prod._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
              <Link to="/products" className="font-semibold text-brand-600 hover:underline">
                ← Continue Shopping
              </Link>
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>FEFO Expiry Protection Guaranteed</span>
              </div>
            </div>

          </div>

          {/* Right: Order Summary Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 sticky top-28">
            
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
              Payment Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(cart?.subtotal)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>GST (CGST + SGST):</span>
                <span className="font-semibold text-slate-900">{formatCurrency(cart?.taxTotal)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Delivery Charges:</span>
                <span>
                  {cart?.deliveryCharge === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatCurrency(cart?.deliveryCharge)
                  )}
                </span>
              </div>

              {cart?.subtotal < 500 && cart?.subtotal > 0 && (
                <div className="p-2.5 rounded-xl bg-brand-50 text-[11px] text-brand-800 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span>Add {formatCurrency(500 - cart.subtotal)} more to get <strong>FREE delivery</strong></span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-black text-slate-900">Total Payable:</span>
                  <p className="text-[10px] text-slate-400">All taxes included</p>
                </div>
                <span className="text-xl font-black text-brand-700">
                  {formatCurrency(cart?.grandTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              disabled={hasOutOfStock || !hasItems}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="space-y-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Safe payment via UPI, Cards, or Cash on Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Automatic FEFO batch stock allocation</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
