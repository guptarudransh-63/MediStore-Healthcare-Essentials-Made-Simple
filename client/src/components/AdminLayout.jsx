import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  Layers,
  CalendarClock,
  FileCheck2,
  ShoppingCart,
  Users,
  Truck,
  BarChart3,
  LogOut,
  ExternalLink,
  ShieldAlert,
  Boxes,
  PlusCircle,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingRxCount, setPendingRxCount] = useState(0);
  const [expiryAlertCount, setExpiryAlertCount] = useState(0);

  // Fetch quick badges for sidebar
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [rxRes, expRes] = await Promise.all([
          api.get('/prescriptions?status=pending_review&limit=1'),
          api.get('/inventory/expiry-alerts')
        ]);
        setPendingRxCount(rxRes.data.total || 0);
        setExpiryAlertCount((expRes.data.summary?.within7DaysCount || 0) + (expRes.data.summary?.expiredCount || 0));
      } catch (err) {
        console.error('Badge error', err);
      }
    };
    fetchBadges();
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Products Catalogue', path: '/admin/products', icon: Pill },
    { label: 'Batch Inventory', path: '/admin/inventory', icon: Boxes },
    { label: 'Batches & FEFO', path: '/admin/batches', icon: Layers },
    { label: 'Receive Stock', path: '/admin/stock-receipt', icon: PlusCircle },
    { 
      label: 'Expiry Alerts', 
      path: '/admin/expiry', 
      icon: CalendarClock, 
      badge: expiryAlertCount > 0 ? expiryAlertCount : null,
      badgeColor: 'bg-red-500 text-white'
    },
    { 
      label: 'Prescription Queue', 
      path: '/admin/prescriptions', 
      icon: FileCheck2, 
      badge: pendingRxCount > 0 ? pendingRxCount : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    { label: 'Orders & Fulfillment', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Suppliers', path: '/admin/suppliers', icon: Truck },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Sales & Analytics', path: '/admin/analytics', icon: BarChart3 }
  ];

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold">
            MS
          </div>
          <span className="font-bold text-sm">MediStore Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-slate-300 z-40 flex flex-col justify-between
        transition-transform duration-200 ease-in-out border-r border-slate-800 shadow-xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Pill className="w-5 h-5 rotate-45" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white tracking-tight">Medi<span className="text-brand-400">Store</span></h2>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pharmacy ERP & SaaS</p>
              </div>
            </Link>
          </div>

          {/* User profile card */}
          <div className="mx-4 my-3 p-3 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                user?.role === 'admin' ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50' : 'bg-teal-900/60 text-teal-300 border border-teal-700/50'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)]">
            {navItems.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.path 
                : location.pathname.startsWith(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/40">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
            <span>Open Customer Storefront</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="hidden md:flex bg-white border-b border-slate-200 px-8 py-3.5 justify-between items-center sticky top-0 z-30 shadow-xs">
          <div>
            <h1 className="text-base font-bold text-slate-900">MediStore Operations Portal</h1>
            <p className="text-xs text-slate-500">Plot 42 Health City • Drug License: HR-GGM-2024-DL009876</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 border border-brand-200"
            >
              <span>Customer Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">{user?.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user?.role} Access</p>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
