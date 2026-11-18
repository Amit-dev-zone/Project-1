import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productService } from '../api/productService';
import { authService } from '../api/authService';
import {
  Store,
  LogOut,
  Package,
  Layers,
  AlertTriangle,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const VendorDashboardPreview = () => {
  const { user, logout } = useAuth();
  const [vendorProducts, setVendorProducts] = useState([]);
  const [rbacStatus, setRbacStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Verify RBAC route
      const rbacRes = await authService.getVendorDashboard();
      setRbacStatus(rbacRes);

      // 2. Fetch vendor products
      const prodRes = await productService.getVendorProducts();
      setVendorProducts(prodRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalValue = vendorProducts.reduce(
    (acc, p) => acc + (p.price || 0) * (p.stock || 0),
    0
  );
  const lowStockCount = vendorProducts.filter((p) => p.stock < 5).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">{user?.name || 'Vendor Store'}</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-slate-300">{user?.email}</div>
              <div className="text-[10px] text-slate-500 font-mono">ID: {user?.id}</div>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>JWT Protected & Multi-Vendor Isolated</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Your authenticated session is active. Products created here are isolated exclusively to your seller ID.
              </p>
            </div>

            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="self-start sm:self-auto inline-flex items-center px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Sync
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Listings</span>
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{vendorProducts.length}</div>
            <p className="text-xs text-slate-500 mt-1">Active in your catalog</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Inventory</span>
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {vendorProducts.reduce((acc, p) => acc + (p.stock || 0), 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Stocked units across items</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Inventory Value</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">Retail market valuation</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Low Stock Alerts</span>
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-400">{lowStockCount}</div>
            <p className="text-xs text-slate-500 mt-1">&lt; 5 units remaining</p>
          </div>
        </div>

        {/* Live RBAC Verification Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Live Security & RBAC Verification</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="text-slate-500 mb-1">// RBAC Route Authorization Response</div>
              <pre className="text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(rbacStatus || { message: 'Checking RBAC...' }, null, 2)}
              </pre>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="text-slate-500 mb-1">// Authenticated Vendor Session Payload</div>
              <pre className="text-indigo-300 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(
                  {
                    id: user?.id,
                    name: user?.name,
                    email: user?.email,
                    role: user?.role,
                    scope: 'vendor_isolated_catalog',
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>

        {/* Next Steps for Day 4 & Day 5 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-3">Next Milestones in Week 2</h3>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Day 1: Backend Product CRUD & Multipart Uploads</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Day 2: React Vite scaffold & Centralized Axios Client</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Day 3: Vendor Auth Context, Login/Register Views & Role Guards</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-500">
              <span className="w-4 h-4 border border-slate-600 rounded-full inline-block mr-1"></span>
              <span>Day 4: Full Vendor Dashboard Shell & Analytics Overview</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-500">
              <span className="w-4 h-4 border border-slate-600 rounded-full inline-block mr-1"></span>
              <span>Day 5: Product Catalog Table & Stock Status Badges</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboardPreview;
