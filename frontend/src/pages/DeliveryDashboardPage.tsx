import React, { useState, useEffect } from 'react';
import { Bike, MapPin, CheckCircle2, Navigation, RefreshCw, Store } from 'lucide-react';
import { api } from '../api';
import { Order } from '../types';

export const DeliveryDashboardPage: React.FC = () => {
  const [driver, setDriver] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const data = await api.getAssignedDeliveries();
      setDriver(data.driver);
      setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDelivery = async (orderId: number, status: string) => {
    try {
      await api.updateDeliveryStatus(orderId, status);
      loadDeliveries();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  if (loading || !driver) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-zinc-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-2" />
        <p className="text-xs">Loading QuickBite! Delivery Driver Portal...</p>
      </div>
    );
  }

  const activeOrders = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.order_status));
  const pastOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.order_status));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-zinc-100">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
            <Bike className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">QuickBite! Courier Dispatch</div>
            <h1 className="text-2xl font-black font-['Outfit']">{driver.vehicle_type} Driver</h1>
            <p className="text-xs text-zinc-300 mt-0.5">License: {driver.license_plate} • Status: Active</p>
          </div>
        </div>

        <button
          onClick={loadDeliveries}
          className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-white text-xs font-bold flex items-center gap-2 backdrop-blur-md self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Deliveries
        </button>
      </div>

      {/* Active Tasks */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-zinc-100 font-['Outfit'] flex items-center gap-2">
          <Navigation className="w-5 h-5 text-emerald-400" />
          <span>Active Delivery Runs ({activeOrders.length})</span>
        </h2>

        {activeOrders.length === 0 ? (
          <div className="bg-zinc-900/50 rounded-3xl p-10 text-center text-zinc-500 border border-zinc-800 space-y-2">
            <CheckCircle2 className="w-12 h-12 stroke-1 mx-auto text-emerald-400" />
            <h3 className="font-bold text-zinc-200 text-base font-['Outfit']">No active deliveries pending</h3>
            <p className="text-xs text-zinc-400">You're all caught up! New assigned orders will appear here.</p>
          </div>
        ) : (
          activeOrders.map((order) => (
            <div key={order.order_id} className="bg-zinc-900/90 p-5 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
              
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="font-black text-sm text-zinc-100">Order #{order.order_id}</span>
                  <p className="text-[11px] text-zinc-500">Assigned at {new Date(order.created_at).toLocaleTimeString()}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {order.order_status}
                </span>
              </div>

              {/* Pickup & Drop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-[10px] uppercase font-extrabold text-blue-400 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-blue-400" />
                    Pickup Location
                  </span>
                  <div className="font-extrabold text-zinc-100">{order.restaurant_name}</div>
                  <div className="text-zinc-400">{order.restaurant_address}</div>
                  {order.restaurant_phone && (
                    <a href={`tel:${order.restaurant_phone}`} className="inline-block text-blue-400 font-bold mt-1">
                      📞 {order.restaurant_phone}
                    </a>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/30 space-y-1">
                  <span className="text-[10px] uppercase font-extrabold text-brand-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-400" />
                    Customer Delivery Address
                  </span>
                  <div className="font-extrabold text-zinc-100">{order.customer_name}</div>
                  <div className="text-zinc-300">{order.delivery_address}</div>
                  {order.customer_phone && (
                    <a href={`tel:${order.customer_phone}`} className="inline-block text-brand-400 font-bold mt-1">
                      📞 {order.customer_phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-xs">
                <span className="font-bold text-zinc-400 block mb-1">Items to Deliver:</span>
                {order.items?.map((item) => (
                  <span key={item.order_item_id} className="mr-3 font-semibold text-zinc-200">
                    {item.quantity}x {item.name}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-zinc-800">
                {order.order_status !== 'Out for Delivery' && (
                  <button
                    onClick={() => handleUpdateDelivery(order.order_id, 'Picked Up')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                  >
                    Confirm Pickup (Picked Up)
                  </button>
                )}

                {order.order_status === 'Out for Delivery' && (
                  <button
                    onClick={() => handleUpdateDelivery(order.order_id, 'Delivered')}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Delivered to Customer</span>
                  </button>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* History */}
      {pastOrders.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-zinc-800">
          <h3 className="font-extrabold text-sm text-zinc-300 font-['Outfit']">Completed Runs ({pastOrders.length})</h3>
          <div className="space-y-2">
            {pastOrders.map((order) => (
              <div key={order.order_id} className="bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-zinc-100">Order #{order.order_id} • {order.restaurant_name}</span>
                  <p className="text-zinc-400 text-[11px]">{order.delivery_address}</p>
                </div>
                <span className="px-3 py-1 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {order.order_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
