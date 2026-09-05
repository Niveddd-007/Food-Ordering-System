import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Store, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const items = cart?.items || [];
  const summary = cart?.summary || { subtotal: 0, tax: 0, deliveryFee: 0, total: 0 };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setIsCartOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#121215] text-zinc-100 shadow-2xl flex flex-col border-l border-zinc-800">
          
          {/* Header */}
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-base text-zinc-100 font-['Outfit']">Your QuickBite! Cart</h2>
                <span className="text-[11px] text-zinc-400">{items.length} {items.length === 1 ? 'item' : 'items'} added</span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Restaurant Banner */}
          {cart?.restaurant && (
            <div className="px-4 py-2.5 bg-brand-500/10 border-b border-brand-500/20 flex items-center justify-between text-xs font-bold text-brand-300">
              <div className="flex items-center gap-2 truncate">
                <Store className="w-4 h-4 text-brand-400 shrink-0" />
                <span className="truncate">{cart.restaurant.name}</span>
              </div>
              <button onClick={clearCart} className="text-brand-400 hover:underline text-[11px]">
                Clear Cart
              </button>
            </div>
          )}

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <ShoppingBag className="w-16 h-16 stroke-1 text-zinc-700 mb-3" />
                <p className="font-extrabold text-zinc-200 text-base font-['Outfit']">Your cart is empty</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
                  Browse delicious dishes from local restaurants and order in seconds!
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="flex gap-3 p-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/80 hover:border-brand-500/30 transition-all"
                >
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-zinc-800"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs text-zinc-100 truncate">{item.name}</h4>
                        <button
                          onClick={() => removeItem(item.cart_item_id)}
                          className="text-zinc-500 hover:text-red-400 p-0.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-black text-brand-400 mt-0.5">${item.price.toFixed(2)}</p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 shadow-inner">
                        <button
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                          className="p-1 text-zinc-400 hover:bg-zinc-800 rounded text-zinc-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black w-4 text-center text-zinc-100">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                          className="p-1 text-zinc-400 hover:bg-zinc-800 rounded text-zinc-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-black text-zinc-100">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Price Breakdown */}
          {items.length > 0 && (
            <div className="p-4 border-t border-zinc-800 bg-zinc-950 space-y-3">
              <div className="space-y-1.5 text-xs text-zinc-400">
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
                <div className="flex justify-between text-sm font-black text-zinc-100 pt-2 border-t border-zinc-800">
                  <span>Total Payable</span>
                  <span className="text-brand-400 text-base font-black">${summary.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-black text-xs shadow-glow-orange hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
