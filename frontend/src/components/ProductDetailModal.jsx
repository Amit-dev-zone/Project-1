import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Check,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  Store,
  AlertCircle,
  Tag,
  Package,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetailModal({ product, isOpen, onClose }) {
  const { addToCart, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Reset quantity whenever a new product is opened
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setAddedSuccess(false);
      setErrorMessage(null);
    }
  }, [product]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const productId = product.id || product._id;
  const currentInCart = getItemQuantity(productId);
  const maxStock = typeof product.stock === 'number' ? product.stock : 999;
  const isOutOfStock = maxStock <= 0;
  const maxCanAdd = Math.max(0, maxStock - currentInCart);

  const handleIncrement = () => {
    if (quantity < maxCanAdd) {
      setQuantity((q) => q + 1);
      setErrorMessage(null);
    } else {
      setErrorMessage(`Cannot exceed available inventory limit (${maxStock} total in stock)`);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
      setErrorMessage(null);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    const result = addToCart(product, quantity);
    if (result.success) {
      setAddedSuccess(true);
      setErrorMessage(null);
      setTimeout(() => {
        setAddedSuccess(false);
      }, 2000);
    } else {
      setErrorMessage(result.message || 'Cannot add item to cart');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Window */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-y-auto flex flex-col z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Left Column: Product Image Gallery */}
          <div className="flex flex-col">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/60 flex items-center justify-center group">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-600 gap-2">
                  <Package className="w-16 h-16" />
                  <span className="text-xs">No image provided</span>
                </div>
              )}

              {/* Category Badge */}
              <span className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-slate-950/85 backdrop-blur-sm text-xs font-semibold text-slate-300 border border-slate-700/60 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>{product.category || 'General'}</span>
              </span>

              {/* Stock Status Badge */}
              <span
                className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-bold ${
                  isOutOfStock
                    ? 'bg-rose-950/90 text-rose-300 border border-rose-800'
                    : maxStock <= 5
                    ? 'bg-amber-950/90 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950/90 text-emerald-300 border border-emerald-800'
                }`}
              >
                {isOutOfStock
                  ? 'Out of Stock'
                  : maxStock <= 5
                  ? `Only ${maxStock} units left`
                  : `${maxStock} units in stock`}
              </span>
            </div>

            {/* In Cart Indicator */}
            {currentInCart > 0 && (
              <div className="mt-3 px-3 py-2 rounded-xl bg-indigo-950/50 border border-indigo-900/60 text-xs text-indigo-300 flex items-center justify-between">
                <span>Currently in your cart:</span>
                <strong className="text-white font-semibold">{currentInCart} unit(s)</strong>
              </div>
            )}
          </div>

          {/* Right Column: Details, Vendor Attribution & Quantity Picker */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              {/* Vendor Attribution Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-indigo-400 text-xs font-medium mb-3">
                <Store className="w-4 h-4" />
                <span>Sold by:</span>
                <strong className="text-slate-100">{product.vendorName || 'Verified Merchant'}</strong>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                {product.title}
              </h2>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">
                  ${Number(product.price).toFixed(2)}
                </span>
                <span className="text-xs text-slate-500">USD per unit</span>
              </div>

              {/* Description */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Product Description
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed max-h-36 overflow-y-auto pr-1">
                  {product.description || 'No detailed description provided by the seller.'}
                </p>
              </div>

              {/* Verified Vendor Trust Card */}
              <div className="mt-5 p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Marketplace Verified Seller Guarantee</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Direct Merchant Dispatch</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Inventory Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase & Quantity Actions */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              {errorMessage && (
                <div className="px-3 py-2 rounded-xl bg-rose-950/60 border border-rose-900 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Dynamic Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-medium text-slate-300">Select Quantity</span>
                    <span className="text-[11px] text-slate-500">
                      {maxCanAdd > 0
                        ? `Up to ${maxCanAdd} more can be added`
                        : 'Maximum stock limit already in cart'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1">
                    <button
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-10 text-center font-bold text-sm text-white">
                      {quantity}
                    </span>

                    <button
                      onClick={handleIncrement}
                      disabled={quantity >= maxCanAdd || maxCanAdd === 0}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || maxCanAdd === 0}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-xl ${
                  isOutOfStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    : maxCanAdd === 0
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700/50'
                    : addedSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-[0.98]'
                }`}
              >
                {isOutOfStock ? (
                  <span>Out of Stock</span>
                ) : maxCanAdd === 0 ? (
                  <span>Max Stock in Cart</span>
                ) : addedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Added {quantity} to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>
                      Add {quantity} to Cart • ${(Number(product.price) * quantity).toFixed(2)}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
