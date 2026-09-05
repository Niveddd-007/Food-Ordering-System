import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, QrCode, Banknote, MapPin, ShieldCheck, ArrowLeft, Store, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../api';

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

  const navigate = useNavigate();

  const items = cart?.items || [];
  const summary = cart?.summary || { subtotal: 0, tax: 0, deliveryFee: 0, total: 0 };

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
      });

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
        
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Delivery Address */}
          <div className="bg-zinc-900/90 p-5 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
            <h3 className="font-extrabold text-sm text-zinc-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-500" />
              <span>Select Delivery Address</span>
            </h3>

            <div className="space-y-2">
              {SAVED_ADDRESSES.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedAddress === addr.address && !customAddress
                      ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'
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
                    className="mt-1 text-brand-500 focus:ring-brand-500 bg-zinc-900 border-zinc-700"
                  />
                  <div>
                    <span className="font-extrabold text-xs text-zinc-100 uppercase tracking-wider">{addr.label}</span>
                    <p className="text-xs text-zinc-400">{addr.address}</p>
                  </div>
                </label>
              ))}

              <div className="pt-2">
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="Or enter a new custom delivery address..."
                  className="w-full p-3 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-zinc-900/90 p-5 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-zinc-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-500" />
                <span>Payment Method</span>
              </h3>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Simulated Sandbox
              </span>
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

        {/* Right Column */}
        <div className="space-y-4">
          <div className="bg-zinc-900/90 p-5 rounded-3xl border border-zinc-800 shadow-xl space-y-4 sticky top-24">
            
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Store className="w-4 h-4 text-brand-500" />
              <h3 className="font-extrabold text-sm text-zinc-100">{cart?.restaurant?.name}</h3>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.cart_item_id} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 truncate max-w-[160px]">
                    {item.name} <span className="font-bold text-zinc-500">x{item.quantity}</span>
                  </span>
                  <span className="font-bold text-zinc-100">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-zinc-200">${summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span className="font-bold text-zinc-200">${summary.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-zinc-200">${summary.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-zinc-100 pt-2 border-t border-zinc-800 font-['Outfit']">
                <span>Total Payable</span>
                <span className="text-brand-400">${summary.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-glow-orange hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Placing Order...' : `Pay & Place Order ($${summary.total.toFixed(2)})`}
            </button>

            <p className="text-[10px] text-center text-zinc-500">
              🔒 Encrypted 256-bit simulated checkout transaction.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
