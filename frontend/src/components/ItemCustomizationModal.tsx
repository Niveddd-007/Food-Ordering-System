import React, { useState } from 'react';
import { X, Plus, Minus, Check, Flame, Sparkles } from 'lucide-react';
import { MenuItem, MenuItemVariant, MenuItemAddon } from '../types';

interface ItemCustomizationModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: { item_id: number; quantity: number; variant: MenuItemVariant | null; addons: MenuItemAddon[] }) => void;
}

export const ItemCustomizationModal: React.FC<ItemCustomizationModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !item) return null;

  const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | null>(
    item.variants && item.variants.length > 0 ? item.variants[0] : null
  );
  const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);
  const [quantity, setQuantity] = useState(1);

  const toggleAddon = (addon: MenuItemAddon) => {
    if (selectedAddons.some((a) => a.addon_id === addon.addon_id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.addon_id !== addon.addon_id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const unitPrice =
    item.price +
    (selectedVariant ? Number(selectedVariant.price_adjustment) : 0) +
    selectedAddons.reduce((sum, a) => sum + Number(a.price), 0);

  const totalPrice = +(unitPrice * quantity).toFixed(2);

  const handleAdd = () => {
    onConfirm({
      item_id: item.item_id,
      quantity,
      variant: selectedVariant,
      addons: selectedAddons,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Image & Title */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-zinc-950">
          <img
            src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-zinc-300 hover:text-white transition-all backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-1">
              {item.is_veg ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">VEG</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">NON-VEG</span>
              )}
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-brand-500" /> Custom Gourmet Options
              </span>
            </div>
            <h3 className="text-xl font-black text-white">{item.name}</h3>
            <p className="text-xs text-zinc-300 line-clamp-1 mt-0.5">{item.description}</p>
          </div>
        </div>

        {/* Scrollable Customization Options */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Variants (Sizes / Portions) */}
          {item.variants && item.variants.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" /> Choose Size / Portion
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-semibold border border-brand-500/20">
                  Required
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {item.variants.map((v) => {
                  const isSelected = selectedVariant?.variant_id === v.variant_id;
                  return (
                    <button
                      key={v.variant_id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-brand-500/15 border-brand-500 text-white shadow-lg shadow-brand-500/10'
                          : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{v.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1">
                        {v.price_adjustment > 0 ? `+$${Number(v.price_adjustment).toFixed(2)}` : 'Base price'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons (Toppings & Extras) */}
          {item.addons && item.addons.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-brand-500" /> Extra Toppings & Dips
                </h4>
                <span className="text-[10px] text-zinc-500">Optional</span>
              </div>
              <div className="space-y-2">
                {item.addons.map((addon) => {
                  const isSelected = selectedAddons.some((a) => a.addon_id === addon.addon_id);
                  return (
                    <div
                      key={addon.addon_id}
                      onClick={() => toggleAddon(addon)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand-500/10 border-brand-500/60 text-white'
                          : 'bg-zinc-800/40 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                            isSelected ? 'bg-brand-500 border-brand-500 text-white' : 'border-zinc-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <span className="text-xs font-medium">{addon.name}</span>
                      </div>
                      <span className="text-xs font-bold text-brand-400">+${Number(addon.price).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Quantity & Add Button */}
        <div className="p-4 sm:p-6 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-1 rounded-full hover:bg-zinc-800 disabled:opacity-30 text-zinc-300 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-bold text-white px-1">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 rounded-full hover:bg-zinc-800 text-zinc-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 py-3 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center justify-between"
          >
            <span>Add Customized Item</span>
            <span className="font-black text-base">${totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
