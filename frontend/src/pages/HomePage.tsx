import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Clock, Heart, SlidersHorizontal, MapPin, Zap, ArrowRight, Tag, Flame } from 'lucide-react';
import { api } from '../api';
import { Restaurant, Cuisine } from '../types';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'delivery_time'>('rating');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [selectedCuisine, searchQuery, sortBy]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [restData, cuisineData] = await Promise.all([
        api.getRestaurants({
          search: searchQuery || undefined,
          cuisine_id: selectedCuisine || undefined,
          sort_by: sortBy,
        }),
        api.getCuisines(),
      ]);
      setRestaurants(restData);
      setCuisines(cuisineData);

      if (user && user.role === 'customer') {
        const favs = await api.getFavorites();
        setFavorites(favs.map(f => f.restaurant_id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFav = async (e: React.MouseEvent, restaurantId: number) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const res = await api.toggleFavorite(restaurantId);
      if (res.is_favorite) {
        setFavorites([...favorites, restaurantId]);
      } else {
        setFavorites(favorites.filter(id => id !== restaurantId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 pb-24 space-y-10">
      
      {/* Hero Banner Section */}
      <section className="relative pt-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Background Glow Spheres */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Hero Content Left */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-brand-500/30 text-brand-400 text-xs font-extrabold shadow-glow-orange animate-bounce">
              <Flame className="w-4 h-4 text-brand-500 fill-brand-500" />
              <span>#1 Food Delivery App • QuickBite!</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] font-['Outfit']">
              Discover <span className="text-gradient-orange">Delicious Food</span> Delivered to Your Door
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Explore a variety of delicious foods, pick your favorite dishes, and enjoy lightning-fast food delivery right to your doorstep.
            </p>

            {/* Glowing Search Bar */}
            <div className="pt-2 max-w-xl mx-auto lg:mx-0">
              <div className="relative flex items-center bg-zinc-900/90 rounded-2xl p-2 border border-zinc-800 focus-within:border-brand-500 shadow-2xl focus-within:shadow-glow-orange transition-all duration-300">
                <MapPin className="w-5 h-5 text-brand-500 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dish, restaurant, cuisine..."
                  className="w-full pl-3 pr-4 py-3 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none bg-transparent"
                />
                <button
                  onClick={loadData}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-glow-orange transition-all shrink-0 flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Floating Tags */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium">#Delicious</span>
              <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium">#Fresh</span>
              <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium">#FastDelivery</span>
              <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 font-bold">#QuickBite</span>
            </div>

          </div>

          {/* Hero Feature Card Right */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl p-6 bg-gradient-to-br from-brand-600 via-brand-500 to-amber-600 text-white shadow-2xl shadow-brand-500/30 border border-brand-400/40 overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
              
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-amber-300 border border-amber-300/30">
                Weekend Special
              </div>

              <div className="space-y-4 relative z-10 max-w-[65%]">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
                  Exclusive Offers
                </span>
                <h3 className="text-2xl sm:text-3xl font-black leading-tight font-['Outfit']">
                  Get Special Offers Up to <span className="text-amber-300">30% OFF</span>
                </h3>
                <p className="text-xs text-brand-100">Order from top rated local restaurants now!</p>
                <button
                  onClick={() => setSelectedCuisine(null)}
                  className="px-5 py-2.5 rounded-xl bg-black text-white font-extrabold text-xs shadow-lg hover:bg-zinc-900 transition-all flex items-center gap-2 group-hover:translate-x-1"
                >
                  <span>Get Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <img
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80"
                alt="Delicious Pizza Offer"
                className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full object-cover shadow-2xl border-4 border-white/20 group-hover:rotate-12 transition-transform duration-700"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Main Catalog Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Explore Categories Pills Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-zinc-100 font-['Outfit'] flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-500 fill-brand-500" />
              <span>Explore Categories</span>
            </h2>
            <button
              onClick={() => setSelectedCuisine(null)}
              className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
            >
              See All →
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
            <button
              onClick={() => setSelectedCuisine(null)}
              className={`px-5 py-3 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all duration-300 flex items-center gap-2.5 ${
                selectedCuisine === null
                  ? 'bg-gradient-to-r from-brand-500 to-amber-500 text-white shadow-glow-orange scale-105'
                  : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>All Food</span>
            </button>

            {cuisines.map((c) => (
              <button
                key={c.cuisine_id}
                onClick={() => setSelectedCuisine(selectedCuisine === c.cuisine_id ? null : c.cuisine_id)}
                className={`px-5 py-3 rounded-2xl text-xs font-extrabold whitespace-nowrap flex items-center gap-2.5 transition-all duration-300 ${
                  selectedCuisine === c.cuisine_id
                    ? 'bg-gradient-to-r from-brand-500 to-amber-500 text-white shadow-glow-orange scale-105'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {c.image_url && <img src={c.image_url} alt={c.name} className="w-5 h-5 rounded-full object-cover" />}
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-800/80 pt-6">
          <div>
            <h2 className="text-2xl font-black text-zinc-100 font-['Outfit']">Popular Restaurants & Dishes</h2>
            <p className="text-xs text-zinc-400">{restaurants.length} top places available for QuickBite! delivery</p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-2xl border border-zinc-800 text-xs text-zinc-300 self-start sm:self-auto">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
            <span className="font-semibold text-zinc-400">Sort By:</span>
            <button
              onClick={() => setSortBy('rating')}
              className={`font-bold transition-colors ${sortBy === 'rating' ? 'text-brand-400' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              Top Rated
            </button>
            <span className="text-zinc-700">•</span>
            <button
              onClick={() => setSortBy('delivery_time')}
              className={`font-bold transition-colors ${sortBy === 'delivery_time' ? 'text-brand-400' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              Fastest Delivery
            </button>
          </div>
        </div>

        {/* Restaurant Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-zinc-900 rounded-3xl p-4 border border-zinc-800 space-y-4 animate-pulse">
                <div className="w-full h-48 bg-zinc-800 rounded-2xl" />
                <div className="h-4 bg-zinc-800 rounded w-2/3" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-zinc-900/50 rounded-3xl p-12 text-center text-zinc-500 border border-zinc-800 space-y-3">
            <Search className="w-12 h-12 stroke-1 mx-auto text-zinc-600" />
            <h3 className="font-bold text-zinc-200 text-base">No restaurants match your search</h3>
            <p className="text-xs text-zinc-400">Try clearing your search query or selecting a different category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => {
              const isFav = favorites.includes(restaurant.restaurant_id);

              return (
                <div
                  key={restaurant.restaurant_id}
                  onClick={() => navigate(`/restaurant/${restaurant.restaurant_id}`)}
                  className="group bg-zinc-900/90 rounded-3xl border border-zinc-800/90 hover:border-brand-500/50 shadow-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow-orange"
                >
                  
                  {/* Cover Image */}
                  <div className="relative h-52 overflow-hidden bg-zinc-950">
                    <img
                      src={restaurant.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

                    <div className="absolute top-3 left-3 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>20% OFF</span>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-zinc-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-zinc-200 border border-zinc-700/60 shadow-md flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-500" />
                      <span>{restaurant.delivery_time_mins} mins</span>
                    </div>

                    {user && user.role === 'customer' && (
                      <button
                        onClick={(e) => handleToggleFav(e, restaurant.restaurant_id)}
                        className="absolute top-3 right-3 p-2.5 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-700/60 text-zinc-400 hover:text-red-500 transition-all active:scale-90"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-black text-lg text-zinc-100 group-hover:text-brand-400 transition-colors truncate font-['Outfit']">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-black text-amber-300">{restaurant.avg_rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{restaurant.description}</p>

                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-400 truncate max-w-[180px]">
                        {restaurant.cuisines?.join(', ')}
                      </span>
                      <span className="font-extrabold text-brand-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Menu <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
