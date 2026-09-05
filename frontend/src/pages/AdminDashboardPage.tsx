import React from 'react';
import { Database, Server, Users, Store, ShoppingBag, Zap } from 'lucide-react';
import { SqlShowcase } from '../components/SqlShowcase';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-zinc-100">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-zinc-950 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-purple-500/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
              QuickBite! DBMS Suite
            </div>
            <h1 className="text-2xl font-black font-['Outfit']">Platform & Relational Schema Administrator</h1>
            <p className="text-xs text-zinc-400 mt-0.5">3NF Normalized SQLite Engine • 16 Tables • Views & Triggers</p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-200 text-xs font-bold self-start sm:self-auto flex items-center gap-2">
          <Server className="w-4 h-4 text-purple-400" />
          <span>Engine Status: Active (WAL Mode)</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-400">Total Users</div>
            <div className="text-2xl font-black text-zinc-100 font-['Outfit']">10</div>
          </div>
        </div>

        <div className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-400">Restaurants</div>
            <div className="text-2xl font-black text-zinc-100 font-['Outfit']">5</div>
          </div>
        </div>

        <div className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-400">Total Orders</div>
            <div className="text-2xl font-black text-zinc-100 font-['Outfit']">5</div>
          </div>
        </div>

        <div className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-400">Active Tables</div>
            <div className="text-2xl font-black text-purple-400 font-['Outfit']">16</div>
          </div>
        </div>
      </div>

      {/* Live Interactive SQL Query Showcase Component */}
      <SqlShowcase />

    </div>
  );
};
