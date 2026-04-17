import { create } from 'zustand';
import axiosClient from '../api/axiosClient';

const useQuotationStore = create((set) => ({
  quotations: [],
  currentQuotation: null,
  loading: false,
  error: null,

  fetchQuotations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosClient.get('quotations/');
      const listData = response.data.results !== undefined ? response.data.results : response.data;
      set({ quotations: listData, loading: false });
    } catch (err) {
      set({ error: err.response?.data || 'Failed to fetch quotations', loading: false });
    }
  },

  fetchQuotationById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosClient.get(`quotations/${id}/`);
      set({ currentQuotation: response.data, loading: false });
      return response.data;
    } catch (err) {
      set({ error: err.response?.data || 'Failed to fetch quotation', loading: false });
      throw err;
    }
  },

  createQuotation: async (quotationData) => {
    try {
      const response = await axiosClient.post('quotations/', quotationData);
      set((state) => ({ quotations: [response.data, ...state.quotations] }));
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  updateQuotation: async (id, quotationData) => {
    try {
      const response = await axiosClient.put(`quotations/${id}/`, quotationData);
      set((state) => ({
        quotations: state.quotations.map((q) => (q.id === id ? response.data : q)),
        currentQuotation: response.data
      }));
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  deleteQuotation: async (id) => {
    try {
      await axiosClient.delete(`quotations/${id}/`);
      set((state) => ({
        quotations: state.quotations.filter((q) => q.id !== id)
      }));
    } catch (err) {
      throw err;
    }
  }
}));

export default useQuotationStore;
