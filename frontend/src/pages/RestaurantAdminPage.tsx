import React, { useState, useEffect } from 'react';
import { Store, ShoppingBag, Plus, Edit, Trash2, CheckCircle2, Utensils, RefreshCw, X } from 'lucide-react';
import { api } from '../api';
import { Restaurant, Order } from '../types';

export const RestaurantAdminPage: React.FC = () => {
  const [data, setData] = useState<{ restaurant: Restaurant; stats: any; activeOrders: Order[]; topItems: any[] } | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'queue' | 'menu'>('queue');
  const [loading, setLoading] = useState<boolean>(true);

  // Menu Modal state
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [isVeg, setIsVeg] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminDashboard();
      setData(res);

      const menuRes = await api.getAdminMenu();
      setMenuItems(menuRes.items);
      setCategories(menuRes.categories);
      if (menuRes.categories.length > 0) {
        setCategoryId(menuRes.categories[0].category_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice('');
    setImageUrl('');
    setIsVeg(true);
    setIsMenuModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description || '');
    setPrice(item.price.toString());
    setImageUrl(item.image_url || '');
    setCategoryId(item.category_id);
    setIsVeg(!!item.is_veg);
    setIsMenuModalOpen(true);
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateMenuItem(editingItem.item_id, {
          name,
          description,
          price: parseFloat(price),
          image_url: imageUrl,
          category_id: categoryId,
          is_veg: isVeg,
        });
      } else {
        await api.addMenuItem({
          restaurant_id: data?.restaurant.restaurant_id,
          category_id: categoryId,
          name,
          description,
          price: parseFloat(price),
          image_url: imageUrl,
          is_veg: isVeg,
        });
      }
      setIsMenuModalOpen(false);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save menu item');
    }
  };

  const handleDeleteMenuItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.deleteMenuItem(itemId);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete item');
    }
  };

  if (loading || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-zinc-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
        <p className="text-xs">Loading Restaurant Admin Portal...</p>
      </div>
    );
  }

  const { restaurant, stats, activeOrders } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-zinc-100">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 shrink-0">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-blue-300 uppercase tracking-wider">Restaurant Management Portal</div>
            <h1 className="text-2xl font-black font-['Outfit']">{restaurant.name}</h1>
            <p className="text-xs text-zinc-300 mt-0.5">{restaurant.address} • Phone: {restaurant.phone}</p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-white text-xs font-bold flex items-center gap-2 backdrop-blur-md self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Queue
        </button>
      </div>

      {/* Analytics Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-zinc-400 uppercase">Gross Revenue</div>
          <div className="text-2xl font-black text-emerald-400 font-['Outfit']">${stats.gross_total_revenue.toFixed(2)}</div>
        </div>
        <div className="bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-zinc-400 uppercase">Completed Orders</div>
          <div className="text-2xl font-black text-zinc-100 font-['Outfit']">{stats.completed_orders}</div>
        </div>
        <div className="bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-zinc-400 uppercase">Active Kitchen Queue</div>
          <div className="text-2xl font-black text-brand-400 font-['Outfit']">{activeOrders.length}</div>
        </div>
        <div className="bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-zinc-400 uppercase">Avg Order Value</div>
          <div className="text-2xl font-black text-blue-400 font-['Outfit']">${stats.avg_order_value.toFixed(2)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('queue')}
          className={`text-sm font-extrabold pb-2 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'queue' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Live Order Queue ({activeOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`text-sm font-extrabold pb-2 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'menu' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Menu Item Catalog ({menuItems.length})</span>
        </button>
      </div>

      {/* Tab 1: Order Queue */}
      {activeTab === 'queue' ? (
        <div className="space-y-4">
          {activeOrders.length === 0 ? (
            <div className="bg-zinc-900/50 rounded-3xl p-12 text-center text-zinc-500 border border-zinc-800 space-y-2">
              <CheckCircle2 className="w-12 h-12 stroke-1 mx-auto text-emerald-400" />
              <h3 className="font-bold text-zinc-200 text-base font-['Outfit']">Kitchen Queue is Clear!</h3>
              <p className="text-xs text-zinc-400">All incoming orders have been accepted and dispatched.</p>
            </div>
          ) : (
            activeOrders.map((order) => (
              <div key={order.order_id} className="bg-zinc-900/90 p-5 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-zinc-100">Order #{order.order_id}</span>
                      <span className="text-xs font-bold text-zinc-400">• {order.customer_name} ({order.customer_phone})</span>
                    </div>
                    <p className="text-[11px] text-zinc-500">Placed at {new Date(order.created_at).toLocaleTimeString()}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Current: {order.order_status}
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-xs space-y-1">
                  {order.items?.map((item) => (
                    <div key={item.order_item_id} className="flex justify-between font-medium text-zinc-300">
                      <span>{item.name} <span className="font-bold text-zinc-500">x{item.quantity}</span></span>
                      <span>${(item.price_at_order_time * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-zinc-800 flex justify-between font-black text-zinc-100">
                    <span>Total Amount</span>
                    <span className="text-blue-400">${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-zinc-400 mr-2">Update Status:</span>

                  {order.order_status === 'Placed' && (
                    <button
                      onClick={() => handleUpdateStatus(order.order_id, 'Accepted')}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                    >
                      Accept Order
                    </button>
                  )}

                  {(order.order_status === 'Placed' || order.order_status === 'Accepted') && (
                    <button
                      onClick={() => handleUpdateStatus(order.order_id, 'Preparing')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
                    >
                      Mark Preparing
                    </button>
                  )}

                  {order.order_status === 'Preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(order.order_id, 'Ready for Pickup')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                    >
                      Ready for Pickup
                    </button>
                  )}

                  <button
                    onClick={() => handleUpdateStatus(order.order_id, 'Cancelled')}
                    className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/30 ml-auto"
                  >
                    Cancel Order
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      ) : (
        /* Tab 2: Menu CRUD */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-zinc-100 text-base font-['Outfit']">Menu Items Catalog</h3>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <div key={item.item_id} className="bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 shadow-sm flex items-center justify-between gap-4">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-zinc-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.is_veg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <h4 className="font-extrabold text-xs text-zinc-100 truncate">{item.name}</h4>
                  </div>
                  <p className="text-xs font-bold text-blue-400 mt-0.5">${item.price.toFixed(2)}</p>
                  <p className="text-[11px] text-zinc-400">{item.category_name}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-zinc-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMenuItem(item.item_id)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu Item Add/Edit Modal */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-zinc-900 text-zinc-100 rounded-3xl p-6 shadow-2xl space-y-4 border border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-extrabold text-zinc-100 font-['Outfit']">{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
              <button onClick={() => setIsMenuModalOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Truffle Pizza"
                  className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(parseInt(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100"
                >
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="14.99"
                  className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ingredients and details..."
                  className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={isVeg}
                  onChange={(e) => setIsVeg(e.target.checked)}
                  id="vegCheck"
                  className="w-4 h-4 rounded text-emerald-500"
                />
                <label htmlFor="vegCheck" className="font-bold text-zinc-300">Vegetarian Dish</label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md mt-4"
              >
                Save Item
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
