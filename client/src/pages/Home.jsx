import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShieldCheck, 
  Pill, 
  FileText, 
  Truck, 
  Clock, 
  ArrowRight, 
  Activity, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home({ onOpenPrescriptionModal }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [deviceProducts, setDeviceProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/products/categories'),
          api.get('/products?limit=12')
        ]);
        setCategories(catRes.data.categories || []);
        const prods = prodRes.data.products || [];
        setFeaturedProducts(prods.slice(0, 8));
        setDeviceProducts(prods.filter(p => p.dosageForm === 'Device').slice(0, 4));
      } catch (err) {
        console.error('Home load error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-slate-50 pt-10 pb-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/70 border border-brand-200 text-brand-800 text-xs font-bold tracking-wide">
                <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse"></span>
                <span>Certified Pharmacy Management & Fulfillment</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Your Healthcare Essentials, <span className="text-brand-600">Made Simple.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Order authentic prescription medicines, daily OTC healthcare, and diagnostic devices from your licensed local pharmacy. Monitored with batch-level FEFO precision to guarantee purity and freshness.
              </p>

              {/* Direct Search Bar */}
              <form onSubmit={handleSearch} className="max-w-xl relative flex items-center shadow-lg shadow-brand-500/5 rounded-2xl border border-slate-200 bg-white p-1.5 focus-within:ring-2 focus-within:ring-brand-500/30">
                <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search brand (Dolo, Augmentin), active ingredient, or device..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors flex-shrink-0 shadow-sm"
                >
                  Search
                </button>
              </form>

              {/* Quick action buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onOpenPrescriptionModal}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20 active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  <span>Upload Doctor's Prescription</span>
                </button>

                <Link
                  to="/products"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-300 transition-all shadow-xs"
                >
                  <span>Browse Product Catalog</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Genuine Certified</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4 text-brand-600" />
                  <span>Batch FEFO Monitored</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Truck className="w-4 h-4 text-teal-600" />
                  <span>Same-Day Dispatch</span>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/80">
                
                {/* Floating pill badge */}
                <div className="absolute -top-4 -right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pharmacist Verified</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">MediStore Safety Protocol</p>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">Order Journey & FEFO Batching</h3>
                    </div>
                    <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                      Rx
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-3 border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                      <div>
                        <p className="font-bold text-slate-900">Select Medications</p>
                        <p className="text-[11px] text-slate-500">Browse transparent prices with composition details and pack size.</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-3 border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                      <div>
                        <p className="font-bold text-slate-900">Upload Doctor's Prescription</p>
                        <p className="text-[11px] text-slate-500">Mandatory for Schedule H/H1 antibiotics, cardiac & diabetic drugs.</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-3 border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
                      <div>
                        <p className="font-bold text-slate-900">FEFO Allocation & Dispatch</p>
                        <p className="text-[11px] text-slate-500">First-Expiry, First-Out allocation guarantees zero expired stock.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-center">
                    <p className="text-[11px] font-bold text-brand-900">Need immediate help with a prescription?</p>
                    <p className="text-[11px] text-brand-700">Call our on-duty pharmacist: <span className="font-bold">+91 98765 43210</span></p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Browse by Category</h2>
            <p className="text-xs text-slate-500 mt-1">Explore our government certified pharmaceutical & wellness categories</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className="group p-4 bg-white rounded-2xl border border-slate-200 hover:border-brand-400 hover:shadow-lg hover:shadow-brand-500/10 transition-all text-center flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-brand-50 text-slate-600 group-hover:text-brand-600 flex items-center justify-center transition-colors mb-3">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug line-clamp-2">
                {cat.name}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                {cat.productCount || 0} items
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Healthcare Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Essential Health Products</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">Top verified medications and everyday wellness supplies</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Explore All Medicines</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-72 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Diagnostic & Medical Devices Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl text-white p-8 sm:p-12 shadow-xl overflow-hidden relative">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-500 text-slate-900">
              Home Diagnostics & Vitals
            </span>
            <h2 className="text-3xl font-black tracking-tight leading-tight">
              Clinical Grade Monitoring Devices For Your Family.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Monitor blood pressure, blood glucose, temperature, and SpO2 with clinically validated digital health monitors from Omron, Accu-Chek, and Beurer.
            </p>
            <div className="pt-2">
              <Link
                to="/products?category=medical-devices"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                <span>View All Medical Devices</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Informational Safety & Compliance Guidelines */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Prescription Dispensing & Safety Rules</h3>
              <p className="text-xs text-slate-500">Compliant with the Drugs & Cosmetics Act and Pharmacy Council regulations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
            <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="font-bold text-slate-900">1. Valid Medical Prescription</h4>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Prescription medications cannot be dispensed without a clear prescription uploaded and stamped by a Registered Medical Practitioner (RMP).
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="font-bold text-slate-900">2. FEFO Quality Control</h4>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Our First-Expiry, First-Out warehouse management system verifies batch-level dates before picking. Medicines near expiry are immediately quarantined.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="font-bold text-slate-900">3. Tamper-Proof Invoicing</h4>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Every delivery includes a printed GST tax invoice containing batch numbers, expiry dates, pharmacist signature, and HSN codes.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
