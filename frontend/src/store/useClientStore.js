import { create } from 'zustand';
import axiosClient from '../api/axiosClient';

const useClientStore = create((set) => ({
  clients: [],
  loading: false,
  error: null,

  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosClient.get('clients/');
      const listData = response.data.results !== undefined ? response.data.results : response.data;
      set({ clients: listData, loading: false });
    } catch (err) {
      set({ error: err.response?.data || 'Failed to fetch clients', loading: false });
    }
  },

  addClient: async (clientData) => {
    try {
      const response = await axiosClient.post('clients/', clientData);
      set((state) => ({ clients: [...state.clients, response.data] }));
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  updateClient: async (id, clientData) => {
    try {
      const response = await axiosClient.put(`clients/${id}/`, clientData);
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? response.data : c))
      }));
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  updateClient: async (id, clientData) => {
    try {
      const response = await axiosClient.put(`clients/${id}/`, clientData);
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? response.data : c))
      }));
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  deleteClient: async (id) => {
    try {
      await axiosClient.delete(`clients/${id}/`);
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id)
      }));
    } catch (err) {
      throw err;
    }
  }
}));

export default useClientStore;
