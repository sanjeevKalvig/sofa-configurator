import React, { createContext, useContext, useState, useEffect } from 'react';
import { ensureGuestCartId, getGuestCartItems } from '../lib/magento';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartId, setCartId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const loadCart = async () => {
    try {
      const id = await ensureGuestCartId();
      setCartId(id);
      const items = await getGuestCartItems(id);
      setCartItems(Array.isArray(items) ? items : []);
      
      // Calculate total items count
      const total = items.reduce((sum, item) => sum + (item.qty || 0), 0);
      setCartCount(total);
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const refreshCart = async () => {
    if (!cartId) return;
    try {
      const items = await getGuestCartItems(cartId);
      setCartItems(Array.isArray(items) ? items : []);
      const total = items.reduce((sum, item) => sum + (item.qty || 0), 0);
      setCartCount(total);
    } catch (error) {
      console.error('Failed to refresh cart:', error);
    }
  };

  // Load cart on app start
  useEffect(() => {
    loadCart();
  }, []);

  const value = {
    cartId,
    cartItems,
    cartCount,
    refreshCart,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}