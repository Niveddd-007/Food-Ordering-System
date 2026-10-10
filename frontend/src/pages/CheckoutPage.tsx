import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, QrCode, Banknote, MapPin, ShieldCheck, ArrowLeft, Store, Zap, Tag, Check, X, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../api';
import { Coupon } from '../types';
import { sounds } from '../utils/soundEffects';

const SAVED_ADDRESSES = [
  { id: 1, label: 'Home', address: '742 Evergreen Terrace, Springfield, OR' },
  { id: 2, label: 'Work', address: '100 Industrial Parkway, Suite 400, Springfield, OR' },
  { id: 3, label: 'Apartment', address: '124 Conch Street, Bikini Bottom, CA' },
];

export const CheckoutPage: React.FC = () => {
  const { cart, refreshCart } = useCart();
  const [selectedAddress, setSelectedAddress] = useState<string>(SAVED_ADDRESSES[0].address);
  const [customAddress, setCustomAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Promo Coupon Engine State
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_amount: number; message: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const navigate = useNavigate();

  const items = cart?.items || [];
  const summary = cart?.summary || { subtotal: 0, tax: 0, deliveryFee: 0, total: 0 };

  useEffect(() => {
    api.getAvailableCoupons()
      .then((data) => setAvailableCoupons(data))
      .catch((err) => console.error('Error fetching coupons:', err));
  }, []);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim();
    if (!code) return;

    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await api.applyCoupon(code, summary.subtotal);
      setAppliedCoupon({
        code: res.code,
        discount_amount: res.discount_amount,
        message: res.message,
      });
      setCouponInput(res.code);
      sounds.playCouponAppliedSound();
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  };

  // Compute final total with discount
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const discountedSubtotal = Math.max(0, summary.subtotal - discountAmount);
  const tax = +(discountedSubtotal * 0.05).toFixed(2);
  const finalTotal = +(discountedSubtotal + tax + summary.deliveryFee).toFixed(2);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-zinc-100 font-['Outfit']">Your QuickBite! cart is empty</h2>
        <p className="text-xs text-zinc-400">Please add items to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 text-white font-extrabold text-xs shadow-glow-orange"
        >
          Explore QuickBite! Restaurants
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalAddress = customAddress.trim() || selectedAddress;

    try {
      const res = await api.placeOrder({
        delivery_address: finalAddress,
        payment_method: paymentMethod,
        notes: notes || undefined,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
      });

      sounds.playOrderPlacedSound();
      await refreshCart();
      navigate(`/tracking/${res.order_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-zinc-100">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shopping
      </button>

      <h1 className="text-3xl font-black font-['Outfit']">Checkout & Order Review</h1>

      {error && <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Form Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="bg-zinc-900/90 p-5 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <MapPin className="w-5 h-5 text-brand-500" />
              <h2 className="font-extrabold text-sm text-zinc-100">Delivery Address</h2>
            </div>

            <div className="space-y-2.5">
              {SAVED_ADDRESSES.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedAddress === addr.address && !customAddress
                      ? 'border-brand-500 bg-brand-500/10 text-white shadow-glow-orange'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddress === addr.address && !customAddress}
                    onChange={() => {
                      setSelectedAddress(addr.address);
                      setCustomAddress('');
                    }}
                    className="mt-0.5 text-brand-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-200 block">{addr.label}</span>
                    <span className="text-xs text-zinc-400">{addr.address}</span>
                  </div>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Or Enter Custom Address</label>
              <input
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="Enter complete street address, apartment, and city..."
                className="w-full p-3 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-zinc-900/90 p-5 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <CreditCard className="w-5 h-5 text-brand-500" />
              <h2 className="font-extrabold text-sm text-zinc-100">Payment Method</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-brand-500 bg-brand-500/10 text-brand-400 shadow-glow-orange'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-xs font-bold">Credit/Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-brand-500 bg-brand-500/10 text-brand-400 shadow-glow-orange'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <QrCode className="w-6 h-6" />
                <span className="text-xs font-bold">UPI / QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-brand-500 bg-brand-500/10 text-brand-400 shadow-glow-orange'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Banknote className="w-6 h-6" />
                <span className="text-xs font-bold">Cash on Delivery</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Delivery Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Leave at front door, ring bell..."
                className="w-full p-3 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Promo Codes Engine */}
        <div className="space-y-4">
          <div className="bg-zinc-900/90 p-5 rounded-3xl border border-zinc-800 shadow-xl space-y-4 sticky top-24">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Store className="w-4 h-4 text-brand-500" />
              <h3 className="font-extrabold text-sm text-zinc-100">{cart?.restaurant?.name}</h3>
            </div>

            {/* Cart Items List with Variants / Addons Display */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.cart_item_id} className="text-xs border-b border-zinc-800/60 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-200 font-semibold truncate max-w-[160px]">
                      {item.name} <span className="font-bold text-zinc-500">x{item.quantity}</span>
                    </span>
                    <span className="font-bold text-zinc-100">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  {item.variant && (
                    <p className="text-[10px] text-brand-400 mt-0.5">Size: {item.variant.name}</p>
                  )}
                  {item.addons && item.addons.length > 0 && (
                    <p className="text-[10px] text-zinc-400">
                      Extras: {item.addons.map((a) => a.name).join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Promo Code Input & Available Coupons */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <label className="block text-[11px] font-bold text-zinc-300 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-brand-500" /> Apply Promo Coupon
              </label>

              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="E.g. QUICKBITE20"
                    className="flex-1 px-3 py-2 text-xs uppercase font-mono rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-bold text-xs transition-colors"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{appliedCoupon.code} applied! (-${appliedCoupon.discount_amount.toFixed(2)})</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {couponError && <p className="text-[11px] text-red-400">{couponError}</p>}

              {/* Quick Click Available Coupons */}
              {availableCoupons.length > 0 && !appliedCoupon && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {availableCoupons.map((c) => (
                    <button
                      key={c.coupon_id}
                      type="button"
                      onClick={() => handleApplyCoupon(c.code)}
                      className="px-2 py-0.5 rounded-full bg-zinc-800/80 hover:bg-brand-500/20 hover:border-brand-500/40 border border-zinc-700 text-[10px] text-zinc-300 font-mono transition-colors"
                      title={c.description}
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-zinc-200">${summary.subtotal.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-${appliedCoupon.discount_amount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span className="font-bold text-zinc-200">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-zinc-200">${summary.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-zinc-100 pt-2 border-t border-zinc-800 font-['Outfit']">
                <span>Total Payable</span>
                <span className="text-brand-400">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-glow-orange hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Placing Order...' : `Pay & Place Order ($${finalTotal.toFixed(2)})`}
            </button>

            <p className="text-[10px] text-center text-zinc-500">
              🔒 Encrypted 256-bit simulated checkout transaction with ACID guarantees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
