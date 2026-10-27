import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './AuthAdminStore'; // If required for authentication

const apiUrl = import.meta.env.VITE_API_URL; // API base URL

const useProductStore = create((set) => ({
  products: [],
  totalProducts: 0,
  totalProductsAdmin: 0,
  allProductsCount: 0,
  activeCount: 0,
  inactiveCount: 0,
  totalPages: 0,
  currentPage: 1,
  product: null,
  homeProducts: {},
  loading: false,
  error: null,

  // Counts only — must never touch the shared products list state, so the
  // SidebarMenu badge cannot race with the admin product table on reload
  fetchProductsCount: async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/getAllProductsAdmin?page=1&limit=1`,
      );
      const data = response.data || {};
      set({
        totalProductsAdmin: data.totalProducts || 0,
        allProductsCount: data.allProductsCount || 0,
        activeCount: data.activeCount || 0,
        inactiveCount: data.inactiveCount || 0,
      });
    } catch {
      // Count refresh is best-effort; keep last known values
    }
  },
  // ✅ Fetch all products with filters (pagination, sorting, categories, flags, stock)
  fetchProducts: async (params) => {
    set({ loading: true, error: null });

    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(
        `${apiUrl}/getAllProducts?${queryString}`,
      );

      set({
        products: response.data.products || [],
        totalProducts: response.data.totalProducts || 0,
        totalPages: response.data.totalPages || 0,
        currentPage: response.data.currentPage || 1,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch products',
        loading: false,
      });
    }
  },

  fetchProductsAdmin: async (params) => {
    set({ loading: true, error: null });

    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(
        `${apiUrl}/getAllProductsAdmin?${queryString}`,
      );

      set({
        products: response.data.products || [],
        totalProductsAdmin: response.data.totalProducts || 0,
        allProductsCount: response.data.allProductsCount || 0,
        activeCount: response.data.activeCount || 0,
        inactiveCount: response.data.inactiveCount || 0,
        totalPages: response.data.totalPages || 0,
        currentPage: response.data.currentPage || 1,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch products',
        loading: false,
      });
    }
  },

  // ✅ Fetch a single product by ID
  fetchProductById: async (id) => {
    set({ loading: true, error: null });

    try {
      const response = await axios.get(`${apiUrl}/products/${id}`);
      set({ product: response.data || null, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch product',
        loading: false,
      });
    }
  },

  // ✅ Fetch a product by slug
  fetchProductBySlug: async (slug) => {
    set({ loading: true, error: null });

    try {
      const response = await axios.get(`${apiUrl}/products/slug/${slug}`);
      set({ product: response.data.data || null, loading: false });
    } catch (error) {
      set({
        error:
          error.response?.data?.message || 'Failed to fetch product by slug',
        loading: false,
      });
    }
  },

  resetProduct: () => set({ product: null, loading: false, error: null }),

  // ✅ Update an existing product
  updateProduct: async (id, data) => {
    set({ loading: true, error: null });

    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('Unauthorized: No token found');

      const response = await axios.put(`${apiUrl}/products/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = response.data?.data || response.data;
      set((state) => ({
        products: state.products.map((prod) =>
          prod._id === id ? updated : prod,
        ),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update product',
        loading: false,
      });
    }
  },

  // ✅ Delete a product
  deleteProduct: async (id) => {
    set({ loading: true, error: null });

    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('Unauthorized: No token found');

      await axios.delete(`${apiUrl}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set((state) => ({
        products: state.products.filter((prod) => prod._id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete product',
        loading: false,
      });
    }
  },

  duplicateProduct: async (id) => {
    set({ loading: true, error: null });

    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('Unauthorized: No token found');

      await axios.post(
        `${apiUrl}/products/${id}/duplicate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      set({ loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to duplicate product',
        loading: false,
      });
      throw error;
    }
  },

  fetchHomeProducts: async () => {
    set({ loading: true, error: null });

    try {
      const response = await axios.get(`${apiUrl}/homepageproducts`);
      set({ homeProducts: response.data.data || {}, loading: false });
    } catch (error) {
      set({
        error:
          error.response?.data?.message || 'Failed to fetch homepage products',
        loading: false,
      });
    }
  },
}));

export default useProductStore;
