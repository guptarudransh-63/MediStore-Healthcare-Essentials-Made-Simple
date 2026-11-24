import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrescriptionUploadModal from './components/PrescriptionUploadModal';
import AdminLayout from './components/AdminLayout';

// Customer Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import MyPrescriptions from './pages/MyPrescriptions';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminInventory from './pages/admin/AdminInventory';
import AdminBatches from './pages/admin/AdminBatches';
import AdminStockReceipt from './pages/admin/AdminStockReceipt';
import AdminExpiry from './pages/admin/AdminExpiry';
import AdminPrescriptions from './pages/admin/AdminPrescriptions';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminAnalytics from './pages/admin/AdminAnalytics';

import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';

// Protected Customer Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Protected Staff / Admin Route Component
function StaffRoute({ children }) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!['admin', 'pharmacist'].includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Layout wrapper to show customer Navbar & Footer only on customer storefront pages
function CustomerLayout({ children, onOpenPrescriptionModal }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Navbar onOpenPrescriptionModal={onOpenPrescriptionModal} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const { fetchProfile, isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchCart();
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        {/* Admin & Pharmacist Nested Portal Routes */}
        <Route
          path="/admin"
          element={
            <StaffRoute>
              <AdminLayout />
            </StaffRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="batches" element={<AdminBatches />} />
          <Route path="stock-receipt" element={<AdminStockReceipt />} />
          <Route path="expiry" element={<AdminExpiry />} />
          <Route path="prescriptions" element={<AdminPrescriptions />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="suppliers" element={<AdminSuppliers />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* Customer Storefront Routes */}
        <Route
          path="*"
          element={
            <CustomerLayout onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)}>
              <Routes>
                <Route path="/" element={<Home onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)} />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)} />} />
                <Route path="/cart" element={<Cart />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-success/:id"
                  element={
                    <ProtectedRoute>
                      <OrderSuccess />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-orders"
                  element={
                    <ProtectedRoute>
                      <MyOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-prescriptions"
                  element={
                    <ProtectedRoute>
                      <MyPrescriptions onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)} />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CustomerLayout>
          }
        />
      </Routes>

      {/* Global Prescription Upload Modal */}
      <PrescriptionUploadModal
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        onUploadSuccess={() => {
          // Modal feedback
        }}
      />
    </Router>
  );
}
