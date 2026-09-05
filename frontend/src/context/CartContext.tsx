import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart } from '../types';
import { api } from '../api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  refreshCart: () => Promise<void>;
  addToCart: (itemId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const refreshCart = async () => {
    if (!user || user.role !== 'customer') {
      setCart(null);
      return;
    }
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (itemId: number, quantity: number = 1) => {
    if (!user) throw new Error('Please sign in to add items to your cart');
    await api.addToCart(itemId, quantity);
    await refreshCart();
    setIsCartOpen(true);
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    await api.updateCartItem(cartItemId, quantity);
    await refreshCart();
  };

  const removeItem = async (cartItemId: number) => {
    await api.removeCartItem(cartItemId);
    await refreshCart();
  };

  const clearCart = async () => {
    await api.clearCart();
    await refreshCart();
  };

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isCartOpen,
        setIsCartOpen,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
