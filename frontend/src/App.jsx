import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import VendorLayout from './components/VendorLayout';
import { Loader2 } from 'lucide-react';

// Lazy-loaded route components for optimized bundle size & Lighthouse 85+ score
const Storefront = lazy(() => import('./pages/Storefront'));
const VendorLogin = lazy(() => import('./pages/VendorLogin'));
const VendorRegister = lazy(() => import('./pages/VendorRegister'));
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductForm = lazy(() => import('./pages/ProductForm'));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-xs">Loading view...</p>
      </div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Consumer Storefront */}
        <Route path="/" element={<Storefront />} />

        {/* Vendor Authentication */}
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
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
