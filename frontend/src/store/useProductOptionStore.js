import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './AuthAdminStore.js'; // Import auth store

const apiUrl = import.meta.env.VITE_API_URL;

const useProductOptionStore = create((set) => ({
  productOptions: [],
  loading: false,
  error: null,
  selectedProductOption: null,

  // Fetch all product options
  fetchProductOptions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${apiUrl}/product-options`);

      // Adjust to handle the structure of the API response
      if (response.data?.productOptions) {
        set({ productOptions: response.data.productOptions, loading: false });
      } else {
        throw new Error('Product options not found in the response');
      }
    } catch (error) {
      console.error('Error fetching product options:', error);
      set({
        error:
          error.response?.data?.message || 'Failed to fetch product options',
        loading: false,
      });
    }
  },

  // Fetch product option by ID
  fetchProductOptionById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${apiUrl}/product-options/${id}`);
      if (response.data?.productOption) {
        set({
          selectedProductOption: response.data.productOption,
          loading: false,
        });
      } else {
        throw new Error('Product option not found');
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message || 'Failed to fetch product option',
        loading: false,
      });
    }
  },

  // Create a new product option
  createProductOption: async (data) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('Unauthorized: No token found');

      const response = await axios.post(`${apiUrl}/product-options`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        productOptions: [...state.productOptions, response.data.productOption],
        loading: false,
      }));
    } catch (error) {
      set({
        error:
          error.response?.data?.message || 'Failed to create product option',
        loading: false,
      });
    }
  },

  // Update product option
  updateProductOption: async (id, data) => {
    set({ loading: true, error: null });

    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('Unauthorized: No token found');

      console.log('Sending data to backend:', data); // Log the data

      // Send the PUT request to the backend
      const response = await axios.put(
        `${apiUrl}/product-options/${id}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Log the response to see what is returned from the backend
      console.log('Response from backend:', response.data);

      set((state) => ({
        productOptions: state.productOptions.map((option) =>
          option._id === id ? response.data.productOption : option,
        ),
        selectedProductOption: response.data.productOption,
        loading: false,
      }));
    } catch (error) {
      console.error('Error updating product option:', error); // Log the error
      set({
        error:
          error.response?.data?.message || 'Failed to update product option',
        loading: false,
      });
    }
  },

  // Delete a product option by ID
  deleteProductOption: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('Unauthorized: No token found');

      await axios.delete(`${apiUrl}/product-options/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        productOptions: state.productOptions.filter(
          (option) => option._id !== id,
        ),
        loading: false,
      }));
    } catch (error) {
      set({
        error:
          error.response?.data?.message || 'Failed to delete product option',
        loading: false,
      });
    }
  },
}));

export default useProductOptionStore;
