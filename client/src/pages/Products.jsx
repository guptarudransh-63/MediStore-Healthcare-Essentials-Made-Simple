import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Check, 
  X, 
  Pill, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter state
  const search = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const classification = searchParams.get('classification') || '';
  const inStockOnly = searchParams.get('inStockOnly') === 'true';
  const sort = searchParams.get('sort') || '-createdAt';
  const dosageForm = searchParams.get('dosageForm') || '';

  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/products/categories');
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products on filter changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (categoryParam) params.set('category', categoryParam);
        if (classification) params.set('classification', classification);
        if (inStockOnly) params.set('inStockOnly', 'true');
        if (dosageForm) params.set('dosageForm', dosageForm);
        if (sort) params.set('sort', sort);
        params.set('limit', '40');

        const res = await api.get(`/products?${params.toString()}`);
        setProducts(res.data.products || []);
        setTotalCount(res.data.total || 0);
      } catch (err) {
        console.error('Products error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, categoryParam, classification, inStockOnly, dosageForm, sort]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === null || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setLocalSearch('');
    setSearchParams(new URLSearchParams());
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', localSearch.trim());
  };

  const dosageFormsList = ['Tablet', 'Capsule', 'Syrup', 'Device', 'Drops', 'Kit', 'Other'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Healthcare Product Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse authentic medicines, health supplements, and medical devices.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search catalogue..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-20 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-brand-600 text-white rounded-lg text-[11px] font-bold"
          >
            Find
          </button>
        </form>
      </div>

      {/* Filter Bar & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Category Scrollable Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar text-xs">
          <button
            onClick={() => updateFilter('category', '')}
            className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
              !categoryParam
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => updateFilter('category', c.slug)}
              className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
                categoryParam === c.slug
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Secondary Filters Grid */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Prescription classification filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => updateFilter('classification', '')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  !classification ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => updateFilter('classification', 'non_prescription')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  classification === 'non_prescription' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                OTC Only
              </button>
              <button
                onClick={() => updateFilter('classification', 'rx_required')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  classification === 'rx_required' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Prescription (Rx)
              </button>
            </div>

            {/* In stock toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => updateFilter('inStockOnly', e.target.checked ? 'true' : '')}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="font-semibold text-slate-700">In Stock Only</span>
            </label>

            {/* Dosage form dropdown */}
            <select
              value={dosageForm}
              onChange={(e) => updateFilter('dosageForm', e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Formats</option>
              {dosageFormsList.map((df) => (
                <option key={df} value={df}>{df}</option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="-createdAt">Newest First</option>
              <option value="sellingPrice">Price: Low to High</option>
              <option value="-sellingPrice">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>

            {(search || categoryParam || classification || inStockOnly || dosageForm) && (
              <button
                onClick={resetFilters}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Results Count & Badges */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Showing <strong className="text-slate-800">{products.length}</strong> of {totalCount} verified products</span>
        {search && <span>Search matches for "<strong className="text-slate-900">{search}</strong>"</span>}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Pill className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No matching medicines found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search terms, removing filters, or browsing other categories.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  );
}
