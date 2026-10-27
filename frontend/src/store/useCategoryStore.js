import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './AuthAdminStore.js'; // Import auth store

const apiUrl = import.meta.env.VITE_API_URL;

const useCategoryStore = create((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${apiUrl}/category`);
      set({ categories: response.data.categories || [], loading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({
        error: error.response?.data?.message || 'Failed to fetch categories',
        loading: false,
      });
    }
  },

  fetchCategoryById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${apiUrl}/category/${id}`);
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch category',
        loading: false,
      });
      return null;
    }
  },

  createCategory: async (data) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('Unauthorized: No token found');

      const response = await axios.post(`${apiUrl}/category`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Backend returns { message, category } — use the data field
      const created = response.data?.category;
      set((state) => ({
        categories: created ? [...state.categories, created] : state.categories,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create category',
        loading: false,
      });
    }
  },

  updateCategory: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('Unauthorized: No token found');

      const response = await axios.put(`${apiUrl}/category/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = response.data?.category;
      if (updated) {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat._id === id ? updated : cat,
          ),
          loading: false,
        }));
      } else {
        set({ loading: false });
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update category',
        loading: false,
      });
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('Unauthorized: No token found');

      await axios.delete(`${apiUrl}/category/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        categories: state.categories.filter((cat) => cat._id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete category',
        loading: false,
      });
    }
  },
}));

export default useCategoryStore;
