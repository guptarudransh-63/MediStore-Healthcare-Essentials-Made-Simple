import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  Search, 
  ShieldCheck, 
  FileText, 
  LogOut, 
  LayoutDashboard, 
  Menu, 
  X,
  Pill,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export default function Navbar({ onOpenPrescriptionModal }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart } = useCartStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const totalCartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const isStaff = user && ['admin', 'pharmacist'].includes(user.role);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top emergency / compliance banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Licensed Pharmacy Partner • DL: HR-GGM-2024-DL009876 • GSTIN: 06AAAAA0000A1Z5</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span>Free Express Delivery on orders above ₹500</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Pharma Support: +91 98765 43210</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Pill className="w-6 h-6 rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black tracking-tight text-slate-900">Medi<span className="text-brand-600">Store</span></span>
                <span className="bg-brand-50 text-brand-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-brand-200">SaaS</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none">Pharmacy & Healthcare</p>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search medicines, active ingredients, brands or devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-24 py-2.5 bg-slate-100 hover:bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-full transition-colors shadow-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Navigation */}
          <div className="flex items-center gap-3">
            {/* Prescription Upload Button */}
            <button
              onClick={onOpenPrescriptionModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-lg border border-teal-200 transition-colors"
            >
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Upload Prescription</span>
            </button>

            {/* Admin Switch if staff */}
            {isStaff && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-brand-400" />
                <span>{user.role === 'admin' ? 'Admin Portal' : 'Pharmacist Panel'}</span>
              </Link>
            )}

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* User Account Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>

                    {isStaff && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                      >
                        <LayoutDashboard className="w-4 h-4 text-brand-600" />
                        <span>Pharmacy Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      to="/my-orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                    >
                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                      <span>My Orders & Invoices</span>
                    </Link>

                    <Link
                      to="/my-prescriptions"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>Prescription Records</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-brand-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Secondary Category Navigation bar */}
        <nav className="hidden md:flex items-center justify-between border-t border-slate-100 py-2.5 text-xs font-medium text-slate-600 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-6">
            <Link to="/products" className="hover:text-brand-600 flex items-center gap-1 font-semibold text-slate-900">
              <span>All Products</span>
            </Link>
            <Link to="/products?category=prescription-medicines" className="hover:text-brand-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>Prescription Medicines</span>
            </Link>
            <Link to="/products?category=over-the-counter-medicines" className="hover:text-brand-600">
              OTC Medicines
            </Link>
            <Link to="/products?category=medical-devices" className="hover:text-brand-600">
              Medical Devices
            </Link>
            <Link to="/products?category=health-supplements" className="hover:text-brand-600">
              Health Supplements
            </Link>
            <Link to="/products?category=first-aid" className="hover:text-brand-600">
              First Aid
            </Link>
            <Link to="/products?category=personal-care" className="hover:text-brand-600">
              Personal Care
            </Link>
            <Link to="/products?category=baby-care" className="hover:text-brand-600">
              Baby Care
            </Link>
          </div>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Genuine Certified Drugs</span>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 text-sm rounded-lg border border-slate-200"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 bg-slate-50 rounded-lg font-medium">Browse All</Link>
            <Link to="/products?category=prescription-medicines" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 bg-slate-50 rounded-lg font-medium">Prescription (Rx)</Link>
            <Link to="/products?category=over-the-counter-medicines" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 bg-slate-50 rounded-lg font-medium">OTC Drugs</Link>
            <Link to="/products?category=medical-devices" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 bg-slate-50 rounded-lg font-medium">Devices</Link>
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenPrescriptionModal();
            }}
            className="w-full py-2.5 bg-teal-50 text-teal-800 text-xs font-bold rounded-lg border border-teal-200 flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Upload Doctor Prescription</span>
          </button>
        </div>
      )}
    </header>
  );
}
