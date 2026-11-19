import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import VendorLayout from './components/VendorLayout';
import VendorLogin from './pages/VendorLogin';
import VendorRegister from './pages/VendorRegister';
import DashboardHome from './pages/DashboardHome';

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

// Temporary placeholders for Day 5 & Day 6 modules
function ProductsListPlaceholder() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
      <h2 className="text-xl font-bold text-white mb-2">Product Catalog Table</h2>
      <p className="text-xs">Scheduled for Day 5 (Nov 20): Full inventory table with status filters and delete modals.</p>
    </div>
  );
}

function ProductFormPlaceholder() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
      <h2 className="text-xl font-bold text-white mb-2">Create & Edit Product Form</h2>
      <p className="text-xs">Scheduled for Day 6 (Nov 21): Multipart image upload, live preview, and pricing inputs.</p>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<VendorLogin />} />
      <Route path="/register" element={<VendorRegister />} />

      {/* Protected Vendor Dashboard Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['vendor', 'admin']}>
            <VendorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="products" element={<ProductsListPlaceholder />} />
        <Route path="products/new" element={<ProductFormPlaceholder />} />
        <Route path="products/edit/:id" element={<ProductFormPlaceholder />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
