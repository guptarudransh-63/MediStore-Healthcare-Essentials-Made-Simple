import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('medistore_user') || 'null'),
  token: localStorage.getItem('medistore_token') || null,
  isAuthenticated: !!localStorage.getItem('medistore_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('medistore_token', token);
      localStorage.setItem('medistore_user', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;

      localStorage.setItem('medistore_token', token);
      localStorage.setItem('medistore_user', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  logout: () => {
    localStorage.removeItem('medistore_token');
    localStorage.removeItem('medistore_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null
    });
  },

  fetchProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.user;
      localStorage.setItem('medistore_user', JSON.stringify(user));
      set({ user });
    } catch (err) {
      get().logout();
    }
  }
}));
