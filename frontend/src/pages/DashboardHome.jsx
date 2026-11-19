import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService } from '../api/productService';
import {
  Package,
  Layers,
  DollarSign,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  RefreshCw,
  Tag,
  ShieldCheck,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

export const DashboardHome = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productService.getVendorProducts();
      setProducts(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vendor products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalListings = products.length;
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalValuation = products.reduce((acc, p) => acc + (p.price || 0) * (p.stock || 0), 0);
  const lowStockProducts = products.filter((p) => p.stock < 5);
  const recentProducts = [...products].slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Multi-Vendor Isolated Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user?.name || 'Seller'}!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your localized catalog, track stock thresholds, and prepare products for the storefront.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/dashboard/products/new"
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Add Product
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Listings</span>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{totalListings}</div>
          <p className="text-xs text-slate-500 mt-1">Managed products in your catalog</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Inventory</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{totalStock}</div>
          <p className="text-xs text-slate-500 mt-1">Available units ready for checkout</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Inventory Value</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            ${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 mt-1">Cumulative product retail value</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Low Stock Alerts</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{lowStockProducts.length}</div>
          <p className="text-xs text-slate-500 mt-1">Items below 5 units threshold</p>
        </div>
      </div>

      {/* Recent Catalog Activity Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Recent Product Listings</h2>
            <p className="text-xs text-slate-400 mt-0.5">Quick overview of your latest catalog items</p>
          </div>
          <Link
            to="/dashboard/products"
            className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
            Loading catalog data...
          </div>
        ) : recentProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No products listed yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
              Get started by uploading your first product with images, pricing, and stock count.
            </p>
            <Link
              to="/dashboard/products/new"
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {recentProducts.map((product) => {
                  const isOutOfStock = product.stock === 0;
                  const isLowStock = product.stock > 0 && product.stock < 5;

                  return (
                    <tr key={product.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/60 overflow-hidden flex items-center justify-center shrink-0">
                            {product.imageUrl ? (
                              <img
                                src={`http://localhost:5000${product.imageUrl}`}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white truncate max-w-xs">{product.title}</div>
                            <div className="text-[10px] text-slate-500 truncate max-w-xs">{product.description || 'No description'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center text-slate-400">
                          <Tag className="w-3 h-3 mr-1 text-slate-500" />
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        ${Number(product.price).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-semibold">
                            Out of stock
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold">
                            Low stock ({product.stock})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                            {product.stock} in stock
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            product.status === 'active'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {product.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Week 2 Milestone Progress Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Week 2 Technical Verification Status</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-semibold">✓ Completed: </span>
            Vite React scaffold, Tailwind CSS, Axios client, AuthContext, Login/Register forms, Protected Route, and Vendor Dashboard Shell with Live Analytics.
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-indigo-400 font-semibold">→ Next Milestones: </span>
            Day 5 Product Catalog Table with search & delete modals, followed by Day 6 Product Creation/Edit forms with live image preview.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
