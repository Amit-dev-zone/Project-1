import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Store, User, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { totalItems, totalPrice } = useCart();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isStorefront = location.pathname === '/' || location.pathname === '/store';
  const isCart = location.pathname === '/cart';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              AXLERO
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">
              Marketplace
            </span>
          </div>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isStorefront
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Storefront
          </Link>
          <Link
            to="/dashboard"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            Vendor Portal
          </Link>
        </nav>

        {/* Right Action Controls: Cart Badge & Auth */}
        <div className="flex items-center gap-3">
          {/* Cart Badge Button */}
          <Link
            to="/cart"
            id="cart-nav-button"
            className={`relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition-all duration-200 group ${
              isCart
                ? 'bg-indigo-600/20 border-indigo-500/70 text-white shadow-lg shadow-indigo-500/10'
                : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700/60 text-slate-200 hover:border-indigo-500/50'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2.5 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 text-white text-[11px] font-bold flex items-center justify-center shadow-md shadow-indigo-500/30 animate-pulse">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </div>

            <div className="hidden sm:block text-left text-xs">
              <span className="block text-slate-400 text-[10px] leading-tight">Your Cart</span>
              <span className="font-semibold text-white">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </Link>

          {/* Vendor Auth Action */}
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user?.name || 'Dashboard'}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all duration-150"
            >
              <span>Seller Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
