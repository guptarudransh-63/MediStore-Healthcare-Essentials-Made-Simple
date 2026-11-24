import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileText, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Check, 
  ArrowLeft, 
  Thermometer, 
  AlertTriangle, 
  Truck, 
  RotateCcw,
  Building2,
  Calendar
} from 'lucide-react';
import api from '../services/api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/formatters';
import ProductCard from '../components/ProductCard';

export default function ProductDetail({ onOpenPrescriptionModal }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/products/${id}`);
        const prod = res.data.product;
        setProduct(prod);

        // Fetch related products from same category
        if (prod.category?._id || prod.category) {
          const catId = prod.category?._id || prod.category;
          const relRes = await api.get(`/products?category=${catId}&limit=4`);
          setRelatedProducts((relRes.data.products || []).filter(p => p._id !== prod._id));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-slate-500">Loading product information...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">{error || 'Product not found'}</h2>
        <Link to="/products" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold">
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const isRx = product.prescriptionClassification === 'rx_required';
  const isOutOfStock = (product.totalAvailableStock || 0) <= 0;
  const isLowStock = !isOutOfStock && product.totalAvailableStock <= (product.reorderThreshold || 15);
  const discountPercent = product.mrp && product.mrp > product.sellingPrice 
    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) 
    : 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isOutOfStock) return;

    setIsAdding(true);
    const result = await addItem(product._id, quantity);
    setIsAdding(false);

    if (result.success) {
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb back link */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Catalogue</span>
        </Link>
      </div>

      {/* Main Product Showcase Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Product Media Gallery */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50/60 rounded-2xl p-8 border border-slate-100 relative">
          
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
            {isRx ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>Prescription Required</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Over The Counter (OTC)</span>
              </span>
            )}

            {discountPercent > 0 && (
              <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-amber-500 text-white shadow-xs w-fit">
                {discountPercent}% OFF MRP
              </span>
            )}
          </div>

          <div className="w-full aspect-square max-h-80 flex items-center justify-center overflow-hidden my-6">
            <img
              src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'}
              alt={product.name}
              className="max-h-72 object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="w-full pt-4 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-400">SKU: <span className="font-mono text-slate-600 font-medium">{product.sku}</span> | HSN: <span className="font-mono text-slate-600 font-medium">{product.hsnCode}</span></p>
          </div>
        </div>

        {/* Right: Product Details and Purchase Box */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                {product.brand} • {product.category?.name}
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                {product.name}
              </h1>
              {product.genericName && (
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Generic: <span className="text-slate-700">{product.genericName}</span>
                </p>
              )}
            </div>

            {/* Manufacturer Details */}
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 w-fit">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Manufacturer: <strong className="text-slate-800">{product.manufacturer}</strong></span>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">
                    {formatCurrency(product.sellingPrice)}
                  </span>
                  {product.mrp > product.sellingPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatCurrency(product.mrp)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Inclusive of all taxes ({product.taxRate || 12}% GST)
                </p>
              </div>

              {/* Stock Status Indicator */}
              <div className="text-right">
                {isOutOfStock ? (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Only {product.totalAvailableStock} left in stock
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    In Stock ({product.totalAvailableStock} units available)
                  </span>
                )}
                <p className="text-[10px] text-slate-400 mt-1">Batch-level FEFO managed</p>
              </div>
            </div>

            {/* Active Composition & Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Strength</span>
                <p className="font-bold text-slate-900 mt-0.5">{product.strength || '-'}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Dosage Format</span>
                <p className="font-bold text-slate-900 mt-0.5">{product.dosageForm}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Pack Packaging</span>
                <p className="font-bold text-slate-900 mt-0.5">{product.packSize}</p>
              </div>
            </div>

            {product.activeIngredient && (
              <div className="p-3.5 bg-brand-50/50 rounded-xl border border-brand-100 text-xs text-slate-700">
                <span className="font-bold text-brand-900">Active Pharmaceutical Ingredients (API): </span>
                <span>{product.activeIngredient}</span>
              </div>
            )}

            {/* Storage Instructions */}
            {product.storageRequirements && (
              <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <Thermometer className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Storage Instructions: </span>
                  <span>{product.storageRequirements}</span>
                </div>
              </div>
            )}

            {/* Prescription Guidelines Box if Rx */}
            {isRx && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-1 text-amber-900">
                <div className="flex items-center gap-2 font-bold">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>Doctor's Prescription Mandatory</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  As per Drugs and Cosmetics Rules, this medicine can only be dispensed after review of an uploaded prescription by our registered on-duty pharmacist. You will be prompted to attach your prescription during checkout.
                </p>
              </div>
            )}
          </div>

          {/* Quantity and Add to Cart Section */}
          <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center gap-4">
            
            {/* Quantity Selector */}
            <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden shadow-xs">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                className="p-3 hover:bg-slate-200 text-slate-700 disabled:text-slate-300 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-5 text-sm font-black text-slate-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.totalAvailableStock || 1, quantity + 1))}
                disabled={quantity >= (product.totalAvailableStock || 1) || isOutOfStock}
                className="p-3 hover:bg-slate-200 text-slate-700 disabled:text-slate-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className={`flex-1 min-w-[200px] py-3.5 px-6 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : addSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/25 active:scale-95'
              }`}
            >
              {addSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added {quantity} to Cart!</span>
                </>
              ) : isAdding ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Updating Cart...</span>
                </>
              ) : isOutOfStock ? (
                <span>Currently Out of Stock</span>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add {quantity} to Cart • {formatCurrency(product.sellingPrice * quantity)}</span>
                </>
              )}
            </button>

            {/* Direct upload shortcut if Rx */}
            {isRx && (
              <button
                onClick={onOpenPrescriptionModal}
                className="p-3.5 rounded-xl border border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-bold transition-colors"
                title="Upload Prescription Now"
              >
                <FileText className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>

      </div>

      {/* Description Section */}
      {product.description && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            About {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
            {product.description}
          </p>
        </div>
      )}

      {/* Related Products Carousel/Grid */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Related Items in {product.category?.name}
            </h3>
            <Link to={`/products?category=${product.category?.slug}`} className="text-xs font-bold text-brand-600 hover:text-brand-700">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
