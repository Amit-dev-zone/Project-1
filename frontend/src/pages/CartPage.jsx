import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Store,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Package,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

export default function CartPage() {
  const {
    items,
    cartByVendor,
    totalItems,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [notification, setNotification] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const navigate = useNavigate();

  const handleUpdateQty = (productId, newQty, maxStock, title) => {
    if (newQty > maxStock) {
      setNotification({
        type: 'error',
        message: `Only ${maxStock} units of "${title}" available in stock`,
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const res = updateQuantity(productId, newQty);
    if (!res.success && res.message) {
      setNotification({ type: 'error', message: res.message });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleRemove = (productId, title) => {
    removeFromCart(productId);
    setNotification({
      type: 'info',
      message: `Removed "${title}" from your cart`,
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
    setNotification({
      type: 'info',
      message: 'Cart cleared successfully',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-sm flex items-center gap-2.5 ${
              notification.type === 'error'
                ? 'bg-rose-950/95 border-rose-800 text-rose-200'
                : 'bg-indigo-950/95 border-indigo-800 text-indigo-200'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Breadcrumb / Back Link */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Continue Shopping</span>
          </Link>

          {items.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                <strong className="text-white">{totalItems}</strong> item(s) across{' '}
                <strong className="text-indigo-400">{cartByVendor.length}</strong> seller(s)
              </span>
            </div>
          )}
        </div>

        {/* Empty Cart View */}
        {items.length === 0 ? (
          <div className="max-w-xl mx-auto my-12 text-center py-16 px-6 bg-slate-900/40 rounded-3xl border border-slate-800/80 shadow-2xl space-y-5">
            <div className="w-20 h-20 rounded-3xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-indigo-400 shadow-xl shadow-indigo-950/40">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Your Cart is Empty</h2>
              <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                Looks like you haven't added any products yet. Discover items from our verified
                marketplace merchants and enjoy unified cross-vendor checkout.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <span>Browse Marketplace Storefront</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Populated Cart: 2-Column Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Multi-Vendor Buckets (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Shopping Cart Line Items
                </h1>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Entire Cart</span>
                </button>
              </div>

              {/* Clear Cart Confirmation Dialog */}
              {showClearConfirm && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900/80 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-rose-200">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Are you sure you want to remove all items from your cart?</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleClearCart}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                    >
                      Yes, Clear
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Render Discrete Vendor Buckets (Data Integrity Invariant) */}
              {cartByVendor.map((vendorBucket) => (
                <div
                  key={vendorBucket.vendorId}
                  className="rounded-3xl bg-slate-900/90 border border-slate-800/80 overflow-hidden shadow-xl"
                >
                  {/* Vendor Bucket Header */}
                  <div className="px-5 py-4 bg-slate-800/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">
                            {vendorBucket.vendorName}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-800/60 text-[10px] text-indigo-300 font-semibold">
                            Verified Merchant
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {vendorBucket.itemCount} unit(s) • Direct seller fulfillment
                        </p>
                      </div>
                    </div>

                    {/* Per-Vendor Subtotal Badge */}
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block leading-tight">
                        Vendor Subtotal
                      </span>
                      <span className="text-sm font-bold text-indigo-300">
                        ${vendorBucket.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Vendor Items List */}
                  <div className="divide-y divide-slate-800/60 p-2 sm:p-4">
                    {vendorBucket.items.map((item) => {
                      const itemSubtotal = (item.price * item.quantity).toFixed(2);
                      const maxStock = typeof item.stock === 'number' ? item.stock : 999;
                      const isAtMaxStock = item.quantity >= maxStock;

                      return (
                        <div
                          key={item.id}
                          className="py-4 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                        >
                          {/* Item Thumbnail & Information */}
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border border-slate-700/60 overflow-hidden shrink-0 flex items-center justify-center">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <Package className="w-7 h-7 text-slate-600" />
                              )}
                            </div>

                            <div className="min-w-0 space-y-1">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                                {item.category || 'Product'}
                              </span>
                              <h3 className="text-sm font-bold text-white truncate max-w-sm">
                                {item.title}
                              </h3>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-semibold text-slate-300">
                                  ${Number(item.price).toFixed(2)}
                                </span>
                                <span className="text-slate-600">•</span>
                                <span className="text-[11px] text-slate-500">
                                  {maxStock} available
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stepper Controls & Line Price */}
                          <div className="flex items-center justify-between sm:justify-end gap-5">
                            {/* Quantity Stepper */}
                            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1">
                              <button
                                onClick={() =>
                                  handleUpdateQty(item.id, item.quantity - 1, maxStock, item.title)
                                }
                                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              <span className="w-8 text-center text-xs font-bold text-white">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  handleUpdateQty(item.id, item.quantity + 1, maxStock, item.title)
                                }
                                disabled={isAtMaxStock}
                                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Line Item Total */}
                            <div className="text-right w-20">
                              <span className="text-sm font-bold text-white block">
                                ${itemSubtotal}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                ${(Number(item.price)).toFixed(2)} / ea
                              </span>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleRemove(item.id, item.title)}
                              className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Order Summary (4 cols) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800/80 p-6 shadow-2xl space-y-6">
                <h2 className="text-base font-bold text-white tracking-tight pb-3 border-b border-slate-800">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Items Subtotal ({totalItems} units)</span>
                    <span className="font-semibold text-white">${totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Vendor Packages</span>
                    <span className="font-semibold text-indigo-400">
                      {cartByVendor.length} Seller Dispatch(es)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Standard Shipping</span>
                    <span className="font-semibold text-emerald-400">FREE</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Marketplace Platform Fee</span>
                    <span className="font-semibold text-slate-300">$0.00</span>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-baseline justify-between">
                    <div>
                      <span className="text-sm font-bold text-white block">Estimated Total</span>
                      <span className="text-[10px] text-slate-500">Including all vendor line items</span>
                    </div>
                    <span className="text-2xl font-extrabold text-white">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Trust & Guarantees */}
                <div className="pt-4 border-t border-slate-800 space-y-2.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Multi-Vendor Split Fulfillment Protection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Independent Vendor Tracking Numbers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Inventory Verified Prior to Settlement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
