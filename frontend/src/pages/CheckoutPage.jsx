import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Truck,
  Store,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Package,
  Lock,
  Wallet,
  Building2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

export default function CheckoutPage() {
  const { items, cartByVendor, totalItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    paymentMethod: 'card', // 'card', 'upi', 'cod'
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  // If cart is empty and no order has been placed, redirect view
  if (items.length === 0 && !orderConfirmed) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="max-w-md mx-auto my-20 p-8 text-center bg-slate-900/60 border border-slate-800 rounded-3xl shadow-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-indigo-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
          <p className="text-xs text-slate-400">
            Please add items from the marketplace to proceed with multi-vendor checkout.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            <span>Return to Storefront</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Valid email address is required';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.address.trim()) errors.address = 'Delivery address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.postalCode.trim()) errors.postalCode = 'Postal code is required';

    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber.trim() || formData.cardNumber.replace(/\s/g, '').length < 15) {
        errors.cardNumber = 'Valid card number is required';
      }
      if (!formData.cardExpiry.trim()) errors.cardExpiry = 'MM/YY required';
      if (!formData.cardCvv.trim() || formData.cardCvv.length < 3) {
        errors.cardCvv = 'CVV required';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate multi-vendor order generation & split settlement
    setTimeout(() => {
      const orderId = `AXL-${Math.floor(100000 + Math.random() * 900000)}`;
      const timestamp = new Date().toLocaleString();

      // Create discrete sub-order records per vendor
      const vendorPackages = cartByVendor.map((v, idx) => ({
        packageIndex: idx + 1,
        vendorId: v.vendorId,
        vendorName: v.vendorName,
        trackingNumber: `TRK-${v.vendorId.slice(-4).toUpperCase()}-${Math.floor(
          10000 + Math.random() * 90000
        )}`,
        items: v.items,
        subtotal: v.subtotal,
      }));

      const receipt = {
        orderId,
        timestamp,
        customer: { ...formData },
        vendorPackages,
        grandTotal: totalPrice,
        totalItems,
      };

      setOrderConfirmed(receipt);
      clearCart(); // Clean invariant: clear cart on successful placement
      setIsProcessing(false);
    }, 1800);
  };

  // Render Order Confirmation Receipt
  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full space-y-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Order Confirmed & Authorized!
            </h1>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Thank you, <strong className="text-white">{orderConfirmed.customer.fullName}</strong>.
              Your multi-vendor order has been secured. Products have been split and routed to their
              respective merchants for direct fulfillment.
            </p>

            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="text-slate-400">Master Order Reference:</span>
              <strong className="text-indigo-400 font-mono text-sm">
                {orderConfirmed.orderId}
              </strong>
            </div>
          </div>

          {/* Multi-Vendor Split Dispatch Packages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-400" />
                <span>Split Vendor Dispatch Packages ({orderConfirmed.vendorPackages.length})</span>
              </h2>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Cross-Contamination Guaranteed</span>
              </span>
            </div>

            {orderConfirmed.vendorPackages.map((pkg) => (
              <div
                key={pkg.vendorId}
                className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 shadow-xl space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white">{pkg.vendorName}</span>
                      <p className="text-[11px] text-slate-400">
                        Package {pkg.packageIndex} of {orderConfirmed.vendorPackages.length}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400">
                      Tracking No:{' '}
                      <strong className="text-slate-200 font-mono">{pkg.trackingNumber}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 font-semibold text-[11px]">
                      Dispatched Directly
                    </span>
                  </div>
                </div>

                {/* Items in package */}
                <div className="space-y-2">
                  {pkg.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between text-xs py-1.5 text-slate-300"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-medium text-white">{it.title}</span>
                        <span className="text-slate-500">× {it.quantity}</span>
                      </div>
                      <span className="font-semibold text-slate-200">
                        ${(it.price * it.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Vendor Package Settlement Subtotal</span>
                  <strong className="text-indigo-300 font-bold text-sm">
                    ${pkg.subtotal.toFixed(2)}
                  </strong>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery & Settlement Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
              <h3 className="font-bold text-white text-sm mb-2">Delivery Destination</h3>
              <p className="text-slate-300 font-medium">{orderConfirmed.customer.fullName}</p>
              <p className="text-slate-400">{orderConfirmed.customer.address}</p>
              <p className="text-slate-400">
                {orderConfirmed.customer.city}, {orderConfirmed.customer.state}{' '}
                {orderConfirmed.customer.postalCode}
              </p>
              <p className="text-slate-400">{orderConfirmed.customer.phone}</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-white text-sm mb-2">Settlement Summary</h3>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Grand Total Paid</span>
                  <strong className="text-white text-base">
                    ${orderConfirmed.grandTotal.toFixed(2)}
                  </strong>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Payment Channel</span>
                  <span className="text-emerald-400 font-semibold uppercase">
                    {orderConfirmed.customer.paymentMethod} • Authorized
                  </span>
                </div>
              </div>

              <Link
                to="/"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs text-center shadow-lg shadow-indigo-600/30 transition-all mt-4"
              >
                Back to Marketplace Storefront
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Navigation Back */}
        <div className="mb-6">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Return to Cart Review</span>
          </Link>
        </div>

        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-8">
          Multi-Vendor Secure Checkout
        </h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Delivery & Payment Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Customer & Delivery Address */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Truck className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">1. Shipping & Delivery Address</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Jane Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  {formErrors.fullName && (
                    <span className="text-[11px] text-rose-400 mt-1 block">
                      {formErrors.fullName}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="jane@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  {formErrors.email && (
                    <span className="text-[11px] text-rose-400 mt-1 block">
                      {formErrors.email}
                    </span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Marketplace Boulevard, Suite 400"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  {formErrors.address && (
                    <span className="text-[11px] text-rose-400 mt-1 block">
                      {formErrors.address}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="San Francisco"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  {formErrors.city && (
                    <span className="text-[11px] text-rose-400 mt-1 block">
                      {formErrors.city}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="94103"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  {formErrors.postalCode && (
                    <span className="text-[11px] text-rose-400 mt-1 block">
                      {formErrors.postalCode}
                    </span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  {formErrors.phone && (
                    <span className="text-[11px] text-rose-400 mt-1 block">
                      {formErrors.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Payment Method Simulation */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Lock className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">2. Payment Method Simulation</h2>
              </div>

              {/* Payment Type Tabs */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'card', label: 'Credit Card', icon: CreditCard },
                  { id: 'upi', label: 'UPI / Wallet', icon: Wallet },
                  { id: 'cod', label: 'Cash on Del.', icon: Building2 },
                ].map((m) => {
                  const Icon = m.icon;
                  const active = formData.paymentMethod === m.id;
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setFormData((p) => ({ ...p, paymentMethod: m.id }))}
                      className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                        active
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Card Form Inputs */}
              {formData.paymentMethod === 'card' && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="4532 •••• •••• 8892"
                      maxLength={19}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                    {formErrors.cardNumber && (
                      <span className="text-[11px] text-rose-400 mt-1 block">
                        {formErrors.cardNumber}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                      {formErrors.cardExpiry && (
                        <span className="text-[11px] text-rose-400 mt-1 block">
                          {formErrors.cardExpiry}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        CVV Code *
                      </label>
                      <input
                        type="password"
                        name="cardCvv"
                        value={formData.cardCvv}
                        onChange={handleInputChange}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                      {formErrors.cardCvv && (
                        <span className="text-[11px] text-rose-400 mt-1 block">
                          {formErrors.cardCvv}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'upi' && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">Instant UPI Authorization</p>
                  <p className="text-slate-400">
                    A secure payment request will be routed directly to your configured digital
                    wallet upon authorization.
                  </p>
                </div>
              )}

              {formData.paymentMethod === 'cod' && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">Cash on Delivery</p>
                  <p className="text-slate-400">
                    You can pay the independent vendor delivery agents directly upon package
                    arrival.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Multi-Vendor Order Review & Split Breakdown (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6 lg:sticky lg:top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-base font-bold text-white">Multi-Vendor Package Breakdown</h2>
                <span className="text-xs text-indigo-400 font-semibold">
                  {cartByVendor.length} Package(s)
                </span>
              </div>

              {/* Package cards per vendor */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cartByVendor.map((pkg, idx) => (
                  <div
                    key={pkg.vendorId}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        <Store className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{pkg.vendorName}</span>
                      </div>
                      <span className="font-semibold text-indigo-300">
                        ${pkg.subtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-400 text-[11px]">
                      {pkg.items.map((it) => (
                        <div key={it.id} className="flex justify-between">
                          <span className="truncate max-w-[180px]">
                            {it.title} × {it.quantity}
                          </span>
                          <span>${(it.price * it.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="space-y-2.5 pt-3 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Items Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-white">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Split Handling</span>
                  <span className="font-semibold text-emerald-400">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span className="font-semibold text-slate-300">$0.00</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-white">Total Amount</span>
                  <span className="text-2xl font-extrabold text-white">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Authorizing Split Settlement...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Place Order & Pay ${totalPrice.toFixed(2)}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>256-Bit Encrypted Multi-Vendor Checkout</span>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
