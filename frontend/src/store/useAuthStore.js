import { create } from 'zustand';
import axiosClient from '../api/axiosClient';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  login: async (username, password) => {
    const response = await axiosClient.post('auth/login/', { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Fetch profile
    const profileRes = await axiosClient.get('auth/profile/');
    set({ user: profileRes.data, isAuthenticated: true });
  },

  register: async (userData) => {
    await axiosClient.post('auth/register/', userData);
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const response = await axiosClient.get('auth/profile/');
      set({ user: response.data, isAuthenticated: true, loading: false });
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false, loading: false });
    }
  }
}));

export default useAuthStore;
