import React, { useEffect, useState } from 'react';
import { ShoppingBag, Check, Plus, Minus, AlertCircle, Sparkles, Store } from 'lucide-react';
import { productService } from '../api/productService';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedNotice, setAddedNotice] = useState(null);

  const { addToCart, isInCart, getItemQuantity } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await productService.getPublicProducts({ limit: 12 });
        setProducts(res.data || []);
      } catch (err) {
        console.error('Failed to load marketplace products:', err);
        setError('Failed to load marketplace products. Please check server connectivity.');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    const result = addToCart(product, 1);
    if (result.success) {
      setAddedNotice({
        productId: product.id || product._id,
        message: result.message || `Added "${product.title}" to cart!`,
        isError: false,
      });
    } else {
      setAddedNotice({
        productId: product.id || product._id,
        message: result.message || 'Cannot add item to cart',
        isError: true,
      });
    }

    setTimeout(() => {
      setAddedNotice(null);
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      {/* Hero Announcement */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-indigo-950/30 to-slate-950 py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Vendor Discovery & Unified Cart Engine</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Discover Products Across Verified Sellers
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Browse our curated cross-vendor marketplace. Add products from multiple independent
            merchants to a single unified shopping cart with real-time stock integrity.
          </p>
        </div>
      </section>

      {/* Notification Toast */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl border text-sm flex items-center gap-2.5 ${
              addedNotice.isError
                ? 'bg-rose-950 border-rose-800 text-rose-200'
                : 'bg-emerald-950 border-emerald-800 text-emerald-200'
            }`}
          >
            {addedNotice.isError ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{addedNotice.message}</span>
          </div>
        </div>
      )}

      {/* Main Product Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-white">Featured Marketplace Listings</h2>
            <p className="text-xs text-slate-400">Real-time inventory verified products</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse p-4 flex flex-col justify-between"
              >
                <div className="h-44 bg-slate-800 rounded-xl" />
                <div className="space-y-2 mt-4">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-rose-950/30 border border-rose-900 text-center max-w-md mx-auto space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-slate-900/50 rounded-2xl border border-slate-800">
            <Store className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-300">No products available yet</h3>
            <p className="text-xs text-slate-500">
              Vendors can log in to upload products to the marketplace.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const productId = product.id || product._id;
              const inCart = isInCart(productId);
              const qtyInCart = getItemQuantity(productId);
              const isOutOfStock = product.stock <= 0;

              return (
                <div
                  key={productId}
                  className="group rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5"
                >
                  {/* Image & Badges */}
                  <div>
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-800 mb-3.5">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Store className="w-10 h-10" />
                        </div>
                      )}

                      {/* Category Badge */}
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-[11px] font-medium text-slate-300 border border-slate-700/50">
                        {product.category || 'General'}
                      </span>

                      {/* Stock Status */}
                      <span
                        className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          isOutOfStock
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
                      </span>
                    </div>

                    {/* Vendor Origin */}
                    <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 font-medium mb-1">
                      <Store className="w-3 h-3" />
                      <span className="truncate">{product.vendorName || 'Independent Vendor'}</span>
                    </div>

                    {/* Product Title */}
                    <h3 className="font-semibold text-slate-100 text-sm line-clamp-2 group-hover:text-indigo-300 transition-colors">
                      {product.title}
                    </h3>
                  </div>

                  {/* Pricing & Add to Cart Action */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block leading-none">Price</span>
                      <span className="text-base font-bold text-white">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 ${
                        isOutOfStock
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : inCart
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>In Cart ({qtyInCart})</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
