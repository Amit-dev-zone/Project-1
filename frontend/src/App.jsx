import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import VendorLayout from './components/VendorLayout';
import VendorLogin from './pages/VendorLogin';
import VendorRegister from './pages/VendorRegister';
import DashboardHome from './pages/DashboardHome';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
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
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/edit/:id" element={<ProductForm />} />
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
