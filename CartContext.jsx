import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setCartItems(data.items || data.cart?.items || data || []);
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const requireAuth = () => {
    if (!user) {
      toast.error('Please login to continue');
      return false;
    }
    return true;
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!requireAuth()) return;
    try {
      const { data } = await api.post('/cart/add', { productId, quantity });
      setCartItems(data.items || data.cart?.items || data || []);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    if (!requireAuth()) return;
    try {
      const { data } = await api.put(`/cart/update/${itemId}`, { quantity });
      setCartItems(data.items || data.cart?.items || data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart');
    }
  };

  const removeFromCart = async (itemId) => {
    if (!requireAuth()) return;
    try {
      const { data } = await api.delete(`/cart/remove/${itemId}`);
      setCartItems(data.items || data.cart?.items || data || []);
      toast.success('Removed from cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!requireAuth()) return;
    try {
      await api.delete('/cart/clear');
      setCartItems([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clear cart');
    }
  };

  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
    : 0;

  const cartTotal = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => {
        const price = item.product?.price || item.price || 0;
        return sum + price * (item.quantity || 1);
      }, 0)
    : 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        cartCount,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export default CartContext;
