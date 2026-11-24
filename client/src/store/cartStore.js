import { create } from 'zustand';
import api from '../services/api';

export const useCartStore = create((set, get) => ({
  cart: {
    items: [],
    subtotal: 0,
    taxTotal: 0,
    deliveryCharge: 0,
    grandTotal: 0,
    hasPrescriptionRequiredItems: false,
    hasOutOfStockItems: false
  },
  isLoading: false,
  error: null,

  fetchCart: async () => {
    // Only fetch if authenticated
    if (!localStorage.getItem('medistore_token')) return;

    set({ isLoading: true });
    try {
      const res = await api.get('/cart');
      set({ cart: res.data.cart, isLoading: false, error: null });
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || 'Failed to fetch cart' });
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/cart/items', { productId, quantity });
      set({ cart: res.data.cart, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Could not add product to cart';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  updateQuantity: async (productId, quantity) => {
    try {
      const res = await api.patch(`/cart/items/${productId}`, { quantity });
      set({ cart: res.data.cart });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update quantity';
      return { success: false, error: message };
    }
  },

  removeItem: async (productId) => {
    try {
      const res = await api.delete(`/cart/items/${productId}`);
      set({ cart: res.data.cart });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to remove item' };
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart');
      set({
        cart: {
          items: [],
          subtotal: 0,
          taxTotal: 0,
          deliveryCharge: 0,
          grandTotal: 0,
          hasPrescriptionRequiredItems: false,
          hasOutOfStockItems: false
        }
      });
    } catch (err) {
      console.error(err);
    }
  }
}));
