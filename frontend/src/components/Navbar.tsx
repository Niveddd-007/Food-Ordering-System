import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ShoppingBag, User as UserIcon, LogOut, LogIn, ChevronDown, ShieldCheck, Database, Bike, Store, Clock, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal }) => {
  const { user, logout, quickSwitchRole } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleRoleSwitch = async (email: string) => {
    setShowRoleDropdown(false);
    await quickSwitchRole(email);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c0c0e]/90 backdrop-blur-xl border-b border-zinc-800/80 shadow-2xl shadow-black/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Larger Title: QuickBite! */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 via-amber-500 to-brand-600 flex items-center justify-center text-white shadow-glow-orange group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ring-2 ring-brand-500/40">
            <Zap className="w-7 h-7 fill-white text-white animate-pulse-subtle" />
          </div>
          <div className="flex items-baseline">
            <span className="font-black text-3xl sm:text-4xl tracking-tight text-white font-['Outfit'] leading-none">
              Quick<span className="text-gradient-orange">Bite!</span>
            </span>
          </div>
        </Link>

        {/* Navigation & Actions Right Container */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Dashboard Quick Links */}
          {(user?.role === 'admin' || user?.role === 'restaurant_admin') && (
            <Link
              to={user?.role === 'admin' ? '/admin' : '/restaurant-admin'}
              className="px-3.5 py-2 rounded-full text-xs font-bold text-zinc-300 hover:text-brand-400 bg-zinc-900 border border-zinc-800 hover:border-brand-500/40 transition-all flex items-center gap-1.5 shadow-md"
            >
              {user.role === 'admin' ? <Database className="w-4 h-4 text-purple-400" /> : <Store className="w-4 h-4 text-blue-400" />}
              <span className="hidden sm:inline">{user.role === 'admin' ? 'SQL Runner' : 'Restaurant Portal'}</span>
            </Link>
          )}

          {user?.role === 'delivery' && (
            <Link
              to="/delivery"
              className="px-3.5 py-2 rounded-full text-xs font-bold text-zinc-300 hover:text-emerald-400 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 transition-all flex items-center gap-1.5 shadow-md"
            >
              <Bike className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Active Deliveries</span>
            </Link>
          )}

          {user && user.role === 'customer' && (
            <Link
              to="/orders"
              className="px-3 py-2 text-zinc-400 hover:text-brand-400 hover:bg-zinc-800 rounded-full transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Order History"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden md:inline">My Orders</span>
            </Link>
          )}

          {/* Cart Drawer Button */}
          {(!user || user.role === 'customer') && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-full bg-zinc-900 text-brand-400 border border-zinc-800 hover:border-brand-500/40 hover:bg-brand-500 hover:text-white transition-all duration-300 font-bold text-xs flex items-center gap-2 hover:shadow-glow-orange group"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-extrabold">Cart</span>
              {itemCount > 0 && (
                <span className="bg-brand-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-brand-500/50 animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>
          )}

          {/* Sign In Button WITH LOGO ICON / Profile Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-800 transition-colors"
              >
                {user.profile_image_url ? (
                  <img src={user.profile_image_url} alt={user.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/60" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-amber-500 text-white font-extrabold text-xs flex items-center justify-center ring-2 ring-brand-500/40">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 py-2 z-50 animate-in fade-in">
                  <div className="px-4 py-2 border-b border-zinc-800">
                    <div className="font-bold text-sm text-zinc-100 truncate">{user.name}</div>
                    <div className="text-xs text-zinc-400 truncate">{user.email}</div>
                    <span className="inline-block mt-1 text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {user.auth_provider === 'google' ? 'Google Account' : 'Standard Account'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 text-red-400 text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white text-xs font-extrabold shadow-glow-orange hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 text-white" />
              <span>Sign In</span>
            </button>
          )}

          {/* ROLE SWITCHER OPTION PLACED ON THE FAR RIGHTMOST SIDE */}
          <div className="relative pl-1 border-l border-zinc-800">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 transition-all hover:border-brand-500/40 shadow-sm"
              title="Switch user role"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
              <span className="hidden lg:inline text-zinc-400">Role:</span>
              <span className="capitalize text-brand-400 font-extrabold">{user ? user.role.replace('_', ' ') : 'Guest'}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 backdrop-blur-2xl">
                <div className="px-4 py-2 border-b border-zinc-800/80 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">
                  Switch Active Role
                </div>
                <button
                  onClick={() => handleRoleSwitch('customer1@demo.local')}
                  className="w-full text-left px-4 py-2.5 hover:bg-zinc-800/80 flex items-center gap-3 text-xs font-medium text-zinc-200 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-brand-500" />
                  <div>
                    <div className="font-bold">Customer View</div>
                    <div className="text-[10px] text-zinc-400">Browse & Order Food</div>
                  </div>
                </button>
                <button
                  onClick={() => handleRoleSwitch('admin1@demo.local')}
                  className="w-full text-left px-4 py-2.5 hover:bg-zinc-800/80 flex items-center gap-3 text-xs font-medium text-zinc-200 transition-colors"
                >
                  <Store className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-bold">Restaurant Admin</div>
                    <div className="text-[10px] text-zinc-400">Kitchen Queue & Menu CRUD</div>
                  </div>
                </button>
                <button
                  onClick={() => handleRoleSwitch('delivery1@demo.local')}
                  className="w-full text-left px-4 py-2.5 hover:bg-zinc-800/80 flex items-center gap-3 text-xs font-medium text-zinc-200 transition-colors"
                >
                  <Bike className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold">Delivery Driver</div>
                    <div className="text-[10px] text-zinc-400">Courier Dispatch Dashboard</div>
                  </div>
                </button>
                <button
                  onClick={() => handleRoleSwitch('superadmin@demo.local')}
                  className="w-full text-left px-4 py-2.5 hover:bg-zinc-800/80 flex items-center gap-3 text-xs font-medium text-zinc-200 transition-colors"
                >
                  <Database className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-bold">Platform Admin / SQL Showcase</div>
                    <div className="text-[10px] text-zinc-400">Analytics & Live SQL Runner</div>
                  </div>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
