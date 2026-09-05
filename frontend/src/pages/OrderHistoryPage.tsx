import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, RefreshCw, ChevronRight, ShoppingBag } from 'lucide-react';
import { api } from '../api';
import { Order } from '../types';

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getOrderHistory();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (e: React.MouseEvent, orderId: number) => {
    e.stopPropagation();
    try {
      await api.reorder(orderId);
      navigate('/');
    } catch (err: any) {
      alert(err.message || 'Failed to reorder');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-zinc-100">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-['Outfit']">Your QuickBite! Orders</h1>
          <p className="text-xs text-zinc-400">Track live orders or reorder past favorites</p>
        </div>
        <button
          onClick={loadHistory}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 transition-colors"
          title="Refresh History"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-zinc-900 rounded-3xl p-6 h-32 animate-pulse border border-zinc-800" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-zinc-900/50 rounded-3xl p-12 text-center text-zinc-500 border border-zinc-800 space-y-3">
          <ShoppingBag className="w-12 h-12 stroke-1 mx-auto text-zinc-600" />
          <h3 className="font-bold text-zinc-200 text-base">No past orders found</h3>
          <p className="text-xs text-zinc-400">You haven't placed any food orders yet.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 text-white font-bold text-xs shadow-glow-orange"
          >
            Start Browsing
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.order_id}
              onClick={() => navigate(`/tracking/${order.order_id}`)}
              className="bg-zinc-900/90 p-5 rounded-3xl border border-zinc-800/80 hover:border-brand-500/40 shadow-xl transition-all cursor-pointer space-y-3 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={order.restaurant_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=150&q=80'}
                    alt={order.restaurant_name}
                    className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-zinc-800"
                  />
                  <div>
                    <h3 className="font-black text-sm text-zinc-100 font-['Outfit']">{order.restaurant_name}</h3>
                    <p className="text-[11px] text-zinc-400">Order #{order.order_id} • {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.order_status === 'Delivered'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : order.order_status === 'Cancelled'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                    }`}
                  >
                    {order.order_status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </div>

              <div className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-2xl border border-zinc-800/80">
                {order.items?.map((item) => (
                  <span key={item.order_item_id} className="mr-3 font-semibold">
                    {item.quantity}x {item.name}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-black text-zinc-100 text-sm font-['Outfit']">${order.total_amount.toFixed(2)}</span>
                
                <button
                  onClick={(e) => handleReorder(e, order.order_id)}
                  className="px-4 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500 hover:text-white text-brand-400 font-bold text-xs border border-brand-500/30 transition-all"
                >
                  Reorder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
