import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bike, MapPin, Phone, Star, RefreshCw, ArrowLeft } from 'lucide-react';
import { api } from '../api';
import { Order } from '../types';
import { OrderStepper } from '../components/OrderStepper';
import { ReviewModal } from '../components/ReviewModal';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchOrderDetails(parseInt(id));

      const interval = setInterval(() => {
        fetchOrderDetails(parseInt(id), true);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [id]);

  const fetchOrderDetails = async (orderId: number, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.getOrderDetails(orderId);
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-zinc-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-500 mb-2" />
        <p className="text-xs">Fetching QuickBite! order status...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-zinc-100">
      
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Order History
      </button>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-amber-600 rounded-3xl p-6 text-white shadow-glow-orange flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-extrabold text-brand-200 tracking-wider">Order #{order.order_id}</div>
          <h1 className="text-3xl font-black font-['Outfit']">{order.restaurant_name}</h1>
          <p className="text-xs text-brand-100 mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>
        
        <div className="bg-black/30 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 text-center">
          <div className="text-[10px] uppercase font-bold text-brand-200">Current Status</div>
          <div className="text-lg font-black text-white font-['Outfit']">{order.order_status}</div>
        </div>
      </div>

      {/* Visual Status Stepper */}
      <div className="bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <h3 className="text-sm font-extrabold text-zinc-100 mb-2 font-['Outfit']">Order Lifecycle Progression</h3>
        <OrderStepper status={order.order_status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Delivery Details */}
        <div className="bg-zinc-900/90 p-5 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
          <h3 className="font-extrabold text-sm text-zinc-100 flex items-center gap-2">
            <Bike className="w-4 h-4 text-brand-500" />
            <span>Delivery & Courier Information</span>
          </h3>

          <div className="space-y-3 text-xs text-zinc-400">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-zinc-200 block">Delivery Address</span>
                <span>{order.delivery_address}</span>
              </div>
            </div>

            {order.delivery_driver_name ? (
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center shadow-glow-orange">
                    {order.delivery_driver_name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-extrabold text-zinc-100 block">{order.delivery_driver_name}</span>
                    <span className="text-[11px] text-zinc-400">{order.vehicle_type} • {order.license_plate}</span>
                  </div>
                </div>
                {order.delivery_driver_phone && (
                  <a
                    href={`tel:${order.delivery_driver_phone}`}
                    className="p-2 rounded-xl bg-zinc-800 text-brand-400 hover:bg-brand-500 hover:text-white transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">Assigning nearest available QuickBite! courier...</p>
            )}
          </div>
        </div>

        {/* Order Items & Payment */}
        <div className="bg-zinc-900/90 p-5 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
          <h3 className="font-extrabold text-sm text-zinc-100 font-['Outfit']">Order Summary</h3>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {order.items?.map((item) => (
              <div key={item.order_item_id} className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 truncate max-w-[200px]">
                  {item.name} <span className="font-bold text-zinc-500">x{item.quantity}</span>
                </span>
                <span className="font-bold text-zinc-100">${(item.price_at_order_time * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-xs text-zinc-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-zinc-200">${order.subtotal_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span className="font-bold text-zinc-200">${order.tax_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-bold text-zinc-200">${order.delivery_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-zinc-100 pt-2 border-t border-zinc-800 font-['Outfit']">
              <span>Total Paid</span>
              <span className="text-brand-400">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {order.order_status === 'Delivered' && (
            <div className="pt-2">
              {order.review ? (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold">You rated this {order.review.rating}/5 stars</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  <Star className="w-4 h-4 fill-white" />
                  <span>Leave a Review for {order.restaurant_name}</span>
                </button>
              )}
            </div>
          )}

        </div>

      </div>

      <ReviewModal
        orderId={order.order_id}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => fetchOrderDetails(order.order_id)}
      />

    </div>
  );
};
