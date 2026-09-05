import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, Phone, Plus, ArrowLeft, Check, Leaf, Tag, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import { Restaurant, MenuCategory, MenuItem } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const RestaurantPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');
  const [vegOnlyFilter, setVegOnlyFilter] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [addedItemIds, setAddedItemIds] = useState<Record<number, boolean>>({});

  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadMenu(parseInt(id));
    }
  }, [id]);

  const loadMenu = async (restaurantId: number) => {
    setLoading(true);
    try {
      const data = await api.getRestaurantDetails(restaurantId);
      setRestaurant(data.restaurant);
      setCategories(data.categories);
      setReviews(data.reviews);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item: MenuItem) => {
    try {
      await addToCart(item.item_id, 1);
      setAddedItemIds({ ...addedItemIds, [item.item_id]: true });
      setTimeout(() => {
        setAddedItemIds(prev => ({ ...prev, [item.item_id]: false }));
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Please sign in to add items to cart');
    }
  };

  if (loading || !restaurant) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-zinc-500">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-zinc-900 rounded-3xl border border-zinc-800" />
          <div className="h-8 bg-zinc-900 rounded w-1/3 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 pb-24">
      
      {/* Restaurant Hero Banner */}
      <div className="relative h-80 bg-zinc-950 overflow-hidden">
        <img
          src={restaurant.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-40 blur-[1px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/70 to-transparent" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-between py-6 relative z-10">
          
          <button
            onClick={() => navigate('/')}
            className="self-start px-3.5 py-1.5 rounded-full bg-zinc-900/80 backdrop-blur-md text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700/60 transition-all text-xs font-semibold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to QuickBite! Home
          </button>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3" /> 20% OFF Applied
              </span>
              <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                {restaurant.cuisines?.join(' • ')}
              </span>
              <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-black">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {restaurant.avg_rating.toFixed(1)} (120+ reviews)
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white font-['Outfit']">{restaurant.name}</h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">{restaurant.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span>{restaurant.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-500" />
                <span>{restaurant.delivery_time_mins} mins delivery time</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-brand-500" />
                <span>{restaurant.phone}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Navigation Tabs & Veg Switch */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('menu')}
              className={`text-sm font-extrabold pb-2 border-b-2 transition-colors ${
                activeTab === 'menu'
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Order Dishes
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`text-sm font-extrabold pb-2 border-b-2 transition-colors ${
                activeTab === 'reviews'
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Customer Ratings ({reviews.length})
            </button>
          </div>

          {activeTab === 'menu' && (
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-extrabold text-zinc-300 bg-zinc-900 px-3.5 py-1.5 rounded-full border border-zinc-800">
              <input
                type="checkbox"
                checked={vegOnlyFilter}
                onChange={(e) => setVegOnlyFilter(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-zinc-950 border-zinc-700"
              />
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>Veg Only</span>
            </label>
          )}

        </div>

        {/* Tab 1: Menu Items */}
        {activeTab === 'menu' ? (
          <div className="space-y-10">
            {categories.map((cat) => {
              const filteredItems = vegOnlyFilter ? cat.items.filter(i => i.is_veg) : cat.items;
              if (filteredItems.length === 0) return null;

              return (
                <div key={cat.category_id} className="space-y-4">
                  <h3 className="text-lg font-black text-zinc-100 font-['Outfit'] flex items-center gap-2">
                    <span>{cat.name}</span>
                    <span className="text-xs font-bold text-zinc-500">({filteredItems.length})</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredItems.map((item) => (
                      <div
                        key={item.item_id}
                        className="bg-zinc-900/90 p-4 rounded-3xl border border-zinc-800/90 hover:border-brand-500/40 shadow-xl flex items-center justify-between gap-4 transition-all duration-300 hover:shadow-glow-orange group"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center ${item.is_veg ? 'border-emerald-500' : 'border-red-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.is_veg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            </span>
                            <h4 className="font-extrabold text-sm text-zinc-100 group-hover:text-brand-400 transition-colors truncate">
                              {item.name}
                            </h4>
                          </div>

                          <p className="text-xs font-black text-brand-400">${item.price.toFixed(2)}</p>
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>

                        {/* Image Thumbnail & Add Button */}
                        <div className="relative shrink-0 flex flex-col items-center">
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'}
                            alt={item.name}
                            className="w-24 h-24 rounded-2xl object-cover border border-zinc-800"
                          />
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={!item.is_available}
                            className={`-mt-4 px-4 py-2 rounded-xl font-extrabold text-xs shadow-lg transition-all flex items-center gap-1.5 ${
                              addedItemIds[item.item_id]
                                ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                                : item.is_available
                                ? 'bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white shadow-glow-orange hover:scale-105'
                                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                            }`}
                          >
                            {addedItemIds[item.item_id] ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : item.is_available ? (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Item</span>
                              </>
                            ) : (
                              'Sold Out'
                            )}
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Tab 2: Customer Reviews */
          <div className="space-y-4 max-w-2xl">
            {reviews.length === 0 ? (
              <p className="text-zinc-500 text-xs py-6">No customer reviews recorded yet for this restaurant.</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.review_id} className="bg-zinc-900/90 p-5 rounded-3xl border border-zinc-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {rev.profile_image_url ? (
                        <img src={rev.profile_image_url} alt={rev.customer_name} className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/40" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-amber-500 text-white font-bold text-xs flex items-center justify-center">
                          {rev.customer_name.charAt(0)}
                        </div>
                      )}
                      <span className="font-extrabold text-xs text-zinc-100">{rev.customer_name}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-black text-amber-300">{rev.rating}</span>
                    </div>
                  </div>
                  {rev.comment && <p className="text-xs text-zinc-300 italic leading-relaxed">"{rev.comment}"</p>}
                  <p className="text-[10px] text-zinc-500">{new Date(rev.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};
