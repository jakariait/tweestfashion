import { create } from 'zustand';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const useWishlistStore = create((set, get) => ({
  wishlist: [],
  loading: false,
  removing: false,
  error: null,
  initialized: false,

  getWishlist: async () => {
    const token = localStorage.getItem('user_token');
    if (!token) return;

    set({ loading: true, error: null });

    try {
      const res = await axios.get(`${apiUrl}/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({
        wishlist: res.data?.wishlist?.items || [],
        loading: false,
        initialized: true,
      });
    } catch (error) {
      set({
        error: error?.response?.data?.message || 'Failed to fetch wishlist',
        loading: false,
        initialized: true,
      });
    }
  },

  addToWishlist: async (productId) => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      return { success: false, message: 'Please login to add to wishlist' };
    }

    const previousWishlist = get().wishlist;
    set({ removing: true, error: null });

    try {
      const res = await axios.post(
        `${apiUrl}/wishlist/add`,
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      set({
        wishlist: res.data?.wishlist?.items || [],
        removing: false,
      });

      return { success: true, message: res.data?.message };
    } catch (error) {
      set({ wishlist: previousWishlist, removing: false });
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to add to wishlist',
      };
    }
  },

  removeFromWishlist: async (productId) => {
    const token = localStorage.getItem('user_token');
    if (!token) return;

    const previousWishlist = get().wishlist;
    set({ removing: true, error: null });

    try {
      const res = await axios.delete(`${apiUrl}/wishlist/remove`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { productId },
      });

      set({
        wishlist: res.data?.wishlist?.items || [],
        removing: false,
      });

      return { success: true, message: res.data?.message };
    } catch (error) {
      set({ wishlist: previousWishlist, removing: false });
      return {
        success: false,
        message:
          error?.response?.data?.message || 'Failed to remove from wishlist',
      };
    }
  },

  clearWishlist: async () => {
    const token = localStorage.getItem('user_token');
    if (!token) return;

    set({ removing: true, error: null });

    try {
      const res = await axios.delete(`${apiUrl}/wishlist/clear`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({
        wishlist: [],
        removing: false,
      });

      return { success: true, message: res.data?.message };
    } catch (error) {
      set({ removing: false });
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to clear wishlist',
      };
    }
  },

  isInWishlist: (productId) => {
    return get().wishlist.some(
      (item) => item.product?._id === productId || item.product === productId,
    );
  },

  setWishlist: (items) => {
    set({ wishlist: items, loading: false, removing: false });
  },

  initialize: async () => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      set({ initialized: true });
      return;
    }

    await get().getWishlist();
  },
}));

export default useWishlistStore;
