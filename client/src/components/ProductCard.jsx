import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Check, ShoppingBag, AlertCircle, FileText } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/formatters';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const isRx = product.prescriptionClassification === 'rx_required';
  const isOutOfStock = (product.totalAvailableStock || 0) <= 0;
  const isLowStock = !isOutOfStock && product.totalAvailableStock <= (product.reorderThreshold || 15);

  const discountPercent = product.mrp && product.mrp > product.sellingPrice 
    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) 
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isOutOfStock) return;

    setIsAdding(true);
    const result = await addItem(product._id, 1);
    setIsAdding(false);

    if (result.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 1500);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-200 flex flex-col overflow-hidden relative">
      
      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10 pointer-events-none">
        <div className="flex flex-col gap-1">
          {isRx ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm backdrop-blur-sm">
              <FileText className="w-3 h-3 text-rose-600" />
              <span>Rx Required</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
              <span>OTC</span>
            </span>
          )}

          {discountPercent > 0 && (
            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-white shadow-sm w-fit">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Stock pill */}
        <div>
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Only {product.totalAvailableStock} left
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
              In Stock
            </span>
          )}
        </div>
      </div>

      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="block relative pt-12 pb-4 px-6 bg-slate-50/50 group-hover:bg-slate-50 transition-colors">
        <div className="aspect-square w-full flex items-center justify-center overflow-hidden">
          <img
            src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'}
            alt={product.name}
            className="object-contain max-h-40 group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider mb-1 truncate">
            {product.brand} • <span className="text-slate-500 font-normal">{product.dosageForm}</span>
          </p>

          <Link to={`/products/${product._id}`} className="block">
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {product.activeIngredient && (
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">
              {product.activeIngredient}
            </p>
          )}

          <p className="text-[11px] text-slate-400 mt-1">
            Pack: <span className="text-slate-600 font-medium">{product.packSize}</span>
          </p>
        </div>

        {/* Pricing and Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                {formatCurrency(product.sellingPrice)}
              </span>
              {product.mrp > product.sellingPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.mrp)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">Inclusive of {product.taxRate || 12}% GST</p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`p-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center shadow-sm ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : addedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white active:scale-95'
            }`}
            title={isOutOfStock ? 'Currently out of stock' : 'Add to cart'}
          >
            {addedSuccess ? (
              <Check className="w-4 h-4" />
            ) : isAdding ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
